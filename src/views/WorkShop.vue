<template>
  <div class="page home">
    <div id="map" class="map" v-intro="'当前所有在修车辆的位置和基本信息会以小车辆图标的形式在地图上显示，点击车辆图标会弹出车辆的基本信息和维修详细信息'" v-intro-step="1"></div>
    <div class="list" v-intro="'车辆列表会显示当前科室的在修车辆和待修车辆列表，点击列表项可以显示该车的详细信息及维修流程信息，同时需要科室人员在完成时做流程确认'" v-intro-step="2" v-if="showSide">
      <CarList ref="carlist" @showCarInfo="showCarInfo" :repair="repairCars" :pending="pendingCars" />
    </div>
    <div class="switch" @click="toggleShowSide">
      <zx-icon :type="showSide ? 'zx-guanbi1' : 'zx-Group-'" />
    </div>
    <CarInfo :car="showingCar" :type="showingCarType" @close="closeInfo" @refreshList="refreshList" v-if="isShowing" />
    <div class="total" v-intro="'统计区域会显示今日该科室到目前共完成了多少辆车的维修任务，同时也会计算维修每一辆车的平均耗时'" v-intro-step="3">
      <div class="item">
        <div class="key">
          <zx-icon type="zx-zhouqi"></zx-icon>
          <span>待复检</span>
        </div>
        <div class="value">
          <CountTo :to="repairedCarsNum.recheck" uid="today-repaired" className="value" />
        </div>
      </div>
      <div class="item">
        <div class="key">
          <zx-icon type="zx-iconset0328"></zx-icon>
          <span>已通过</span>
        </div>
        <div class="value">
          <CountTo :to="repairedCarsNum.pass" uid="today-repaired-extra" className="value" />
        </div>
      </div>
      <div class="item">
        <div class="key">
          <zx-icon type="zx-xiuli"></zx-icon>
          <span>在修</span>
        </div>
        <div class="value">
          <CountTo :to="repairedCarsNum.repairing" uid="today-average-time" className="value" />
        </div>
      </div>
    </div>
    <div class="area-select">
      <template v-for="(item, index) in menus">
        <div :key="index" class="item">
          <div @click="changeMap(item.id)" :class="`btn ${currentMapInfo.id === item.id ? 'active' : ''}`" >{{item.name}}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-undef */
