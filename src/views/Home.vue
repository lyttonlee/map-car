<template>
  <div class="page-home home">
    <div id="map" class="map" v-intro="'当前所有在修车辆的位置和基本信息会以小车辆图标的形式在地图上显示，点击车辆图标会弹出车辆的基本信息和维修详细信息'" v-intro-step="1"></div>
    <div class="chart">
      <div v-intro="'饼形图表会动态的显示当前所有在修车辆正常状态和异常状态(告警、超时)的数量和所占比例'" v-intro-step="3" id="total-chart"></div>
    </div>
    <div class="list" v-if="showSide">
      <!-- <h4>车辆列表可收缩</h4>
      <h5>点击车辆会显示车辆的详细信息以及返修的过程记录</h5>
      <h5>点击地图上的车辆和列表的效果应一致,效果类似于轨迹记录</h5> -->
      <CarList ref="carlist" @changeShowingMarkers="changeShowingMarkers" @showCarInfo="showCarInfo" @changeMap="changeMap" :cars="showingCars" />
    </div>
    <CarInfo :car="showingCar" @close="closeInfo" v-if="isShowing" />
    <div class="switch" @click="toggleShowSide">
      <zx-icon :type="showSide ? 'zx-guanbi1' : 'zx-Group-'" />
    </div>
    <div v-intro="'点击科室名或者区域按钮可将显示的地图切换到对应(科室或区域)地图'" v-intro-step="2">
      <SmallMap v-if="allMaps.length > 1" :activeId="activeMapId" :maps="allMaps" @changeShownMap="changeMap" :carMapNum="carMapNum" />
    </div>
    <div class="global-map" v-show="showGlobalMap">
      <img :src="mapInfo.twoDFilePath" @click="changeMap(mapInfo.id)" alt="">
    </div>
    <el-button round type="primary" @click="changePage" class="fix-button">列表模式</el-button>
    <div v-if="!isShowingMapPage" class="select-page">
      <el-button @click="changePage" class="fix-button" round type="primary" >地图模式</el-button>
      <div class="car-stistic">
        <div class="title">实时在库分布</div>
      </div>
      <div class="car-table">
        <div class="title">
          PDI在库车详情表
        </div>
        <div class="action">
          <div class="check">
            <el-checkbox-group style="margin-left: 20px" :min="1" v-model="checkedAreaStatu" @change="checkedAreaChange" >
              <el-checkbox v-for="(map, index) in childMapInfos" :label="map.name" :key="map.id + index + map.name">{{map.name}}</el-checkbox>
            </el-checkbox-group>
          </div>
          <div class="search">
            <el-input v-model="searchParam" size="small" placeholder="请输入车架号" @keyup.enter.native="doSearch" @blur="doSearch" ></el-input>
          </div>
        </div>
        <div class="table">
          <el-table :data="tableCars" style="width: 100%;background:#fff0" size="small" >
            <el-table-column label="车架号" >
              <template slot-scope="scope">
                <div>{{scope.row.vehicle.identification}}</div>
              </template>
            </el-table-column>
            <el-table-column label="当前状态" >
              <template slot-scope="scope">
                <div>{{scope.row.areaId}}</div>
              </template>
            </el-table-column>
            <el-table-column label="位置" >
              <template slot-scope="scope">
                <div>{{scope.row.locator.statisticZone}}</div>
              </template>
            </el-table-column>
            <el-table-column label="在库时长" >
              <template slot-scope="scope">
                <div>{{scope.row.locator.statisticZone}}</div>
              </template>
            </el-table-column>
            <el-table-column label="标签状态" >
              <template slot-scope="scope">
                <div>{{scope.row.locator.statisticZone}}</div>
              </template>
            </el-table-column>
            <el-table-column label="责任部门" >
              <template slot-scope="scope">
                <div>{{scope.row.locator.statisticZone}}</div>
              </template>
            </el-table-column>
            <el-table-column label="检修内容" >
              <template slot-scope="scope">
                <div>{{scope.row.locator.statisticZone}}</div>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            class="pagination"
            :hide-on-single-page="false"
            :total="pagination.total"
            :page-size="pagination.pageSize"
            :current-page="pagination.current"
            @current-change="pageChanged"
            layout="total, prev, pager, next">
          </el-pagination>
        </div>
      </div>
    </div>
    <!-- <RepairTrack ref="repairTrack" /> -->
  </div>
