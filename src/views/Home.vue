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
      <el-input size="small" placeholder="请输入要查询的车辆"></el-input>
      <CarList @showCarInfo="showCarInfo" :cars="cars" />
    </div>
    <CarInfo :car="showingCar" @close="closeInfo" v-show="isShowing" />
    <!-- <RepairTrack ref="repairTrack" /> -->
  </div>
</template>

<script>
/* eslint-disable no-undef */
import imgMap from '../assets/img/office-map.png'
import successCar from '../assets/img/car-blue.png'
import errorCar from '../assets/img/car-red.png'
import warnCar from '../assets/img/car-yellow.png'
import {
  getBindList
} from '../api/vq'
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
      cars: [
        { oui: 'dasdas1', bindTime: 1584435419000, isAlarm: true, isDelay: false },
        { oui: 'dasdas2', bindTime: 1584435419000, isAlarm: false, isDelay: true },
        { oui: 'dasdas3', bindTime: 1584435419000, isAlarm: true, isDelay: false },
        { oui: 'dasdas4', bindTime: 1584435419000, isAlarm: false, isDelay: false },
      ]
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
    alarm (data) {
      // console.log('接收到alarm事件推送')
      // console.log(data)
      let newAlarm = JSON.parse(data)
      console.log(newAlarm)
      // 将告警加入到告警列表
      this.alarms.push(newAlarm.content)
      for (let index = 0; index < 5; index++) {
        this.alarms.push(newAlarm.content)
      }
      // 改变对应marker的状态
    },
    position (data) {
      console.log('接收到position事件推送')
      console.log(data)
      const newPos = JSON.parse(data)
      // console.log(newPos)
      // 找到对应的marker
      let markerIndex = this.markers.findIndex((item) => item.locatorId === newPos.content.locatorId)
      // 移动位置
      if (markerIndex !== -1) {
        let currentMarker = this.markers[markerIndex].marker
        console.log('move')
        currentMarker.setLatLng([newPos.content.y, newPos.content.x])
      }
    },
    bind (data) {
      console.log(data)
      const newCar = JSON.parse(data)
      console.log(newCar)
      // 验证这辆车是否已存在与列表中，若存在则无视，若不存在则在车辆列表中添加这辆车并创建一个新的marker
      const carId = newCar.vehicle.id
      let hasThisCar = this.bindCars.find((car) => car.vehicle.id === carId)
      if (!hasThisCar) {
        this.bindCars.push(newCar)
        this.renderMarker(newCar)
      }
    }
  },
  methods: {
    toggleShowSide () {
      this.showSide = !this.showSide
    },
    showCarInfo (car) {
      console.log(car)
      this.isShowing = true
      this.showingCar = car
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
      let carPos = [car.locator.y, car.locator.x]
      let icon = this.createPointMarker('normal')
      const marker = L.marker(carPos, {
        icon,
        title: car.vehicle.name + ' ' + car.locator.y + ' ' + car.locator.x
      })
      this.markers.push({
        marker,
        id: car.vehicle.id,
        locatorId: car.locator.id
      })
      this.map && marker.addTo(this.map)
    },
    // 获取绑定的车辆信息
    getBindCars () {
      getBindList().then((res) => {
        console.log(res)
        if (res.code === 0) {
          this.bindCars = res.result
          if (this.bindCars.length > 0) {
            this.bindCars.forEach((car) => {
              this.renderMarker(car)
            })
          }
        }
      })
    },
  },
  mounted () {
    // eslint-disable-next-line no-undef
    const map = L.map('map', {
      center: [4, -10],
      zoom: 6,
      zoomControl: false, // 默认不显示缩放按钮
      attributionControl: false // 不显示leaflet 图标logo

    })
    // console.log(map)
    const imgUrl = imgMap
    const imgBounds = [[-0.8, -22.4], [8.0, 1.2]]
    // eslint-disable-next-line no-undef
    L.imageOverlay(imgUrl, imgBounds).addTo(map)
    this.map = map
    this.getBindCars()
  },
  beforeDestroy () {
    this.cartime && clearInterval(this.cartime)
    this.cartime = null
  }
}
</script>

<style lang="less" scoped>
.home {
  .search {
    position: fixed;
    width: 600px;
    top: 80px;
    left: 20%;
    z-index: 1001;
  }
  .list {
    position: fixed;
    width: 350px;
    top: 30px;
    right: 20px;
    z-index: 1001;
    height: 80%;
    border-radius: 10px;
    background: rgba(56, 56, 56, 0.75);
    box-shadow: 2px 2px 5px #666;
    padding: 30px 5px;
    .item {
      cursor: pointer;
      margin: 10px 0;
      padding: 5px;
    }
  }
  .switch {
    font-size: 0.8rem;
    padding: 15px;
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1002;
    cursor: pointer;
  }
}
</style>
