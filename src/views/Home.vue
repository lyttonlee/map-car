<template>
  <div class="page home">
    <div id="map" class="page"></div>
    <!-- <div class="search">
      <el-input size="small" placeholder="请输入要查询的车辆"></el-input>
    </div> -->
    <div class="switch" @click="toggleShowSide">
      <zx-icon :type="showSide ? 'zx-guanbi1' : 'zx-Group-'" />
    </div>
    <div class="list" v-if="showSide">
      <!-- <h4>车辆列表可收缩</h4>
      <h5>点击车辆会显示车辆的详细信息以及返修的过程记录</h5>
      <h5>点击地图上的车辆和列表的效果应一致,效果类似于轨迹记录</h5> -->
      <CarList ref="carlist" @changeShowingMarkers="changeShowingMarkers" v-if="bindCars.length > 0" @showCarInfo="showCarInfo" :cars="bindCars" />
    </div>
    <CarInfo :car="showingCar" @close="closeInfo" v-if="isShowing" />
    <!-- <RepairTrack ref="repairTrack" /> -->
  </div>
</template>

<script>
/* eslint-disable no-undef */
// import imgMap from '../assets/img/office-map.png'
import successCar from '../assets/img/car-blue.png'
import errorCar from '../assets/img/car-red.png'
import warnCar from '../assets/img/car-yellow.png'
import {
  initCarSize
} from '../config/config'
import {
  getBindList,
  queryCars,
  getSpecicalFence,
} from '../api/vq'
import {
  mapState,
  mapActions,
  mapGetters,
} from 'vuex'
// import RepairTrack from '../components/RepairTrack'
import CarInfo from '@/components/CarInfo'
import CarList from '@/components/CarList'
export default {
  name: 'home',
  components: {
    // HelloWorld
    // RepairTrack: () => import('../components/RepairTrack')
    // RepairTrack,
    CarList,
    CarInfo,
  },
  data () {
    return {
      showSide: true,
      showTrack: false,
      // 是否正在显示车辆详情
      isShowing: false,
      // 绑定
      bindCars: [],
      markers: [],
      showingCar: {},
      specalAreas: [],
      divMarkers: [],
    }
  },
  computed: {
    ...mapState(['mapInfo', 'carScale', 'productLineId']),
    ...mapGetters(['overtime']),
  },
  sockets: {
    connect (data) {
      console.log(data)
      console.log('已成功连接到socket服务器')
      // console.log(this.token)
      // this.$socket.emit('init', this.token)
    },
    reconnect () {
      console.log('socket 重连')
    },
    disconnect () {
      console.log('socket 断开连接')
    },
    alarm (data) {
      // console.log('接收到alarm事件推送')
      // console.log(data)
      let newAlarm = JSON.parse(data)
      // console.log(newAlarm)
      // 改变对应marker的状态
      // 找到对应的marker
      let markerIndex = this.markers.findIndex((item) => item.locatorId === newAlarm.locatorId)
      // 改变marker以及数据状态
      if (markerIndex !== -1) {
        let currentMarker = this.markers[markerIndex].marker
        // 判断车辆是仅告警还是有超时
        let currentCarIndex = this.bindCars.findIndex((car) => car.locator.id === newAlarm.locatorId)
        this.bindCars[currentCarIndex].vehicle.status = 1
        this.bindCars = [...this.bindCars]
        let iconType
        // console.log(this.isDelay(this.bindCars[currentCarIndex].vehicleDeliverStatus.bindTime))
        if (this.isDelay(this.bindCars[currentCarIndex].vehicleDeliverStatus.bindTime)) {
          iconType = 'overtime'
        } else {
          iconType = 'alarm'
        }
        // console.log(iconType)
        let Icon = this.createPointMarker(iconType)
        // console.log('改变了车的颜色状态')
        let m = currentMarker.setIcon(Icon)
        m.setRotation(currentMarker.angle)
        this.$notify.error({
          dangerouslyUseHTMLString: true,
          message: `<div>${newAlarm.vehicleId}发生告警</div><div>内容: '${newAlarm.message}</div><div>时间: ${this.$moment(newAlarm.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div><div>地点: ${newAlarm.address}</div>`,
          position: 'bottom-right',
          duration: 2500
        })
        // this.getBindCars()
      }
    },
    position (data) {
      // console.log('接收到position事件推送')
      // console.log(data)
      // console.log(this.bindCars)
      const newPos = JSON.parse(data)
      // console.log(newPos)
      // 找到对应的marker
      let markerIndex = this.markers.findIndex((item) => item.locatorId === newPos.content.id)
      // 移动位置
      if (markerIndex !== -1) {
        let currentMarker = this.markers[markerIndex].marker
        // console.log('move')
        // currentMarker.setLatLng([newPos.content.y, newPos.content.x])
        // console.log(newPos.content.angle)
        // console.log(currentMarker)
        // currentMarker.setPopupContent(newPos.content.y + ' ' + newPos.content.x)
        // currentMarker.openPopup()
        // 判断是否在特殊区域
        if (newPos.content.existenceZone) { // 如果位置点在存在性区域中
          if (!currentMarker.inSpecialArea) { // 如果这个marker以前不在这个区域
            // 去除这个marker 更新数据
            this.changeSpecialAreaNum(newPos.content.existenceZone, true)
            currentMarker.zone = newPos.content.existenceZone
            currentMarker.inSpecialArea = true
            currentMarker.remove()
          }
        } else if (newPos.content.existenceZone === null) { // 如果这个marker不在需检测的存在性区域中
          if (currentMarker.inSpecialArea === true) { // 以前这个marker在存在性区域
            // 将这个marker显示出来
            currentMarker.addTo(this.map)
            currentMarker.inSpecialArea = false
            // 更新数据
            this.changeSpecialAreaNum(currentMarker.zone, false)
          }
        }
        if (!newPos.content.existenceZone) {
          currentMarker.moveTo([newPos.content.y, newPos.content.x], 500, newPos.content.angle)
        }
        currentMarker.angle = newPos.content.angle
      }
    },
    bind (data) {
      // console.log(data)
      const newCar = JSON.parse(data)
      console.log(newCar)
      // 验证这辆车是否已存在与列表中，若存在则无视，若不存在则在车辆列表中添加这辆车并创建一个新的marker
      const carId = newCar.vehicle.id
      let hasThisCar = this.bindCars.find((car) => car.vehicle.id === carId)
      if (!hasThisCar) {
        this.bindCars.push(newCar)
        this.renderMarker(newCar)
      }
    },
    unbind (data) {
      const removeCar = JSON.parse(data)
      console.log('删除了car')
      console.log(removeCar)
      // 找到是否有这辆车
      let carIndex = this.bindCars.findIndex((car) => car.vehicle.id === removeCar.vehicle.id)
      // 移除数据
      if (carIndex !== -1) { // 存在这辆车
        this.bindCars.splice(carIndex, 1)
        // 找出这个marker
        // 找到对应的marker
        let markerIndex = this.markers.findIndex((item) => item.id === removeCar.vehicle.id)
        if (markerIndex !== -1) {
          let currentMarker = this.markers[markerIndex].marker
          console.log(currentMarker)
          // 删除marker
          currentMarker.remove()
          this.markers.splice(markerIndex, 1)
          console.log(this.markers)
        }
      }
    },
    changeBind (data) {
      const car = JSON.parse(data)
      console.log(car)
      let carId = car.vehicle.id
      // 替换车的定位器id
      let currentCarIndex = this.bindCars.findIndex((car) => car.vehicle.id === carId)
      this.bindCars[currentCarIndex] = car
      this.bindCars = [...this.bindCars]
      // 改变marker记录的定位器id
      let markerIndex = this.markers.findIndex((item) => item.id === carId)
      if (markerIndex !== -1) {
        this.markers[markerIndex].locatorId = car.locator.id
        this.markers[markerIndex].marker.locatorId = car.locator.id
      }
      console.log(this.markers)
      console.log(this.bindCars)
    }
  },
  methods: {
    ...mapActions(['getMapInfo']),
    isDelay (bindTime) {
      // console.log(bindTime)
      let duration = this.$moment().valueOf() - bindTime
      // console.log(duration / 1000)
      let hours = this.$moment.duration(duration / 1000, 's').asHours().toFixed(2)
      // console.log(hours)
      if (hours * 1 >= this.overtime * 1) {
        return true
      } else {
        return false
      }
    },
    toggleShowSide () {
      this.showSide = !this.showSide
    },
    showCarInfo (car) {
      // console.log(car)
      let oui = car.vehicle.id
      // 查询这两车的信息
      let param = {
        productLineId: 1,
        bind: true,
        vehicleId: oui
      }
      queryCars(param).then((res) => {
        // console.log(res)
        let { code, desc, result } = res
        if (code === 0) {
          this.showingCar = result.resultList[0]
          this.hignlightMarker(oui, this.showingCar)
          if (this.isShowing === false) {
            this.isShowing = true
          }
          // 找到marker
        } else {
          this.$notify.error({
            message: desc
          })
        }
      })
    },
    // hignliaght marker
    hignlightMarker (carId, car) {
      let markerIndex = this.markers.findIndex((item) => item.id === carId)
      // console.log(markerIndex)
      if (markerIndex !== -1) {
        let currentMarker = this.markers[markerIndex].marker
        // setPopupContent
        console.log(car)
        currentMarker.setPopupContent(`<div>车 架 号: ${car.vehicleIdentification}</div><div>标 签 号: ${car.locatorSn}</div><div>${car.locatorY + ' ' + car.locatorX}</div>`)
        let isOpenPopup = currentMarker.isPopupOpen()
        if (!isOpenPopup) {
          currentMarker.openPopup()
        }
      }
    },
    closeInfo () {
      this.isShowing = false
      // console.log(this.$refs['carlist'])
      this.$refs['carlist'].clearListActive()
      this.showingCar = {}
    },
    // 创建点marker
    createPointMarker (statu) {
      let carImg
      switch (statu) {
        case 'alarm':
          carImg = errorCar
          break
        case 'overtime':
          carImg = warnCar
          break
        case 'normal':
          carImg = successCar
          break
        default:
          carImg = successCar
          break
      }
      // eslint-disable-next-line no-undef
      // console.log(carImg)
      const icon = L.icon({
        iconUrl: carImg,
        iconAnchor: [initCarSize[0] * this.carScale / 2, initCarSize[1] * this.carScale / 2],
        iconSize: [initCarSize[0] * this.carScale, initCarSize[1] * this.carScale]
      })
      return icon
    },
    computedIconType (car) {
      let bindTime = car.vehicleDeliverStatus.bindTime
      // console.log(this.formatTime(bindTime))
      // console.log(this.overtime)
      // console.log(this.formatTime(bindTime) > this.overtime)
      if (this.formatTime(bindTime) * 1 > this.overtime * 1) {
        // console.log(true)
        return 'overtime'
      } else if (car.vehicle.status && car.vehicle.status !== 0) {
        return 'alarm'
      } else {
        return 'normal'
      }
    },
    // 渲染车辆点到地图上
    renderMarker (car) {
      console.log(car)
      // let bindTime = car.vehicleDeliverStatus.bindTime
      // console.log(bindTime)
      // console.log(this.formatTime(bindTime))
      let iconType = this.computedIconType(car)
      // console.log(iconType)
      let carPos = [car.locator.y, car.locator.x]
      let icon = this.createPointMarker(iconType)
      const marker = L.Marker.movingMarker([carPos], [], {
        rotate: true,
        icon,
        initialRotationAngle: 0,
        title: car.locator.sn + ' ' + car.locator.y + ' ' + car.locator.x
      })
      // 为marker绑上车和定位器的ID
      marker.carId = car.vehicle.id
      marker.locatorId = car.locator.id
      marker.bindPopup(`<div>车 架 号: ${car.vehicle.identification}</div><div>标 签 号: ${car.locator.sn}</div><div>${car.locator.y + ' ' + car.locator.x}</div>`)
      marker.on('click', this.clickMarker)
      // 判断是否是特殊区域点
      // const inSpeacalArea = (existenceZone) => {}
      if (car.locator.existenceZone) { // 特殊区域点
        marker.inSpecialArea = true
        marker.zone = car.locator.existenceZone
        // console.log('do change')
        this.changeSpecialAreaNum(car.locator.existenceZone, true)
      } else {
        marker.inSpecialArea = false
        this.map && marker.addTo(this.map)
      }
      this.markers.push({
        marker,
        id: car.vehicle.id,
        locatorId: car.locator.id
      })
    },
    formatTime (s) {
      let repairTime = this.$moment().valueOf() - s
      return this.$moment.duration(repairTime / 1000, 's').asHours().toFixed(2)
    },
    // 点击marker
    clickMarker (ev) {
      // console.log(ev)
      let oui = ev.target.carId
      // 查询这两车的信息
      let param = {
        productLineId: 1,
        bind: true,
        vehicleId: oui
      }
      queryCars(param).then((res) => {
        // console.log(res)
        let { code, desc, result } = res
        if (code === 0) {
          this.showingCar = result.resultList[0]
          this.$refs['carlist'].setListActive(oui)
          if (this.isShowing === false) {
            this.isShowing = true
          }
        } else {
          this.$notify.error({
            message: desc
          })
        }
      })
      // this.isShowing = true
    },
    // 获取绑定的车辆信息
    getBindCars (isInit) {
      let params = {
        productLineId: 1
      }
      getBindList(params).then((res) => {
        console.log(res)
        if (res.code === 0) {
          this.bindCars = res.result
          if (!isInit) {
            console.log('fresh')
            this.bindCars = [...this.bindCars]
          }
          if (this.bindCars.length > 0 && isInit === true) {
            this.bindCars.forEach((car) => {
              this.renderMarker(car)
            })
          }
        }
      })
    },
    // 改变地图上要显示的车
    changeShowingMarkers (carIds) {
      // console.log(carIds)
      // console.log(this.markers)
      // 循环marker
      const canRender = (carId) => {
        return carIds.some((id) => id === carId)
      }
      this.markers.forEach((item) => {
        // 符合的marker透明度设置为1，否则设置为0
        if (canRender(item.id)) {
          // item.marker.setOpacity(1)
          if (!item.isAddedToMap && !item.marker.inSpecialArea) {
            // console.log(item.marker)
            // console.log(item.marker.angle)
            item.marker.addTo(this.map)
            item.marker.setRotation(item.marker.angle)
            item.isAddedToMap = true
          }
        } else {
          // item.marker.setOpacity(0)
          // 移除点击事件
          // item.marker.off('click', this.clickMarker)
          item.isAddedToMap = false
          item.marker.remove()
        }
      })
    },
    // 改变特殊区域的数量
    changeSpecialAreaNum (name, isAdd) {
      console.log(name)
      for (let i = 0; i < this.specalAreas.length; i++) {
        console.log(this.specalAreas[i].name)
        console.log(typeof name)
        if (name.includes(this.specalAreas[i].name)) {
          console.log('+1 -1')
          if (isAdd === true) {
            this.specalAreas[i].sum++
          } else {
            this.specalAreas[i].sum--
          }
          this.specalAreas = [...this.specalAreas]
        }
      }
    },
    // 创建聚合点
    createDivMarker (specalArea) {
      // 测试功能信息 - 聚合
      const myIcon = L.divIcon({
        className: 'marker-circle',
        html: specalArea.sum
      })
      let center = [specalArea.center.y, specalArea.center.x]
      let divMarker = L.marker(center, { icon: myIcon })
      divMarker.name = specalArea.name
      divMarker.id = specalArea.id
      console.log(divMarker)
      this.divMarkers.push(divMarker)
      divMarker.addTo(this.map)
      console.log(this.divMarkers)
      console.log(this.markers)
    },
    // 更新聚合点
    updateDivMarker (area) {
      // 找到这个聚合点
      let currentDivMarker = this.divMarkers.find((marker) => marker.id === area.id)
      // 更新数据
      if (currentDivMarker) {
        const myIcon = L.divIcon({
          className: 'marker-circle',
          html: area.sum
        })
        currentDivMarker.setIcon(myIcon)
      }
    }
  },
  watch: {
    specalAreas: {
      handler: function (newVal) {
        // console.log('new areas')
        console.log(newVal)
        let hasDivMarker = (id) => {
          let hasMarker = false
          this.divMarkers.forEach((marker) => {
            if (marker.id === id) {
              hasMarker = true
            }
          })
          return hasMarker
        }
        // 判断数量是否大于0
        for (let i = 0; i < newVal.length; i++) {
          if (newVal[i].sum > 0) {
            // 判断是否创建了这个聚合点
            if (hasDivMarker(newVal[i].id)) { // 创建了这个marker。那就更新这个marker
              this.updateDivMarker(newVal[i])
            } else { // 没有创建那就创建这个marker
              // console.log('create')
              this.createDivMarker(newVal[i])
            }
          } else if (newVal[i].sum === 0) { // 判断情况是否需要清除这个聚合marker
            // todo
            if (hasDivMarker(newVal[i].id)) { // 存在这个marker 移除
              let index = this.divMarkers.findIndex((marker) => marker.id === newVal[i].id)
              this.divMarkers[index].remove()
              this.divMarkers.splice(index, 1)
            }
          }
        }
      },
      deep: true
    }
  },
  mounted () {
    this.getMapInfo().then((mapInfo) => {
      // eslint-disable-next-line no-undef
      const map = L.map('map', {
        center: [4, -10],
        zoom: 6,
        minZoom: 6,
        maxZoom: 6,
        zoomControl: false, // 默认不显示缩放按钮
        attributionControl: false // 不显示leaflet 图标logo

      })
      // console.log(mapInfo)
      const imgUrl = mapInfo.twoDFilePath
      const imgBounds = [[mapInfo.coordinateDown, mapInfo.coordinateLeft], [mapInfo.coordinateUpper, mapInfo.coordinateRight]]
      // const imgUrl = imgMap
      // const imgBounds = [[-0.8, -22.7], [8.0, 1.2]]
      // eslint-disable-next-line no-undef
      this.imageOverlay = L.imageOverlay(imgUrl, imgBounds)
      this.imageOverlay.addTo(map)
      this.map = map
      // 获取区域信息
      let params = {
        productLineId: this.productLineId,
        id: mapInfo.id
      }
      getSpecicalFence(params).then((res) => {
        // console.log(res)
        let { code, result } = res
        if (code === 0) {
          this.getBindCars(true)
          this.carListTime = setInterval(this.getBindCars, 30000)
          // console.log(result)
          let specalAreas = result.map((area) => {
            let points = area.points.split(';').map((item) => {
              let [x, y] = item.split('_')
              return {
                x,
                y
              }
            })
            // 因为是闭合图形所以去除最后一个点
            points.pop()
            let sumX = 0
            let sumY = 0
            points.forEach((point) => {
              sumX += point.x * 1
              sumY += point.y * 1
            })
            // console.log(points)
            // console.log(sumY)
            let center = {
              x: sumX / points.length,
              y: sumY / points.length
            }
            return {
              id: area.id,
              points,
              center,
              sum: 0,
              name: area.name
            }
          })
          // console.log(specalAreas)
          this.specalAreas = specalAreas
        }
      })
    }).catch((err) => {
      console.log(err)
      this.$notify.error({
        message: '获取地图数据失败[失望脸]'
      })
    })
    // this.getCarInfo()
  },
  beforeDestroy () {
    this.carListTime && clearInterval(this.carListTime)
    this.carListTime = null
  }
}
</script>

<style lang="less" scoped>
@import '../assets/less/color.less';
.home {
  .list {
    position: fixed;
    width: 350px;
    top: 0;
    right: 0;
    z-index: 1001;
    height: 100%;
    border-radius: 10px;
    background: @base-background-opacity;
    // box-shadow: @shadow-base;
    padding: 40px 5px;
    .item {
      cursor: pointer;
      margin: 10px 0;
      padding: 5px;
    }
  }
  .switch {
    font-size: 0.8rem;
    padding: 10px;
    position: fixed;
    top: 0;
    right: 20px;
    z-index: 1002;
    cursor: pointer;
  }
}
</style>