</template>

<script>
/* eslint-disable no-undef */
// import imgMap from '../assets/img/office-map.png'
import echart from 'echarts'
import successCar from '../assets/img/car-blue.png'
import errorCar from '../assets/img/car-red.png'
import warnCar from '../assets/img/car-yellow.png'
import offlineCar from '../assets/img/car-offline.png'
import {
  initCarSize, initCarScale, introOption,
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
import {
  isInPolygon,
  computeCarScale,
} from '../utils/utils'
// import RepairTrack from '../components/RepairTrack'
import CarInfo from '@/components/CarInfo'
import CarList from '@/components/CarList'
import SmallMap from '@/components/SmallMap'
export default {
  name: 'home',
  components: {
    // HelloWorld
    // RepairTrack: () => import('../components/RepairTrack')
    // RepairTrack,
    CarList,
    CarInfo,
    SmallMap,
  },
  data () {
    return {
      showSide: true,
      showTrack: false,
      // 是否正在显示车辆详情
      isShowing: false,
      // 绑定
      bindCars: [],
      isLoadOK: false, // 几点页面加载是否完成
      markers: [],
      showingCar: {},
      specalAreas: [],
      divMarkers: [],
      currentMapPoints: '',
      currentMapInfo: '',
      showGlobalMap: false,
      carMapNum: new Map(),
      showingCars: [],
      names: ['正常', '告警'],
      skipIntro: true,
      carMarkerMap: {},
      isShowingMapPage: true, // 是否显示的时地图页面内容,
      checkedAreaStatu: [],
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1,
      },
      tableCars: [],
      searchParam: '',
      noUploadCars: [], // 未上传信息的车辆列表
      noUpLoadMarkers: [], // 未上传信息的车辆marker数组
      noUploadMap: new Map(), // 定位器ID 与 车辆和marker数组位置的映射关系
    }
  },
  created () {
    this.skipIntro = localStorage.getItem('homeIntro') || false
    this.checkedAreaStatu = this.childMapInfos.map((map) => {
      return map.name
    })
  },
  computed: {
    ...mapState(['mapInfo', 'carScale', 'productLineId', 'pointScale', 'childMapInfos', 'initMapZoom']),
    ...mapGetters(['overtime']),
    allMaps () {
      return [this.mapInfo, ...this.childMapInfos]
    },
    activeMapId () {
      return this.currentMapInfo.id
    },
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
      console.log('接收到alarm事件推送')
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
        let message = newAlarm.vin ? `<div>车辆 ${newAlarm.vin} 发生告警</div><div>内容: '${newAlarm.message}</div><div>时间: ${this.$moment(newAlarm.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div><div>地点: ${newAlarm.address ? newAlarm.address : '---'}</div>` : `<div>内容: '${newAlarm.message}</div><div>时间: ${this.$moment(newAlarm.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div><div>地点: ${newAlarm.address ? newAlarm.address : '---'}</div>`
        this.$notify.error({
          dangerouslyUseHTMLString: true,
          message,
          position: 'bottom-right',
          duration: 2500
        })
        // this.getBindCars()
      }
    },
    position (data) {
      console.log('接收到position事件推送')
      if (!this.isLoadOK) {
        // console.log('页面数据尚未计算完成，忽略本次位置推送')
        return
      }
      // console.log(data)
      // console.log(this.bindCars)
      const posList = JSON.parse(data).content
      console.log(posList)
      posList.forEach((newPos) => {
        // 找到对应的marker
        let index = this.carMarkerMap[newPos.id]
        // console.log(this.carMarkerMap)
        let markerIndex = index
        // console.log(markerIndex)
        // 移动位置正常逻辑
        if (this.carMarkerMap.hasOwnProperty(newPos.id) && markerIndex !== -1) {
          // console.log(this.markers)
          let currentMarker = this.markers[markerIndex].marker
          // console.log(this.bindCars)
          // let currentCarIndex = this.bindCars.findIndex((car) => car.vehicle.locatorId === newPos.id)
          let currentCarIndex = index
          // console.log(currentCarIndex)
          // 如果bindCars 有这两车就更新这辆车的位置信息
          // if (!newPos.existenceZone && currentMarker.isAddedToMap === true) {
          //   currentMarker.moveTo([newPos.y / this.pointScale, newPos.x / this.pointScale], 500, newPos.angle)
          // }
          currentMarker.setRotation(newPos.angle)
          currentMarker.angle = newPos.angle
          if (currentCarIndex !== -1) {
            // console.log(this.bindCars[currentCarIndex])
            if (this.bindCars[currentCarIndex].locator.x === newPos.x && this.bindCars[currentCarIndex].locator.y === newPos.y) return
            this.bindCars[currentCarIndex].locator.x = newPos.x
            this.bindCars[currentCarIndex].locator.y = newPos.y
          }
          // console.log(this.bindCars[currentCarIndex])
          // currentMarker.setLatLng([newPos.y, newPos.x])
          // console.log(newPos.angle)
          // console.log(currentMarker)
          // currentMarker.setPopupContent(newPos.y + ' ' + newPos.x)
          // currentMarker.openPopup()
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
          // 判断是否在地图区域外
          if (!isInPolygon([newPos.y / this.pointScale, newPos.x / this.pointScale], this.currentMapPoints) && currentMarker.isAddedToMap === true) { // 不在地图区域内，但这辆车是显示状态 -》从地图上移除这辆车
            console.log('remove marker')
            currentMarker.remove()
            currentMarker.isAddedToMap = false
          } else if (currentMarker.isAddedToMap === false && isInPolygon([newPos.y / this.pointScale, newPos.x / this.pointScale], this.currentMapPoints) && currentMarker.inSpecialArea === false) { // 在地图区域而且这辆车是隐藏状态(事实上可以理解为从地图外开进来的车) -》显示这辆车
            console.log('add marker')
            currentMarker.addTo(this.map)
            currentMarker.isAddedToMap = true
          }
          if (!newPos.existenceZone && currentMarker.isAddedToMap === true) {
            currentMarker.moveTo([newPos.y / this.pointScale, newPos.x / this.pointScale], 500, newPos.angle)
          }
          currentMarker.angle = newPos.angle
          // 计算区域
          // this.carMapNum = this.computeAreaCarNums()
          let point = [newPos.y / this.pointScale, newPos.x / this.pointScale]
          let mapId = this.computeWhichArea(point)
          if (this.bindCars[currentCarIndex].areaId !== mapId) {
            if (this.bindCars[currentCarIndex].areaId !== -1) {
              this.carMapNum.set(this.bindCars[currentCarIndex].areaId, this.carMapNum.get(this.bindCars[currentCarIndex].areaId) - 1)
            }
            if (mapId !== -1) {
              this.carMapNum.set(mapId, this.carMapNum.get(mapId) + 1)
            }
            this.bindCars[currentCarIndex].areaId = mapId
            this.carMapNum = new Map([...this.carMapNum])
          }
        } else {
          if (newPos.statisticZone !== 'bind') { // 不是在绑定点，实际已绑定但未上传绑定信息的车辆
            // 1.判断是否已存在于 noUploadCars 里面
            if (this.noUploadMap.has(newPos.id)) { // 已存在
              //  已存在，判断位置是否相同, 不一样就移动车辆 计算位置区域
              let curIndex = this.noUploadMap.get(newPos.id)
              if (newPos.x !== this.noUploadCars[curIndex].x || newPos.y !== this.noUploadCars[curIndex].y) {
                // 移动车辆
                this.noUploadCars[curIndex].y = newPos.y
                this.noUploadCars[curIndex].x = newPos.x
                let currentMarker = this.noUpLoadMarkers[curIndex]
                currentMarker.moveTo([newPos.y / this.pointScale, newPos.x / this.pointScale], 500, newPos.angle)
                currentMarker.angle = newPos.angle
                // 计算区域
                let point = [newPos.y / this.pointScale, newPos.x / this.pointScale]
                let mapId = this.computeWhichArea(point)
                if (this.noUploadCars[curIndex].areaId !== mapId) {
                  if (this.noUploadCars[curIndex].areaId !== -1) {
                    this.carMapNum.set(this.noUploadCars[curIndex].areaId, this.carMapNum.get(this.noUploadCars[curIndex].areaId) - 1)
                  }
                  if (mapId !== -1) {
                    this.carMapNum.set(mapId, this.carMapNum.get(mapId) + 1)
                  }
                  this.noUploadCars[curIndex].areaId = mapId
                  this.carMapNum = new Map([...this.carMapNum])
                }
              }
            } else { // 不存在 添加这两车
              // 计算区域
              let point = [newPos.y / this.pointScale, newPos.x / this.pointScale]
              let mapId = this.computeWhichArea(point)
              newPos.areaId = mapId
              if (mapId !== -1) {
                this.carMapNum.set(mapId, this.carMapNum.get(mapId) + 1)
              }
              this.carMapNum.set(this.mapInfo.id, this.carMapNum.get(this.mapInfo.id) + 1)
              this.carMapNum = new Map([...this.carMapNum])
              this.noUploadCars.push(newPos)
              let index = this.noUploadCars.length - 1
              this.renderNouploadMarker(newPos, index)
              this.noUploadMap.set(newPos.id, index)
            }
          }
        }
      })
      // 旧逻辑
    },
    bind (data) {
      if (!this.isLoadOK) {
        console.log('页面数据尚未计算完成，忽略本次位置推送')
        return
      }
      console.log('接收到bind事件')
      const newCar = JSON.parse(data)
      console.log(newCar)
      // 验证这辆车是否已存在与列表中，若存在则无视，若不存在则在车辆列表中添加这辆车并创建一个新的marker
      const carId = newCar.vehicle.id
      const locatorId = newCar.locator.id
      let hasThisCar = this.bindCars.find((car) => car.vehicle.id === carId)
      // console.log(hasThisCar)
      if (!hasThisCar) {
        console.log('add car')
        this.bindCars.push(newCar)
        // this.showingCars.push(newCar)
        this.renderMarker(newCar, this.bindCars.length - 1)
        // this.carMapNum = this.computeAreaCarNums()
        let point = [newCar.locator.y / this.pointScale, newCar.locator.x / this.pointScale]
        let mapId = this.computeWhichArea(point)
        // console.log(this.bindCars)
        // console.log(mapId)
        let currentCarIndex = this.bindCars.findIndex((car) => car.vehicle.id === carId)
        this.bindCars[currentCarIndex].areaId = mapId
        this.carMapNum.set(this.mapInfo.id, this.carMapNum.get(this.mapInfo.id) + 1)
        if (mapId !== -1) {
          this.carMapNum.set(mapId, this.carMapNum.get(mapId) + 1)
        }
        this.carMapNum = new Map([...this.carMapNum])
        // 如果这辆车位于未上传信息的车辆就删除原来信息
        if (this.noUploadMap.has(locatorId)) {
          const curIndex = this.noUploadMap.get(locatorId)
          // 从地图上移除marker
          this.noUpLoadMarkers[curIndex].remove()
          // 从数组中删除这一项
          this.noUpLoadMarkers.splice(curIndex, 1)
          this.noUploadCars.splice(curIndex, 1)
          // 从映射表中删除
          this.noUploadMap.delete(locatorId)
          // 更新统计区域信息
          // 1 总统计数量-1
          this.carMapNum.set(this.mapInfo.id, this.carMapNum.get(this.mapInfo.id) - 1)
          // 2 判断是否区域数量减一
          if (mapId !== -1) {
            this.carMapNum.set(mapId, this.carMapNum.get(mapId) - 1)
          }
          this.carMapNum = new Map([...this.carMapNum])
        }
      }
    },
    unbind (data) {
      if (!this.isLoadOK) {
        console.log('页面数据尚未计算完成，忽略本次位置推送')
        return
      }
      const removeCar = JSON.parse(data)
      console.log('删除了car')
      // console.log(removeCar)
      // 找到是否有这辆车
      let carIndex = this.bindCars.findIndex((car) => car.vehicle.id === removeCar.vehicle.id)
      let shownCarIndex = this.showingCars.findIndex((car) => car.vehicle.id === removeCar.vehicle.id)
      // 移除数据
      if (carIndex !== -1 && shownCarIndex !== -1) { // 存在这辆车
        if (this.bindCars[carIndex].areaId !== -1) {
          this.carMapNum.set(this.bindCars[carIndex].areaId, this.carMapNum.get(this.bindCars[carIndex].areaId) - 1)
          this.carMapNum = new Map([...this.carMapNum])
        }
        this.bindCars.splice(carIndex, 1)
        this.showingCars.splice(shownCarIndex, 1)
        // 找出这个marker
        // 找到对应的marker
        // this.carMapNum = this.computeAreaCarNums()
        let markerIndex = this.markers.findIndex((item) => item.id === removeCar.vehicle.id)
        if (markerIndex !== -1) {
          let currentMarker = this.markers[markerIndex].marker
          // console.log(currentMarker)
          // 删除marker
          currentMarker.remove()
          this.markers.splice(markerIndex, 1)
          // console.log(this.markers)
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
    // 切换页面显示
    changePage () {
      this.isShowingMapPage = !this.isShowingMapPage
      if (!this.isShowingMapPage) {
        this.pagination.total = this.bindCars.length
        this.tableCars = this.bindCars.slice(0, 10)
      }
    },
    pageChanged (ev) {
      // this.tableCars = this.bindCars.slice((ev - 1) * 10, ev * 10)
      this.pagination.current = ev
      this.tableCars = this.computeRenderCars()
    },
    checkedAreaChange (ev) {
      console.log(ev)
      this.tableCars = this.computeRenderCars()
    },
    doSearch () {
      console.log(this.searchParam)
      this.tableCars = this.computeRenderCars()
    },
    computeRenderCars () {
      let cars = this.bindCars
      if (this.searchParam) {
        cars = this.bindCars.filter((car) => car.vehicle.identification.includes(this.searchParam))
      }
      if (this.checkedAreaStatu.length !== this.childMapInfos.length) {
        cars = cars.filter((car) => {
          return this.checkedAreaStatu.some((area) => area === car.locator.statisticZone)
        })
      }
      cars = cars.slice((this.pagination.current - 1) * 10, this.pagination.current * 10)
      return cars
    },
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
        localStorage.setItem('homeIntro', true)
        // this.$refs['carlist'].guide()
      }).onexit(() => {
        localStorage.setItem('homeIntro', true)
        // this.$refs['carlist'].guide()
      })
    },
    computeChartData () {
      let data = this.names.map((name, index) => {
        // console.log(this.showingCars)
        let normalNums = this.showingCars.filter((car) => car.vehicle.status === 0).length
        if (index === 0) {
          return {
            value: normalNums,
            name
          }
        } else {
          return {
            value: this.showingCars.length - normalNums,
            name
          }
        }
      })
      // console.log(data)
      return data
    },
    toggleShowSide () {
      this.showSide = !this.showSide
    },
    renderChart () {
      const pieChart = echart.init(document.getElementById('total-chart'))
      pieChart.setOption({
        color: ['#00d2ff', 'red', '#01d2eff', '#fcff00', '#6e7074', '#546570', '#c4ccd3'],
        title: {
          text: '车辆状态比例',
          textStyle: {
            color: '#fff'
          },
          // textAlign: 'center',
          left: 'center',
          top: 10,
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        textStyle: {
          color: '#fefefe'
        },
        legend: {
          // type: 'scroll',
          // orient: 'vertical',
          left: 'center',
          bottom: '5%',
          data: this.names,
          textStyle: {
            color: '#fefefe'
          }
        },
        grid: {
          left: '20px',
          right: '20%',
          bottom: '20%',
          containLabel: true
        },
        series: [
          {
            name: '数量',
            type: 'pie',
            radius: ['15%', '20%'],
            // center: ['20%', '50%'],
            data: this.computeChartData(),
            label: {
              formatter: '{b} : \n{c} ({d}%)',
            }
          }
        ],
      })
      this.pieChart = pieChart
    },
    setChart () {
      this.pieChart && this.pieChart.setOption({
        series: [
          {
            data: this.computeChartData(),
          }
        ],
      })
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
      // console.log(new Data().valueOf())
      // let start = new Date().valueOf()
      let carMap = new Map()
      // let mapPoints
      // this.childMapInfos.forEach((mapInfo) => {
      //   carMap.set(mapInfo.id, 0)
      //   mapPoints = this.computeMapPoints(mapInfo)
      //   for (let i = 0; i < this.bindCars.length; i++) {
      //     let point = [this.bindCars[i].locator.y / this.pointScale, this.bindCars[i].locator.x / this.pointScale]
      //     // console.log(point)
      //     // console.log(mapPoints)
      //     if (isInPolygon(point, mapPoints)) {
      //       // console.log('+1')
      //       carMap.set(mapInfo.id, carMap.get(mapInfo.id) + 1)
      //     }
      //   }
      // })
      // 优化算法
      let mapBounds = this.childMapInfos.map((mapInfo) => {
        // console.log(mapInfo)
        carMap.set(mapInfo.id, 0)
        return {
          mapId: mapInfo.id,
          points: this.computeMapPoints(mapInfo)
        }
      })
      for (let i = 0; i < this.bindCars.length; i++) {
        let point = [this.bindCars[i].locator.y / this.pointScale, this.bindCars[i].locator.x / this.pointScale]
        let smallMapIndex = mapBounds.length - 1
        while (smallMapIndex >= 0) {
          if (isInPolygon(point, mapBounds[smallMapIndex].points)) {
            // ..
            let tem = carMap.get(mapBounds[smallMapIndex].mapId) || 0
            // ..
            this.bindCars[i].areaId = mapBounds[smallMapIndex].mapId
            carMap.set(mapBounds[smallMapIndex].mapId, tem + 1)
            break
          }
          smallMapIndex--
        }
        if (!this.bindCars[i].hasOwnProperty('areaId')) {
          this.bindCars[i].areaId = -1
        }
      }
      // 优化结束
      carMap.set(this.mapInfo.id, this.bindCars.length)
      console.log(carMap)
      // let end = new Date().valueOf()
      // console.log(end)
      // console.log(end - this.start)
      return carMap
    },
    /*
    * @return {id}
    * @param point {point}
    */
    computeWhichArea (point) {
      let mapBounds = this.childMapInfos.map((mapInfo) => {
        return {
          mapId: mapInfo.id,
          points: this.computeMapPoints(mapInfo)
        }
      })
      let smallMapIndex = mapBounds.length - 1
      while (smallMapIndex >= 0) {
        if (isInPolygon(point, mapBounds[smallMapIndex].points)) {
          return mapBounds[smallMapIndex].mapId
        }
        smallMapIndex--
      }
      return -1
    },
    // hignliaght marker
    hignlightMarker (carId, car) {
      let markerIndex = this.markers.findIndex((item) => item.id === carId)
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
    renderNouploadMarker (info, index) {
      let carPos = [info.y / this.pointScale, info.x / this.pointScale]
      let iconType = 'offline'
      let icon = this.createPointMarker(iconType)
      const marker = L.Marker.movingMarker([carPos], [], {
        rotate: true,
        icon,
        initialRotationAngle: 0,
        // title: car.locator.sn + ' ' + car.locator.y + ' ' + car.locator.x
      })
      marker.on('click', this.clickMarker)
      marker.locatorId = info.id
      marker.angle = info.angle
      this.noUpLoadMarkers.push(marker)
      this.map && marker.addTo(this.map)
    },
    // 渲染车辆点到地图上
    renderMarker (car, index) {
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
      // const marker = L.Marker.movingMarker([carPos.lat, carPos.lng], [], {
      const marker = L.Marker.movingMarker([carPos], [], {
        rotate: true,
        icon,
        initialRotationAngle: 0,
        // title: car.locator.sn + ' ' + car.locator.y + ' ' + car.locator.x
      })
      // 为marker绑上车和定位器的ID
      marker.carId = car.vehicle.id
      marker.locatorId = car.locator.id
      marker.bindPopup(`<div>车 架 号: ${car.vehicle.identification}</div><div>标 签 号: ${car.locator.sn}</div><div>位 置 :${car.locator.address}</div>`)
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
      // this.markers.push({
      //   marker,
      //   id: car.vehicle.id,
      //   locatorId: car.locator.id
      // })
      this.markers[index] = {
        marker,
        id: car.vehicle.id,
        locatorId: car.locator.id
      }
      this.carMarkerMap[car.locator.id] = index
      // console.log(this.carMarkerMap)
      // console.log(this.markers)
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
        productLineId: this.productLineId
      }
      getBindList(params).then((res) => {
        // console.log(res)
        if (res.code === 0) {
          // this.start = new Date().valueOf()
          this.bindCars = res.result
          if (!isInit) {
            // console.log('fresh')
            // console.log(this.carListTime)
            // this.bindCars = [...this.bindCars]
            if (this.currentMapInfo.id === this.mapInfo.id) {
              this.showingCars = this.bindCars
            } else {
              this.showingCars = this.bindCars.filter((car) => {
                let point = [car.locator.y / this.pointScale, car.locator.x / this.pointScale]
                let inArea = isInPolygon(point, this.currentMapPoints)
                return inArea
              })
            }
          }
          if (this.bindCars.length > 0 && isInit === true) {
            this.bindCars.forEach((car, index) => {
              this.renderMarker(car, index)
            })
            this.showingCars = this.bindCars
            this.renderChart()
            // 只有在数据加载完成后才开始操作指引
            this.$nextTick().then(() => {
              !this.skipIntro && this.guide()
            })
          }
          this.carMapNum = this.computeAreaCarNums()
          this.isLoadOK = true
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
      this.noUpLoadMarkers.forEach((marker) => {
        let carScale = this.currentMapInfo.zoom ? computeCarScale(this.currentMapInfo.zoom) : initCarScale
        this.setCarScaleAndRotate(marker, carScale, marker.angle)
      })
      this.setChart()
    },
    // 改变特殊区域的数量
    changeSpecialAreaNum (name, isAdd) {
      // console.log(name)
      for (let i = 0; i < this.specalAreas.length; i++) {
        // console.log(this.specalAreas[i].name)
        // console.log(typeof name)
        if (name.includes(this.specalAreas[i].name)) {
          // console.log('+1 -1')
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
      let center = [specalArea.center.y / this.pointScale, specalArea.center.x / this.pointScale]
      console.log(center)
      let divMarker = L.marker(center, { icon: myIcon })
      divMarker.name = specalArea.name
      divMarker.id = specalArea.id
      // console.log(divMarker)
      this.divMarkers.push(divMarker)
      divMarker.addTo(this.map)
      // console.log(this.divMarkers)
      // console.log(this.markers)
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
        if (currentMapInfo.id === this.mapInfo.id) {
          this.showingCars = this.bindCars
          // this.markers.forEach((item) => {
          //   if (item.marker.isAddedToMap === true) {
          //     this.setCarScaleAndRotate(item.marker, this.carScale, item.marker.angle)
          //   }
          // })
        } else {
          this.showingCars = this.bindCars.filter((car) => {
            let point = [car.locator.y / this.pointScale, car.locator.x / this.pointScale]
            let inArea = isInPolygon(point, this.currentMapPoints)
            // let currentMarker = this.markers.find((item) => item.id === car.vehicle.id).marker
            // if (!inArea) { // 不在区域中的车，找出对应的marker并隐藏
            //   currentMarker.remove()
            //   currentMarker.isAddedToMap = false
            // } else {
            //   if (currentMarker.isAddedToMap === false) {
            //     currentMarker.addTo(this.map)
            //     currentMarker.isAddedToMap = true
            //     // 改变车的大小和方向
            //     // console.log(currentMapInfo.carScale)
            //     // this.setCarScaleAndRotate(currentMarker, currentMapInfo.carScale, currentMarker.angle)
            //   }
            // }
            return inArea
          })
        }
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
        console.log(newVal)
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
  mounted () {
    this.getMapInfo().then((mapInfo) => {
      const centerx = mapInfo.coordinateDown / this.pointScale + mapInfo.coordinateUpper / this.pointScale
      const centery = mapInfo.coordinateLeft / this.pointScale + mapInfo.coordinateRight / this.pointScale
      const center = [centerx / 2, centery / 2]
      // eslint-disable-next-line no-undef
      const map = L.map('map', {
        // center: [0, 0],
        center,
        zoom: this.initMapZoom,
        minZoom: this.initMapZoom,
        maxZoom: this.initMapZoom,
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
          this.carListTime = setInterval(this.getBindCars, 1800000)
          // console.log(result)
          // this.carListTime = setInterval(() => {
          //   this.bindCars = [...this.bindCars]
          // }, 60000)
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
    // this.renderChart()
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
  position: relative;
  // display: grid;
  // grid-template-columns: auto 300px 350px;
  display: flex;
  padding: 0;
  .fix-button {
    display: block;
    position: absolute;
    top: 25px;
    left: 25px;
    color: #fff;
    z-index: 9000;
  }
  .select-page {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100vh;
    z-index: 100000;
    overflow-y: auto;
    .liner-gradient;
    .car-stistic {
      margin-top: 80px;
      padding: 0 25px;
      text-align: left;
      .title {
        font-size: 1.5rem;
      }
    }
    .car-table {
      margin-top: 20px;
      padding: 0 25px;
      .title {
        font-size: 1.5rem;
        text-align: left;
      }
      .action {
        display: grid;
        grid-template-columns: 1fr 300px;
        grid-template-rows: auto;
        margin: 10px 0;
        .check {
          // width: 50%;
          align-self: center;
          text-align: left;
        }
        .search {
          // float: right;
          text-align: left;
        }
      }
    }
  }
  .map {
    height: 100vh;
    width: 55%;
  }
  .chart {
    width: 20%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    #total-chart {
      width: 100%;
      height: 40vh;
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
    // position: absolute;
    width: 25%;
    top: 0;
    right: 0;
    z-index: 1001;
    height: 100%;
    border-radius: 10px;
    background: @base-background-opacity;
    // box-shadow: @shadow-base;
    padding: 40px 5px;
    // box-sizing: border-box;
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
