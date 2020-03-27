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
      <CarList v-if="bindCars.length > 0" @showCarInfo="showCarInfo" :cars="bindCars" />
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
  getBindList,
  queryCars,
} from '../api/vq'
import {
  mapState,
  mapActions,
} from 'vuex'
// import RepairTrack from '../components/RepairTrack'
export default {
  name: 'home',
  components: {
    // HelloWorld
    // RepairTrack: () => import('../components/RepairTrack')
    // RepairTrack,
    CarList: () => import('@/components/CarList'),
    CarInfo: () => import('@/components/CarInfo')
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
    }
  },
  computed: {
    ...mapState(['mapInfo'])
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
      console.log(newAlarm)
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
        if (this.isDelay(this.bindCars[currentCarIndex].vehicleDeliverStatus.bindTime)) {
          iconType = 'overtime'
        } else {
          iconType = 'alarm'
        }
        let Icon = this.createPointMarker(iconType)
        console.log('改变了车的颜色状态')
        currentMarker.setIcon(Icon)
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
      const newPos = JSON.parse(data)
      // console.log(newPos)
      // 找到对应的marker
      let markerIndex = this.markers.findIndex((item) => item.locatorId === newPos.content.id)
      // 移动位置
      if (markerIndex !== -1) {
        let currentMarker = this.markers[markerIndex].marker
        // console.log('move')
        // currentMarker.setLatLng([newPos.content.y, newPos.content.x])
        currentMarker.moveTo([newPos.content.y, newPos.content.x], 500)
        setTimeout(() => {
          newPos.content.deg && currentMarker.setRotation(newPos.content.deg)
        }, 600)
      }
    },
    bind (data) {
      // console.log(data)
      const newCar = JSON.parse(data)
      // console.log(newCar)
      // 验证这辆车是否已存在与列表中，若存在则无视，若不存在则在车辆列表中添加这辆车并创建一个新的marker
      const carId = newCar.vehicle.id
      let hasThisCar = this.bindCars.find((car) => car.vehicle.id === carId)
      if (!hasThisCar) {
        this.bindCars.push(newCar)
        this.renderMarker(newCar)
      }
    },
    unBind (data) {
      const removeCar = JSON.parse(data)
      console.log('删除了car')
      console.log(removeCar)
      // 找到是否有这辆车
      let carIndex = this.bindCars.findIndex((car) => car.vehicle.id === removeCar.id)
      // 移除数据
      if (carIndex !== -1) { // 存在这辆车
        this.bindCars.split(carIndex, 1)
        // 找出这个marker
        // 找到对应的marker
        let markerIndex = this.markers.findIndex((item) => item.id === removeCar.id)
        if (markerIndex !== -1) {
          let currentMarker = this.markers[markerIndex].marker
          // 删除marker
          currentMarker.remove()
        }
      }
    },
  },
  methods: {
    ...mapActions(['getMapInfo']),
    isDelay (bindTime) {
      // console.log(bindTime)
      let duration = this.$moment().valueOf() - bindTime
      // console.log(duration)
      let hours = this.$moment.duration(duration / 1000, 's').hours()
      // console.log(hours)
      if (hours >= 8) {
        return true
      } else {
        return false
      }
    },
    toggleShowSide () {
      this.showSide = !this.showSide
    },
    showCarInfo (car) {
      console.log(car)
      let oui = car.vehicle.id
      // 查询这两车的信息
      let param = {
        productLineId: 1,
        bind: true,
        vehicleId: oui
      }
      queryCars(param).then((res) => {
        console.log(res)
        let { code, desc, result } = res
        if (code === 0) {
          this.showingCar = result.resultList[0]
          if (this.isShowing === false) {
            this.isShowing = true
          }
        } else {
          this.$notify.error({
            message: desc
          })
        }
      })
    },
    closeInfo () {
      this.isShowing = false
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
        iconUrl: carImg
      })
      return icon
    },
    // 渲染车辆点到地图上
    renderMarker (car) {
      // console.log(car)
      let bindTime = car.vehicleDeliverStatus.bindTime
      // console.log(bindTime)
      let iconType = this.formatTime(bindTime) > 8 ? 'overtime' : 'normal'
      // console.log(iconType)
      let carPos = [car.locator.y, car.locator.x]
      let icon = this.createPointMarker(iconType)
      const marker = L.Marker.movingMarker([carPos], [], {
        rotate: true,
        icon,
        initialRotationAngle: 90,
        title: car.locator.sn + ' ' + car.locator.y + ' ' + car.locator.x
      })
      // 为marker绑上车和定位器的ID
      marker.carId = car.vehicle.id
      marker.locatorId = car.locator.id
      marker.on('click', this.clickMarker)
      this.markers.push({
        marker,
        id: car.vehicle.id,
        locatorId: car.locator.id
      })
      this.map && marker.addTo(this.map)
    },
    formatTime (s) {
      let repairTime = this.$moment().valueOf() - s
      return this.$moment.duration(repairTime / 1000, 's').asHours().toFixed(2)
    },
    // 点击marker
    clickMarker (ev) {
      console.log(ev)
      let oui = ev.target.carId
      // 查询这两车的信息
      let param = {
        productLineId: 1,
        bind: true,
        vehicleId: oui
      }
      queryCars(param).then((res) => {
        console.log(res)
        let { code, desc, result } = res
        if (code === 0) {
          this.showingCar = result.resultList[0]
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
      console.log(mapInfo)
      const imgUrl = mapInfo.twoDFilePath
      const imgBounds = [[mapInfo.coordinateDown, mapInfo.coordinateLeft], [mapInfo.coordinateUpper, mapInfo.coordinateRight]]
      // const imgUrl = imgMap
      // const imgBounds = [[-0.8, -22.7], [8.0, 1.2]]
      // eslint-disable-next-line no-undef
      L.imageOverlay(imgUrl, imgBounds).addTo(map)
      this.map = map
      this.getBindCars(true)
      this.carListTime = setInterval(this.getBindCars, 30000)
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
.home {
  .list {
    position: fixed;
    width: 350px;
    top: 0;
    right: 0;
    z-index: 1001;
    height: 100%;
    border-radius: 10px;
    background: rgba(56, 56, 56, 0.75);
    box-shadow: 2px 2px 5px #666;
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