// import imgMap from '../assets/img/office-map.png'
import successCar from '../assets/img/car-blue.png'
import errorCar from '../assets/img/car-red.png'
import warnCar from '../assets/img/car-yellow.png'
import offlineCar from '../assets/img/car-offline.png'
import {
  initCarSize,
  introOption,
  initCarScale,
} from '../config/config'
import {
  getWorkShopCars,
  officeStatistic,
} from '../api/workshop'
import {
  // getBindList,
  // queryCars,
  getSpecicalFence,
  getRepairCarInfo,
} from '../api/vq'
import {
  mapState,
  mapActions,
  mapGetters,
} from 'vuex'
import {
  isInPolygon,
  computeCarScale,
} from '../utils/utils'
// import RepairTrack from '../components/RepairTrack'
import CarInfo from './WorkInfo'
import CarList from './WorkList'
// import SmallMap from '@/components/SmallMap'
export default {
  name: 'home',
  components: {
    // HelloWorld
    // RepairTrack: () => import('../components/RepairTrack')
    // RepairTrack,
    CarList,
    CarInfo,
    // SmallMap,
    CountTo: () => import('../components/CountTo'),
  },
  data () {
    return {
      showSide: true,
      showTrack: false,
      // 是否正在显示车辆详情
      isShowing: false,
      // 绑定
      bindCars: [],
      menus: [],
      markers: [],
      showingCar: {},
      specalAreas: [],
      divMarkers: [],
      currentMapPoints: '',
      currentMapInfo: '',
      showingCars: [],
      repairCars: [],
      pendingCars: [],
      showingCarType: '',
      repairedCarsNum: {},
      averageTime: 0,
      skipIntro: true
    }
  },
  computed: {
    ...mapState(['mapInfo', 'carScale', 'productLineId', 'pointScale', 'childMapInfos', 'initMapZoom', 'officeName']),
    ...mapGetters(['overtime']),
    allMaps () {
      return [this.mapInfo, ...this.childMapInfos]
    },
    activeMapId () {
      return this.currentMapInfo.id
    }
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
    position (data) {
      // console.log('接收到position事件推送')
      // console.log(data)
      // console.log(this.bindCars)
      const posList = JSON.parse(data).content
      // console.log(posList)
      posList.forEach((newPos) => {
        // 找到对应的marker
        let markerIndex = this.markers.findIndex((item) => item.locatorId === newPos.id)
        // 移动位置
        if (markerIndex !== -1) {
          let currentMarker = this.markers[markerIndex].marker
          // 判断是否在特殊区域
          if (newPos.existenceZone) { // 如果位置点在存在性区域中
            if (!currentMarker.inSpecialArea) { // 如果这个marker以前不在这个区域
              // 去除这个marker 更新数据
              this.changeSpecialAreaNum(newPos.existenceZone, true)
              currentMarker.zone = newPos.existenceZone
              currentMarker.inSpecialArea = true
              currentMarker.remove()
            }
          } else if (newPos.existenceZone === null) { // 如果这个marker不在需检测的存在性区域中
            if (currentMarker.inSpecialArea === true) { // 以前这个marker在存在性区域
              // 将这个marker显示出来
              currentMarker.addTo(this.map)
              currentMarker.inSpecialArea = false
              // 更新数据
              this.changeSpecialAreaNum(currentMarker.zone, false)
            }
          }
          if (!newPos.existenceZone && currentMarker.isAddedToMap === true) {
            // console.log('move marker')
            currentMarker.moveTo([newPos.y / this.pointScale, newPos.x / this.pointScale], 500, newPos.angle)
          }
          currentMarker.angle = newPos.angle
        }
      })
    },
    changeBind (data) {
      const car = JSON.parse(data)
      console.log(car)
      let carId = car.vehicle.id
      // 替换车的定位器id
      // let currentCarIndex = this.bindCars.findIndex((car) => car.vehicle.id === carId)
      // this.bindCars[currentCarIndex] = car
      // this.bindCars = [...this.bindCars]
      // 改变marker记录的定位器id
      let markerIndex = this.markers.findIndex((item) => item.id === carId)
      if (markerIndex !== -1) {
        this.markers[markerIndex].locatorId = car.locator.id
        this.markers[markerIndex].marker.locatorId = car.locator.id
      }
      console.log(this.markers)
      console.log(this.bindCars)
    },
    officeIn (data) {
      console.log('接收到officeIn事件')
      const officeInCar = JSON.parse(data)
      console.log(officeInCar)
      let { bindModel: car, officeName } = officeInCar.content
      if (officeName === this.officeName) {
        console.log(car)
        let markerIndex = this.markers.findIndex((item) => item.locatorId === car.locator.id)
        if (markerIndex === -1) {
          this.renderMarker(car)
          this.refreshList()
        } else {
          console.log('已经存在的车')
        }
      } else {
        console.log('不是这个科室的officeIn')
      }
    },
    officeOut (data) {
      const officeOutCar = JSON.parse(data)
      console.log(`officeOut 事件`)
      let { bindModel: car, officeName } = officeOutCar.content
      if (officeName === this.officeName) {
        console.log(car)
        // this.renderMarker(car)
        let item = this.markers.find((item) => item.locatorId === car.locator.id)
        if (item) {
          let index = this.markers.findIndex((item) => item.locatorId === car.locator.id)
          item.marker.remove()
          item.marker.isAddedToMap = false
          if (index !== -1) {
            this.markers.splice(index, 1)
          }
          this.refreshList()
        }
      } else {
        console.log('不是这个科室的officeOut')
      }
    },
    // bind (data) {
    //   // console.log(data)
    //   const newCar = JSON.parse(data)
    //   console.log(newCar)
    //   const carId = newCar.vehicle.id
    //   // let hasThisCar = this.bindCars.find((car) => car.vehicle.id === carId)
    //   let markerIndex = this.markers.findIndex((item) => item.id === carId)
    //   // if (!isInPolygon([newPos.content.y / this.pointScale, newPos.content.x / this.pointScale], this.currentMapPoints))
    //   // console.log(hasThisCar)
    //   let y = newCar.locator.y
    //   let x = newCar.locator.x
    //   if (markerIndex === -1 && isInPolygon([y / this.pointScale, x / this.pointScale], this.currentMapPoints)) { // 没有这个marker,且在区域内
    //     console.log('add car')
    //     // this.bindCars.push(newCar)
    //     // this.showingCars.push(newCar)
    //     this.renderMarker(newCar)
    //     // this.carMapNum = this.computeAreaCarNums()
    //     this.refreshList()
    //   }
    // },
    unbind (data) {
      const removeCar = JSON.parse(data)
      console.log('删除了car')
      let markerIndex = this.markers.findIndex((item) => item.id === removeCar.vehicle.id)
      if (markerIndex !== -1) {
        let currentMarker = this.markers[markerIndex].marker
        // console.log(currentMarker)
        // 删除marker
        currentMarker.remove()
        this.markers.splice(markerIndex, 1)
        // console.log(this.markers)
        this.refreshList()
      }
    },
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
    guide () {
      // console.log(this.$intro)
      this.$intro().setOptions(introOption).start().oncomplete(() => {
        // console.log('over')
        localStorage.setItem('officeIntro', true)
        // this.$refs['carlist'].guide()
      }).onexit(() => {
        localStorage.setItem('officeIntro', true)
        // this.$refs['carlist'].guide()
      })
    },
    toggleShowSide () {
      this.showSide = !this.showSide
    },
    getWorkShopStatistic () {
      officeStatistic().then((res) => {
        // console.log(res)
        let { code, result } = res
        if (code === 0) {
          // this.repairedCarsNum = result.count
          // // console.log(result.totalTime)
          // let hours = result.totalTime / 1000 / 60 / 60
          // // console.log(hours)
          // this.averageTime = hours / this.repairedCarsNum
          this.repairedCarsNum = result
        }
      })
    },
    refreshList () {
      this.getBindCars()
    },
    showCarInfo (info) {
      // console.log(car)
      let { car, type } = info
      // let oui = car.vehicle.id
      // 查询这两车的信息
      let param = car.locator.id
      getRepairCarInfo(param).then((res) => {
        console.log(res)
        let { code, desc, result } = res
        if (code === 0) {
          this.showingCar = result.resultList[0]
          this.showingCarType = type
          this.hignlightMarker(param, this.showingCar)
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
      // queryCars(param).then((res) => {
      //   // console.log(res)
      //   let { code, desc, result } = res
      //   if (code === 0) {
      //     this.showingCar = result.resultList[0]
      //     this.showingCarType = type
      //     this.hignlightMarker(oui, this.showingCar)
      //     if (this.isShowing === false) {
      //       this.isShowing = true
      //     }
      //     // 找到marker
      //   } else {
      //     this.$notify.error({
      //       message: desc
      //     })
      //   }
      // })
    },
    dbClickToChangeMap (ev) {
      let point = [ev.latlng.lat, ev.latlng.lng]
      // console.log(point)
      let curMapInfo = this.childMapInfos.find((mapInfo) => {
        let mapPoints = this.computeMapPoints(mapInfo)
        return isInPolygon(point, mapPoints)
      })
      // console.log(curMapInfo)
      if (curMapInfo) {
        this.changeMap(curMapInfo.id)
      }
    },
    // 计算各科室有多少辆车
    computeAreaCarNums () {
      let carMap = new Map()
      let mapPoints
      this.childMapInfos.forEach((mapInfo) => {
        carMap.set(mapInfo.id, 0)
        mapPoints = this.computeMapPoints(mapInfo)
        for (let i = 0; i < this.bindCars.length; i++) {
          let point = [this.bindCars[i].locator.y / this.pointScale, this.bindCars[i].locator.x / this.pointScale]
          // console.log(point)
          // console.log(mapPoints)
          if (isInPolygon(point, mapPoints)) {
            // console.log('+1')
            carMap.set(mapInfo.id, carMap.get(mapInfo.id) + 1)
          }
        }
      })
      carMap.set(this.mapInfo.id, this.bindCars.length)
      // console.log(carMap)
      return carMap
    },
    // hignliaght marker
    hignlightMarker (locatorId, car) {
      let markerIndex = this.markers.findIndex((item) => item.locatorId === locatorId)
      // console.log(markerIndex)
      if (markerIndex !== -1) {
        let currentMarker = this.markers[markerIndex].marker
        // setPopupContent
        // console.log(car)
        // currentMarker.setPopupContent(`<div>车 架 号: ${car.vehicleIdentification}</div><div>标 签 号: ${car.locatorSn}</div><div>${car.locatorY + ' ' + car.locatorX}</div>`)
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
        case 'offline':
          carImg = offlineCar
          break
        default:
          carImg = successCar
          break
      }
      // eslint-disable-next-line no-undef
      // console.log(carImg)
      // console.log()
      let carScale = this.currentMapInfo.zoom ? computeCarScale(this.currentMapInfo.zoom) : initCarScale
      // console.log(carScale)
      const icon = L.icon({
        iconUrl: carImg,
        iconAnchor: [initCarSize[0] * carScale / 2, initCarSize[1] * carScale / 2],
        iconSize: [initCarSize[0] * carScale, initCarSize[1] * carScale]
      })
      return icon
    },
    computedIconType (car) {
      let bindTime = car.vehicleDeliverStatus ? car.vehicleDeliverStatus.bindTime : 'none'
      if (!car.vehicle || !car.vehicleDeliverStatus) {
        return 'offline'
      }
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
      // console.log(car)
      // let bindTime = car.vehicleDeliverStatus.bindTime
      // console.log(bindTime)
      // console.log(this.formatTime(bindTime))
      let iconType = this.computedIconType(car)
      // console.log(iconType)
      let carPos = [car.locator.y / this.pointScale, car.locator.x / this.pointScale]
      // let mercatorPoint = {
      //   x: car.locator.x,
      //   y: car.locator.y
      // }
      // let carPos = mercatorTolnglat(mercatorPoint)
      let icon = this.createPointMarker(iconType)
      // console.log(icon)
      // const marker = L.Marker.movingMarker([carPos.lat, carPos.lng], [], {
      const marker = L.Marker.movingMarker([carPos], [], {
        rotate: true,
        icon,
        initialRotationAngle: 0,
        // title: car.locator.sn + ' ' + car.locator.y + ' ' + car.locator.x
      })
      // 为marker绑上车和定位器的ID
      marker.carId = car.vehicle ? car.vehicle.id : 'null'
      marker.locatorId = car.locator.id
      marker.bindPopup(`<div>车 架 号: ${car.vehicle ? car.vehicle.identification : '---'}</div><div>标 签 号: ${car.locator.sn}</div><div>位 置 : ${car.locator.address}</div>`)
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
        marker.isAddedToMap = true
        this.map && marker.addTo(this.map)
      }
      this.markers.push({
        marker,
        id: car.vehicle ? car.vehicle.id : 'null',
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
      let locatorId = ev.target.locatorId
      // 查询这两车的信息
      getRepairCarInfo(locatorId).then((res) => {
        // console.log(res)
        let { code, desc, result } = res
        if (code === 0) {
          this.showingCar = result.resultList[0]
          this.$refs['carlist'].setListActive(locatorId)
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
      getWorkShopCars().then((res) => {
        // console.log(res)
        // console.log('获取bind数据')
        if (res.code === 0) {
          let { node, zone } = res.result
          this.repairCars = node
          this.pendingCars = zone
          // this.bindCars = res.result
          if (isInit) {
            this.repairCars.forEach((car) => {
              this.renderMarker(car)
            })
            this.pendingCars.forEach((car) => {
              this.renderMarker(car)
            })
            this.$nextTick().then(() => {
              !this.skipIntro && this.guide()
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
          if (!item.marker.isAddedToMap && !item.marker.inSpecialArea) {
            // console.log(item.marker)
            // console.log(item.marker.angle)
            item.marker.addTo(this.map)
            // item.marker.setRotation(item.marker.angle)
            // let carScale = this.currentMapInfo.carScale || this.carScale
            // console.log(carScale)
            // this.setCarScaleAndRotate(item.marker, carScale, item.marker.angle)
            item.marker.isAddedToMap = true
          }
        } else {
          // item.marker.setOpacity(0)
          // 移除点击事件
          // item.marker.off('click', this.clickMarker)
          item.marker.isAddedToMap = false
          item.marker.remove()
        }
        // eslint-disable-next-line no-debugger
        // debugger
        if (item.marker.isAddedToMap === true) {
          // let carScale = this.currentMapInfo.carScale || this.carScale
          let carScale = this.currentMapInfo.zoom ? computeCarScale(this.currentMapInfo.zoom) : initCarScale
          // console.log(carScale)
          // console.log(this.currentMapInfo)
          this.setCarScaleAndRotate(item.marker, carScale, item.marker.angle)
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
    },
    computeMapPoints (currentMapInfo) {
      const mapPoints = [
        [currentMapInfo.coordinateDown / this.pointScale, currentMapInfo.coordinateLeft / this.pointScale],
        [currentMapInfo.coordinateUpper / this.pointScale, currentMapInfo.coordinateLeft / this.pointScale],
        [currentMapInfo.coordinateUpper / this.pointScale, currentMapInfo.coordinateRight / this.pointScale],
        [currentMapInfo.coordinateDown / this.pointScale, currentMapInfo.coordinateRight / this.pointScale],
      ]
      return mapPoints
    },
    // 缩放车的大小和方向
    setCarScaleAndRotate (carMarker, scale, rotate) {
      let icon = carMarker.getIcon()
      let size = initCarSize.map((pixe) => {
        return pixe * scale
      })
      let anchor = initCarSize.map((pixe) => {
        return pixe * scale / 2
      })
      let newIcon = L.icon({
        iconUrl: icon.options.iconUrl,
        iconAnchor: anchor,
        iconSize: size
      })
      // console.log(newIcon)
      carMarker.setIcon(newIcon)
      carMarker.setRotation(rotate)
      // console.log(carMarker)
      // m.setRotation(45)
      // console.log(icon)
    },
    // 改变显示的地图
    changeMap (id) {
      // console.log(id)
      if (this.currentMapInfo.id === id) return // 过滤点击自己
      this.map.setMinZoom(1)
      this.map.setMaxZoom(20)
      // 找到需要改变到的mapInfo
      let currentMapInfo = this.allMaps.find((map) => map.id === id)
      if (currentMapInfo) {
        // console.log(currentMapInfo)
        // 重新设置地图的缩放等级和中心点
        const centerx = currentMapInfo.coordinateDown / this.pointScale + currentMapInfo.coordinateUpper / this.pointScale
        const centery = currentMapInfo.coordinateLeft / this.pointScale + currentMapInfo.coordinateRight / this.pointScale
        const center = [centerx / 2, centery / 2]
        let zoom = currentMapInfo.zoom ? currentMapInfo.zoom : this.initMapZoom
        this.map.setView(center, zoom, {
          animate: false // 开启动画的话会导致会有时间延迟，会导致不好控制车辆方向
        })
        this.map.setMinZoom(zoom)
        this.map.setMaxZoom(zoom)
        // 替换图片边界和url
        const imgBounds = [[currentMapInfo.coordinateDown / this.pointScale, currentMapInfo.coordinateLeft / this.pointScale], [currentMapInfo.coordinateUpper / this.pointScale, currentMapInfo.coordinateRight / this.pointScale]]
        this.imageOverlay.setUrl(currentMapInfo.twoDFilePath)
        this.imageOverlay.setBounds(imgBounds)
        // console.log(this.markers)
        // 改变车辆大小和方向 =》 (此处需要先遍历所有车辆bindCars，如果不在该地图范围则需隐藏这辆车)
        const mapPoints = [
          [currentMapInfo.coordinateDown / this.pointScale, currentMapInfo.coordinateLeft / this.pointScale],
          [currentMapInfo.coordinateUpper / this.pointScale, currentMapInfo.coordinateLeft / this.pointScale],
          [currentMapInfo.coordinateUpper / this.pointScale, currentMapInfo.coordinateRight / this.pointScale],
          [currentMapInfo.coordinateDown / this.pointScale, currentMapInfo.coordinateRight / this.pointScale],
        ]
        // console.log(this.bindCars)
        this.currentMapInfo = currentMapInfo
        this.currentMapPoints = mapPoints
        // console.log(this.markers)
        let carScale = this.currentMapInfo.zoom ? computeCarScale(this.currentMapInfo.zoom) : initCarScale
        // console.log(carScale)
        // console.log(this.currentMapInfo)
        this.markers.forEach((item) => {
          // console.log(item)
          this.setCarScaleAndRotate(item.marker, carScale, item.marker.angle)
        })
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
    },
    currentMapInfo: {
      handler: function (newVal) {
        // console.log(newVal)
        if (newVal.parentId === null && !this.map.listens('dblclick')) { // 是原始全局地图
          // this.map.off
          this.map.on('dblclick', this.dbClickToChangeMap)
          this.showGlobalMap = false
          // console.log(this.map)
        } else if (newVal.parentId && this.map.listens('dblclick')) {
          this.map.off('dblclick', this.dbClickToChangeMap)
          this.showGlobalMap = true
        }
        // console.log(this.map.listens('dblclick'))
      },
      deep: true
    }
  },
  created () {
    this.skipIntro = localStorage.getItem('officeIntro') || true
  },
  mounted () {
    this.getMapInfo().then(() => {
      // console.log(this.childMapInfos)
      // console.log(this.officeName)
      // let mapInfo = this.childMapInfos.find((mapInfo) => mapInfo.name === this.officeName)
      let mapInfo = this.mapInfo
      if (!mapInfo) {
        this.$notify.error({
          message: '没有找到合适的地图数据'
        })
        return new Error('没有找到合适的地图数据')
      }
      // eslint-disable-next-line no-debugger
      // debugger
      const centerx = mapInfo.coordinateDown / this.pointScale + mapInfo.coordinateUpper / this.pointScale
      const centery = mapInfo.coordinateLeft / this.pointScale + mapInfo.coordinateRight / this.pointScale
      const center = [centerx / 2, centery / 2]
      // eslint-disable-next-line no-undef
      const map = L.map('map', {
        // center: [0, 0],
        center,
        // zoom: mapInfo.zoom,
        // minZoom: mapInfo.zoom,
        // maxZoom: mapInfo.zoom,
        minZoom: this.initMapZoom,
        maxZoom: this.initMapZoom,
        zoom: this.initMapZoom,
        doubleClickZoom: false,
        zoomControl: false, // 默认不显示缩放按钮
        attributionControl: false // 不显示leaflet 图标logo
      })
      // console.log(mapInfo)
      const imgUrl = mapInfo.twoDFilePath
      // let mercatorLD = {
      //   x: mapInfo.coordinateLeft,
      //   y: mapInfo.coordinateDown,
      // }
      // let mercatorRU = {
      //   x: mapInfo.coordinateRight,
      //   y: mapInfo.coordinateUpper
      // }
      // const lnglat1 = mercatorTolnglat(mercatorLD)
      // const lngLat2 = mercatorTolnglat(mercatorRU)
      const imgBounds = [[mapInfo.coordinateDown / this.pointScale, mapInfo.coordinateLeft / this.pointScale], [mapInfo.coordinateUpper / this.pointScale, mapInfo.coordinateRight / this.pointScale]]
      const mapPoints = [
        [mapInfo.coordinateDown / this.pointScale, mapInfo.coordinateLeft / this.pointScale],
        [mapInfo.coordinateUpper / this.pointScale, mapInfo.coordinateLeft / this.pointScale],
        [mapInfo.coordinateUpper / this.pointScale, mapInfo.coordinateRight / this.pointScale],
        [mapInfo.coordinateDown / this.pointScale, mapInfo.coordinateRight / this.pointScale],
      ]
      this.currentMapPoints = mapPoints
      // console.log(lnglat1)
      // console.log(lngLat2)
      // const imgBounds = [[lnglat1.lat, lnglat1.lng], [lngLat2.lat, lngLat2.lng]]
      // const imgUrl = imgMap
      // const imgBounds = [[-0.8, -22.7], [8.0, 1.2]]
      // eslint-disable-next-line no-undef
      this.imageOverlay = L.imageOverlay(imgUrl, imgBounds)
      this.imageOverlay.addTo(map)
      this.map = map
      this.menus = [this.mapInfo, this.childMapInfos.find((map) => map.name === this.officeName)]
      this.currentMapInfo = mapInfo
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
          this.carListTime = setInterval(this.getBindCars, 600000)
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
    this.getWorkShopStatistic()
    this.statisticTime = setInterval(this.getWorkShopStatistic, 60000)
  },
  beforeDestroy () {
    this.carListTime && clearInterval(this.carListTime)
    this.carListTime = null
    this.statisticTime && clearInterval(this.statisticTime)
    this.statisticTime = null
  }
}
</script>

<style lang="less" scoped>
@import '../assets/less/color.less';
.home {
  position: relative;
  display: flex;
  padding: 0;
  .area-select {
    position: absolute;
    top: 40%;
    left: 20px;
    z-index: 2500;
    .item {
      margin: 15px 0;
      .btn {
        margin-top: 10px;
        padding: 10px;
        border-radius: 5px;
        background: @page-background;
        border: .5px solid #222;
        box-sizing: border-box;
        // box-shadow: @shadow-base;
        box-shadow: 1px 3px 3px #000;
        cursor: pointer;
      }
      .active {
        color: @primary-color;
        background: @base-background-opacity;
      }
    }
  }
  .map {
    height: 100%;
    width: 70%;
  }
  .total {
    position: absolute;
    top: 30px;
    left: 0;
    display: flex;
    width: 70%;
    justify-content: space-around;
    z-index: 2001;
    .item {
      width: 250px;
      height: 80px;
      line-height: 80px;
      font-size: 1.5rem;
      background: @base-background;
      box-shadow: @shadow-base;
      border-radius: 15px;
      display: flex;
      // align-items: center;
      justify-content: center;
      @media screen and (max-width: 1600px) {
        width: 200px;
        font-size: 1.2rem;
        height: 70px;
        line-height: 70px;
      }
      .value {
        margin-left: 20px;
        font-size: 2rem;
        color: @primary-color;
        @media screen and (max-width: 1600px) {
          font-size: 1.5rem;
        }
      }
    }
  }
  .global-map {
    position: absolute;
    left: 25px;
    bottom: 80px;
    img {
      width: 100px;
      cursor: pointer;
    }
  }
  .list {
    // position: fixed;
    width: 30%;
    // top: 0;
    // right: 0;
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
