<template>
  <div class="page">
    <div class="layout">
      <div class="item table">
        <div class="total-left">
          <div class="head">
            <div class="child title">{{'在库 ' + info.keepNum + '台'}}</div>
            <div class="child title">{{'返修中 ' + info.repairing + '台'}}</div>
            <div class="child title">{{'线外滞留 ' + info.outLine + '台'}}</div>
          </div>
          <div class="item-content">
            <div class="tabs">
              <template v-for="(menu, index) in tabs">
                <div @click="activeTabIndex = index" :key="index" :class="activeTabIndex === index ? 'tab tab-active' : 'tab'">{{menu}}</div>
              </template>
            </div>
            <!-- <transition
              mode="out-in"
              enter-active-class="animated fadeInLeft"
              leave-active-class="animated fadeOutLeft"
              :duration = "{ entry: 500, leave: 500 }"
              > -->
              <div :key="0" v-if="activeTabIndex === 0" class="vq-table">
                <el-table :data="belongTable" :header-cell-style="{textAlign: 'center'}" header-cell-class-name="header-cell" cell-class-name="cell-table" row-class-name="row-table" style="width: 100%;background:#fff0;" >
                  <el-table-column label="科室" width="160" >
                    <template slot-scope="scope">
                      <div class="cell">{{scope.row.k}}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="室内" min-width="60" >
                    <template slot-scope="scope">
                      <div @click="showCarList(scope, 1)" :class="`${scope.$index === 0 || scope.$index === 1 ? 'cell cell-click' : scope.$index === 4 ? 'cell cell-click' : 'cell cell-click'}`" >{{scope.row.v.indoor}}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="室外"  min-width="60">
                    <template slot-scope="scope">
                      <div @click="showCarList(scope, 1)" :class="`${scope.$index === 0 || scope.$index === 1 ? 'cell cell-click' : scope.$index === 4 ? 'cell cell-click' : 'cell cell-click'}`">{{scope.row.v.outdoor}}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="超4小时" min-width="60" >
                    <template slot-scope="scope">
                      <div @click="showCarList(scope, 1)" :class="`${scope.$index === 0 || scope.$index === 1 ? 'cell cell-click' : scope.$index === 4 ? 'cell cell-click' : 'cell cell-click'}`">{{scope.row.v.gtFour}}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="超8小时" min-width="60" >
                    <template slot-scope="scope">
                      <div @click="showCarList(scope, 1)" :class="`${scope.$index === 0 || scope.$index === 1 ? 'cell cell-click' : scope.$index === 4 ? 'cell cell-click' : 'cell cell-click'}`">{{scope.row.v.gtEight}}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="室内外合计" min-width="60" >
                    <template slot-scope="scope">
                      <div :class="`${scope.$index === 0 || scope.$index === 1 ? 'cell cell-click' : scope.$index === 4 ? 'cell cell-click' : 'cell cell-click'}`">{{sumBelong(scope)}}</div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div :key="1" v-if="activeTabIndex === 1" class="vq-table">
                <el-table :data="areaTable" :header-cell-style="{textAlign: 'center'}" header-cell-class-name="header-cell" cell-class-name="cell-table" row-class-name="row-table" style="width: 100%;background:#fff0;" >
                  <el-table-column label="区域" width="160" >
                    <template slot-scope="scope">
                      <div class="cell">{{scope.row.k}}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="所有" min-width="60" >
                    <template slot-scope="scope">
                      <div @click="showCarList(scope, 2)" :class="`${scope.$index === 0 || scope.$index === 1 ? 'cell cell-click' : scope.$index === 4 ? 'cell cell-click' : 'cell cell-click'}`">{{scope.row.v.all}}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="超4小时" min-width="60" >
                    <template slot-scope="scope">
                      <div @click="showCarList(scope, 2)" :class="`${scope.$index === 0 || scope.$index === 1 ? 'cell cell-click' : scope.$index === 4 ? 'cell cell-click' : 'cell cell-click'}`">{{scope.row.v.gtFour}}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="超8小时" min-width="60" >
                    <template slot-scope="scope">
                      <div @click="showCarList(scope, 2)" :class="`${scope.$index === 0 || scope.$index === 1 ? 'cell cell-click' : scope.$index === 4 ? 'cell cell-click' : 'cell cell-click'}`">{{scope.row.v.gtEight}}</div>
                    </template>
                  </el-table-column>
                </el-table>
                <div v-if="info.outOfBatch" class="line-content">
                  <div class="sub-title">线内脱批: {{info.outOfBatch.oneDay + info.outOfBatch.threeDay}}台</div>
                  <div class="list">
                    <div class="warn">超一天(未达3天): {{info.outOfBatch.oneDay}}台</div>
                    <div class="error">超三天: {{info.outOfBatch.threeDay}}台</div>
                  </div>
                </div>
                <div v-if="info.afOutLine" class="title-sub">AF线外返修: {{info.afOutLine.threeHour + info.afOutLine.oneDay + info.afOutLine.threeDay}}台</div>
                <div v-if="info.afOutLine" class="out-line">
                  <div class="child success">超3h: {{info.afOutLine.threeHour}}</div>
                  <div class="child warn">超1天: {{info.afOutLine.oneDay}}</div>
                  <div class="child error">超3天: {{info.afOutLine.threeDay}}</div>
                </div>
              </div>
              <div :key="2" v-if="activeTabIndex === 2" class="vq-table">
                <div class="outline-total">
                  <div class="item">合计: <span>{{info.outLineStatistic.items.length || 0}}</span> 台</div>
                  <div class="item">超一天: <span>{{outline.oneDay || 0}}</span> 台</div>
                  <div class="item">超三天: <span>{{outline.threeDay || 0}}</span> 台</div>
                </div>
                <el-table :data="outlineTable" :header-cell-style="{textAlign: 'center'}" header-cell-class-name="header-cell" cell-class-name="cell-table" row-class-name="row-table" style="width: 100%;background:#fff0;" >
                  <el-table-column label="VIN" width="250" >
                    <template slot-scope="scope">
                      <div class="cell">{{scope.row.k}}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="滞留开始时间" min-width="60" >
                    <template slot-scope="scope">
                      <div :class="'cell cell-warn'" >{{moment(scope.row.v).format('YYYY-MM-DD HH:mm:ss')}}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="滞留时长"  min-width="60">
                    <template slot-scope="scope">
                      <div :class="'cell cell-error'" >{{getHours(scope)}}</div>
                    </template>
                  </el-table-column>
                </el-table>
                <el-pagination
                  class="pagination"
                  :hide-on-single-page="true"
                  :total="pagination.total"
                  :page-size="pagination.pageSize"
                  :current-page="pagination.current"
                  @current-change="pageChanged"
                  layout="total, prev, pager, next">
                </el-pagination>
              </div>
            <!-- </transition> -->
          </div>
        </div>
      </div>
      <!-- <div class="item"></div> -->
      <div class="item exception">
        <div class="total-right">
          <div class="date">
            <div class="time">{{moment(date).format('HH:mm:ss')}}</div>
            <div class="date-info">
              <div class="child day">{{moment(date).format('YYYY-MM-DD')}}</div>
              <div class="child week">{{moment(date).format('dddd')}}</div>
            </div>
          </div>
          <div class="error-infos">
            <div class="map">
              <div id="map-small" class="page-map"></div>
            </div>
            <div class="park-color">
              <ParkColor />
              <CarTypes />
            </div>
          </div>
          <div v-if="showException" class="error-infos car-list">
            <div class="sub-title">
              <div>{{exceptionTitle}}</div>
              <div @click="onCloseException" class="close-icon">
                <zx-icon style="color: red" type="zx-guanbi1"></zx-icon>
              </div>
            </div>
            <div class="list-content">
              <template v-for="(car, index) in showCars">
                <div class="list-item" :key="index">
                  <!-- <div class="item-row">
                    <div class="name">发生时间</div>
                    <div class="val">{{moment(log.time).format('YYYY-MM-DD hh:mm:ss')}}</div>
                  </div> -->
                  <div class="item-row">
                    <div class="name">车架号</div>
                    <div class="val">{{car.vehicle.identification}}</div>
                  </div>
                  <!-- <div class="item-row">
                    <div class="name">车辆故障</div>
                    <div class="val">{{car.vehicle.flawDetail}}</div>
                  </div> -->
                  <div class="item-row">
                    <div class="name">位置</div>
                    <div class="val">{{car.locator.address}}</div>
                  </div>
                  <div class="item-row">
                    <div class="name">详情</div>
                    <div class="val" @click="showCarInfo(car)" style="cursor: pointer; color: #00d2ff">
                      查看详情
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="item chart bar" id="line-node"></div>
      <div class="item chart line" id="line-time"></div>
      <!-- <div class="item chart car" id="pie-total">
        <div class="map">
          <div id="map-small" class="page-map"></div>
        </div>
      </div> -->
    </div>
    <CarInfo :car="showingCar"  @close="closeInfo" v-if="isShowing" />
  </div>
</template>
<script>
// import ShowTime from '@/components/showTime'
import CarInfo from '../components/CarInfo'
import ParkColor from '../components/ParkColor'
import CarTypes from '../components/CarTypes'
import {
  initCarSize,
  speLocatorId
} from '../config/config'
import echart from 'echarts'
import bus from '@/bus/bus'
import { baseChartOption } from '../config/chartConfig'
// import { broads } from '../mock/broad'
import { getHours } from '../mock/days'
// import imgMap from '../assets/img/office-map.png'
import { cars } from '../mock/cars'
import moment from 'moment'
// import SeamLessScroll from 'vue-seamless-scroll'
import {
  // getRealTimeData,
  // getStatisticData,
  getBindList,
  getAlarmList,
  queryStore,
  queryEfficiency,
  querySummary,
  getSpecicalFence,
  getStatistic,
  getCarsByType,
  queryCars
} from '../api/vq'
import {
  getParksByType
} from '../api/fence'
import {
  renderPark,
} from '../utils/map'
import {
  createBindCarMap
} from '../utils/car'
import alarmCar from '../assets/img/car-red.png'
import overtimeCar from '../assets/img/car-yellow.png'
import normalCar from '../assets/img/car-blue.png'
import offlineCar from '../assets/img/car-offline.png'
import speCar from '../assets/img/car-offline-bak.png'
import {
  mapState,
  mapActions,
  mapGetters,
} from 'vuex'
import {
  formatTime as getDuration,
} from '../utils/utils'
export default {
  data () {
    return {
      outline: {},
      activeTabIndex: 0,
      showVqTable: true,
      showException: false,
      tableData: [],
      belongTable: [],
      areaTable: [],
      outlineTable: [],
      exceptionTitle: '',
      isShowing: false,
      isLoadOK: false,
      showingCar: '',
      showCars: [],
      broad: '',
      cars,
      alarms: [],
      charts: [],
      loadOk: false,
      bindCars: [],
      // 地图上所有车的点数组
      markers: [],
      // percentData: ''
      storeData: '',
      importantLogs: [],
      specalAreas: [],
      divMarkers: [],
      carMarkerMap: {},
      noUploadCars: [], // 未上传信息的车辆列表
      noUpLoadMarkers: [], // 未上传信息的车辆marker数组
      noUploadMap: new Map(), // 定位器ID 与 车辆和marker数组位置的映射关系
      date: '',
      info: '',
      tabs: ['归属统计', '区域统计', '线外滞留'],
      officeMap: [
        { key: 'we', name: 'WE' },
        { key: 'af', name: 'AF' },
        { key: 'dhec', name: 'DHEC' },
        { key: 'pq', name: 'PQ' },
        { key: 'pa', name: 'PA' },
      ],
      nodeMap: [
        { key: 'delivery', name: '待 出 荷' },
        { key: 'area1', name: '再检查1' },
        { key: 'area2', name: '再检查2' },
        { key: 'area3', name: '再检查3' },
        { key: 'vqCheck', name: 'VQ解析' }
      ],
      searchParam: '',
      pagination: {
        pageSize: 6,
        total: 0,
        current: 1,
      },
      // 新添加使用hashTable 储存 车辆 marker
      bindCarMap: new Map(),
      unbindCarMap: new Map(),
      bindMarkerMap: new Map(),
      unbindMarkerMap: new Map(),
    }
  },
  components: {
    CarInfo,
    // ShowTime
    // SeamLessScroll
    // CountTo: () => import('../components/CountTo'),
    // TotalItem: () => import('../components/TotalItem'),
    ParkColor,
    CarTypes,
  },
  computed: {
    ...mapState(['carScale', 'productLineId', 'pointScale', 'initMapZoom', 'vqMapZoom', 'vqCarScale']),
    ...mapGetters(['overtime']),
    percentData () {
      // console.log(this.bindCars)
      if (this.bindCars.length > 0) {
        let allNum = this.bindCars.length
        // eslint-disable-next-line eqeqeq
        let normalNum = this.bindCars.filter((car) => car.vehicle.status === 0).length
        // eslint-disable-next-line eqeqeq
        // let alarms = this.bindCars.filter((car) => {
        //   // console.log(car)
        //   return car.vehicle.status === 1
        // })
        // console.log(alarms)
        let alarmNum = this.bindCars.filter((car) => car.vehicle.status !== 0).length
        // let overtimeNum = this.bindCars.filter((car) => isDelay(car.vehicleDeliverStatus.bindTime)).length
        // console.log(alarmNum)
        let normal = {
          title: '正常车辆',
          num: normalNum,
          percent: Math.floor(normalNum / allNum * 100) || 0,
          // color: 'primary'
        }
        let alarm = {
          title: '告警车辆',
          num: alarmNum,
          percent: Math.floor(alarmNum / allNum * 100) || 0,
          color: '#ea2218',
        }
        // let overtime = {
        //   title: '超时车辆',
        //   num: overtimeNum,
        //   percent: Math.floor(overtimeNum / allNum * 100) || 0,
        //   color: 'warning'
        // }
        // console.log([normal, alarm])
        return [normal, alarm]
      } else {
        return ''
      }
    },
  },
  created () {
    this.getBoradData()
    this.getChartData()
    // this.getAlarmData()
    this.getStoreData()
    this.getImportantSummary()
    this.queryStatistic()
    this.dateTime = setInterval(() => {
      this.date = new Date()
    }, 1000)
  },
  sockets: {
    connect (data) {
      // console.log(data)
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
      // let markerIndex = this.markers.findIndex((item) => item.locatorId === newAlarm.locatorId)
      // 改变marker以及数据状态
      if (this.bindMarkerMap.has(newAlarm.locatorId)) {
        let currentMarker = this.bindMarkerMap.get(newAlarm.locatorId)
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
      posList.forEach((newPos, index) => {
        const locatorId = newPos.id
        // 找到对应的marker
        // let index = this.carMarkerMap[newPos.id]
        // console.log(this.carMarkerMap)
        // let markerIndex = index
        // console.log(markerIndex)
        // 移动位置正常逻辑
        if (this.bindCarMap.has(locatorId)) {
          // console.log(this.markers)
          let currentMarker = this.bindMarkerMap.get(locatorId)
          let currentCarIndex = this.bindCars.findIndex((car) => car.locator.id === locatorId)
          if (currentCarIndex !== -1) {
            // console.log(this.bindCars[currentCarIndex])
            // if (this.bindCars[currentCarIndex].locator.x === newPos.x && this.bindCars[currentCarIndex].locator.y === newPos.y) return
            this.bindCars[currentCarIndex].locator.x = newPos.x
            this.bindCars[currentCarIndex].locator.y = newPos.y
          }
          // 判断是否在特殊区域
          if (newPos.existenceZone || newPos.otherZone) { // 如果位置点在存在性区域中
            if (!currentMarker.inSpecialArea) { // 如果这个marker以前不在这个区域
              // 去除这个marker 更新数据
              let zone = newPos.existenceZone ? newPos.existenceZone : newPos.otherZone
              this.changeSpecialAreaNum(zone, true)
              currentMarker.zone = zone
              currentMarker.inSpecialArea = true
              currentMarker.remove()
            }
          } else if (newPos.existenceZone === null && newPos.otherZone === null) { // 如果这个marker不在需检测的存在性区域中
            if (currentMarker.inSpecialArea === true) { // 以前这个marker在存在性区域
              // 将这个marker显示出来
              currentMarker.addTo(this.map)
              currentMarker.inSpecialArea = false
              // 更新数据
              this.changeSpecialAreaNum(currentMarker.zone, false)
            }
          }
          if (!newPos.existenceZone && !newPos.otherZone && currentMarker.isAddedToMap === true) {
            // console.log(newPos.angle)
            currentMarker.moveTo([newPos.y / this.pointScale, newPos.x / this.pointScale], 500, newPos.angle)
          }
          currentMarker.angle = newPos.angle
        } else {
          if (!(newPos.statisticZone && newPos.statisticZone.includes('chain'))) { // 不是在绑定点，实际已绑定但未上传绑定信息的车辆
            // 1.判断是否已存在于 noUploadCars 里面
            // console.log(this.noUploadMap)
            if (this.unbindCarMap.has(locatorId)) { // 已存在
              //  已存在，判断位置是否相同, 不一样就移动车辆 计算位置区域
              // let curIndex = this.noUploadMap.get(newPos.id)
              // 移动车辆
              let currentMarker = this.unbindMarkerMap.get(locatorId)
              if (newPos.existenceZone || newPos.otherZone) { // 如果位置点在存在性区域中
                if (!currentMarker.inSpecialArea) { // 如果这个marker以前不在这个区域
                  // 去除这个marker 更新数据
                  let zone = newPos.existenceZone ? newPos.existenceZone : newPos.otherZone
                  this.changeSpecialAreaNum(zone, true)
                  currentMarker.zone = zone
                  currentMarker.inSpecialArea = true
                  currentMarker.remove()
                }
              } else if (newPos.existenceZone === null && newPos.otherZone === null) { // 如果这个marker不在需检测的存在性区域中
                if (currentMarker.inSpecialArea === true) { // 以前这个marker在存在性区域
                  // 将这个marker显示出来
                  currentMarker.addTo(this.map)
                  currentMarker.inSpecialArea = false
                  // 更新数据
                  this.changeSpecialAreaNum(currentMarker.zone, false)
                }
              }
              currentMarker.moveTo([newPos.y / this.pointScale, newPos.x / this.pointScale], 500, newPos.angle)
              currentMarker.angle = newPos.angle
            } else { // 不存在 添加这两车
              this.unbindCarMap.set(locatorId, newPos)
              // this.noUploadCars.push(newPos)
              this.renderNouploadMarker(newPos, index)
              // this.noUploadMap.set(newPos.id, index)
            }
          } else { // 在绑定点，但有这两车，删除
            if (this.unbindCarMap.has(locatorId)) {
              this.unbindMarkerMap.get(locatorId).remove()
              this.unbindMarkerMap.delete(locatorId)
              this.unbindCarMap.delete(locatorId)
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
      // const carId = newCar.vehicle.id
      const locatorId = newCar.locator.id
      let hasThisCar = this.bindCarMap.has(locatorId)
      // console.log(hasThisCar)
      if (!hasThisCar) {
        console.log('add car')
        this.bindCars.push(newCar)
        this.bindCarMap.set(locatorId, newCar)
        console.log(this.showingCars)
        // this.showingCars.push(newCar)
        // console.log(this.showingCars)
        this.renderMarker(newCar, this.bindCars.length - 1)
        // 如果这辆车位于未上传信息的车辆就删除原来信息
        if (this.unbindCarMap.has(locatorId)) {
          // 从地图上移除marker
          this.unbindMarkerMap.get(locatorId).remove()
          this.unbindMarkerMap.delete(locatorId)
          this.unbindCarMap.delete(locatorId)
        }
        // console.log(this.showingCars)
      }
    },
    unbind (data) {
      if (!this.isLoadOK) {
        console.log('页面数据尚未计算完成，忽略本次位置推送')
        return
      }
      console.log('接收到unbind事件')
      const removeCar = JSON.parse(data)
      console.log(removeCar)
      const locatorId = removeCar.vehicle.locatorId
      // 找到是否有这辆车
      let carIndex = this.bindCars.findIndex((car) => car.vehicle.id === removeCar.vehicle.id)
      // let shownCarIndex = this.showingCars.findIndex((car) => car.vehicle.id === removeCar.vehicle.id)
      // 移除数据
      if (this.bindCarMap.has(locatorId)) { // 存在这辆车
        // console.log(this.carMarkerMap)
        delete this.carMarkerMap[removeCar.locatorId]
        this.bindCars.splice(carIndex, 1)
        // this.showingCars.splice(shownCarIndex, 1)
        // 找出这个marker
        // 找到对应的marker
        this.bindMarkerMap.get(locatorId).remove()
        this.bindMarkerMap.delete(locatorId)
        this.bindCarMap.delete(locatorId)
      }
    },
    changeBind (data) {
      const car = JSON.parse(data)
      // console.log(car)
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
      // console.log(this.markers)
      // console.log(this.bindCars)
    }
  },
  methods: {
    ...mapActions(['getMapInfo']),
    moment,
    onSearch () {
      if (this.searchParam === '') return false
      // 查找车辆
      let curCar = this.bindCars.find((car) => {
        return car.vehicle.identification === this.searchParam || car.locator.sn === this.searchParam
      })
      if (curCar) {
        // ..
        const currentMarker = this.markers[this.carMarkerMap[curCar.locator.id]].marker
        let isOpenPopup = currentMarker.isPopupOpen()
        if (!isOpenPopup) {
          currentMarker.openPopup()
        }
      } else {
        // console.log(this.noUpLoadMarkers)
        let curCar = this.noUploadCars.find((car) => car.sn === this.searchParam)
        if (curCar) {
          // console.log(curCar)
          // console.log(this.noUploadMap)
          let marker = this.noUpLoadMarkers[this.noUploadMap.get(curCar.id)]
          // console.log(marker)
          let isOpenPopup = marker.isPopupOpen()
          if (!isOpenPopup) {
            marker.openPopup()
          }
        } else {
          this.$message.error('很抱歉没有找到相关车辆')
        }
      }
    },
    sum (scope) {
      const range = ['af', 'pa', 'we', 'pq', 'dhec']
      return range.reduce((pre, cur) => {
        return pre + scope.row[cur]
      }, 0)
    },
    sumBelong (scope) {
      let res = 0
      Object.keys(scope.row.v).forEach((key) => {
        if (key === 'indoor' || key === 'outdoor') {
          res += scope.row.v[key]
        }
      })
      return res
    },
    getHours (scope) {
      return getDuration(moment().unix() - scope.row.v / 1000)
      // return moment.duration(moment().valueOf() - scope.row.v, 'ms').asHours() + ' 小时'
    },
    pageChanged (ev) {
      // console.log(ev)
      // console.log(this.info.outLineStatistic.items)
      this.outlineTable = this.info.outLineStatistic.items.slice(6 * (ev - 1), 6 * ev)
      // console.log(this.outlineTable)
      this.pagination.current = ev
    },
    showCarList (scope, index) {
      console.log(scope)
      if (scope.$index === 5) return false // 点击合计无效
      if (scope.column.label === '合计') return false
      if (index === 2 && scope.row.k === '合计') return
      // 请求
      const label = scope.column.label
      const map = {
        WE: 1,
        AF: 2,
        PQ: 3,
        PA: 4,
        DHEC: 5,
        'STATISTIC': 7,
        'VQ': 6
      }
      const typeMap = {
        '超4小时': 1,
        '超8小时': 2,
        '室外': 3,
        '室内': 4,
        '所有': 5
      }
      let param
      if (index === 1) {
        param = {
          type: map[scope.row.k],
          timeType: typeMap[label],
        }
      } else {
        param = {
          type: 7,
          areaName: scope.row.k,
          timeType: typeMap[label]
        }
      }
      // const param = {
      //   timeType: scope.$index + 1,
      //   type: map[label]
      // }
      // console.log(param)
      getCarsByType(param).then((res) => {
        const { code, result } = res
        if (code === 0) {
          // console.log(result)
          this.showCars = result
          this.exceptionTitle = scope.row.k + ' ' + scope.column.label + '车辆'
          this.showException = true
        }
      })
    },
    onCloseException () {
      this.isShowing = false
      this.showException = false
      this.exceptionTitle = ''
    },
    closeInfo () {
      this.isShowing = false
      // this.showException = false
    },
    showCarInfo (car) {
      const param = {
        productLineId: 1,
        bind: true,
        vehicleId: car.vehicle.id
      }
      queryCars(param).then((res) => {
        console.log(res)
        const { code, result } = res
        if (code === 0) {
          this.showingCar = result.resultList[0]
          this.isShowing = true
        }
      })
    },
    isDelay (bindTime) {
      // console.log(bindTime)
      let duration = this.$moment().valueOf() - bindTime
      // console.log(duration)
      let hours = this.$moment.duration(duration / 1000, 's').asHours().toFixed(2)
      // console.log(hours)
      if (hours * 1 >= this.overtime * 1) {
        return true
      } else {
        return false
      }
    },
    // 获取效率数据
    getBoradData () {
      queryEfficiency().then((res) => {
        // console.log(res)
        if (res.code === 0) {
          let broadInfo = res.result
          broadInfo.forEach((item) => {
            if (item.index === 1) {
              item.icon = 'zx-xiaoshichuhe-1'
            } else if (item.index === 2) {
              item.icon = 'zx-xiaoshichuhe-'
            } else if (item.index === 3) {
              item.icon = 'zx-pingjunchuhe-1'
              item.today = item.today / 1000 / 60 / 60
              item.yesterday = item.yesterday / 1000 / 60 / 60
              item.average = item.average / 1000 / 60 / 60
            }
          })
          // console.log(storeInfo)
          this.broad = broadInfo
        }
      })
    },
    // 获取库存信息
    getStoreData () {
      queryStore().then((res) => {
        // console.log(res)
        if (res.code === 0) {
          let storeInfo = res.result
          storeInfo.forEach((item) => {
            if (item.index === 1) {
              item.icon = 'zx-ruku'
            } else if (item.index === 2) {
              item.icon = 'zx-chuku'
            } else if (item.index === 3) {
              item.icon = 'zx-kucun'
            }
          })
          // console.log(storeInfo)
          this.storeData = storeInfo
        }
      })
    },
    // 获取重要事件
    getImportantSummary () {
      querySummary().then((res) => {
        // console.log(res)
        let { code, result } = res
        if (code === 0) {
          this.importantLogs = result
          // console.log(result)
          // for (let index = 0; index < result.length; index += 5) {
          //   // console.log(index)
          //   // let item = result.slice(index, index + 5)
          //   let item = result.slice(index, index + 5)
          //   // console.log(item)
          //   this.importantLogs.push(item)
          // }
          // console.log(this.importantLogs)
        }
      })
    },
    // 获取过往统计数据
    getChartData () {
      getStatistic().then((res) => {
        // console.log(res)
        if (res.code === 0) {
          this.charts = res.result
          // this.loadOk = true
          // console.log(this.charts)
        }
      })
    },
    // 获取绑定的车辆信息
    getBindCars (isInit) {
      let params = {
        productLineId: this.productLineId
      }
      getBindList(params).then((res) => {
        console.log(res)
        if (res.code === 0) {
          this.bindCars = res.result
          this.bindCarMap = createBindCarMap(this.bindCars)
          if (!isInit) {
            console.log('fresh')
            this.bindCars = [...this.bindCars]
          }
          if (this.bindCars.length > 0 && isInit === true) {
            this.bindCars.forEach((car, index) => {
              this.renderMarker(car, index)
            })
          }
        }
        this.isLoadOK = true
      })
    },
    // 获取当前所有告警信息
    getAlarmData () {
      getAlarmList().then((res) => {
        // console.log(res)
        if (res.code === 0) {
          this.alarms = res.result.resultList
        }
      })
    },
    // 判断数据正常异常
    judgeTodayData (index, now, yesterday) {
      if (index === 0 || index === 2) {
        if (now > yesterday) {
          return 'success'
        } else {
          return 'error'
        }
      }
      if (index === 1 || index === 3) {
        if (now > yesterday) {
          return 'error'
        } else {
          return 'success'
        }
      }
    },
    // 获取统计信息 （新版UI）
    queryStatistic () {
      getStatistic().then((res) => {
        // console.log(res)
        if (res.code === 0) {
          const sum = (items, key) => {
            return items.reduce((pre, cur) => {
              return pre + cur.v[key]
            }, 0)
          }
          const createObj = (items) => {
            let temObj = {}
            Object.keys(items[0].v).forEach((key) => {
              temObj[key] = sum(items, key)
            })
            return temObj
          }
          this.info = res.result
          this.info.belongStatistic.items.length > 0 && this.info.belongStatistic.items.push({
            k: '合计',
            v: createObj(this.info.belongStatistic.items)
          })
          this.belongTable = this.info.belongStatistic.items
          this.info.areaStatistic.items.length > 0 && this.info.areaStatistic.items.push({
            k: '合计',
            v: createObj(this.info.areaStatistic.items)
          })
          // console.log(this.belongTable)
          this.areaTable = this.info.areaStatistic.items
          this.outlineTable = this.info.outLineStatistic.items.slice(0, 6)
          this.pagination.total = this.info.outLineStatistic.items.length
          let outline = {
            oneDay: 0,
            threeDay: 0
          }
          this.info.outLineStatistic.items.forEach((item) => {
            if (moment().valueOf() - item.v > 24 * 3600 * 1000) {
              // console.log(1)
              // this.info.gtOneDay ? this.info.gtOneDay += 1 : this.info.gtOneDay = 1
              outline.oneDay++
            }
            if (moment().valueOf() - item.v > 3 * 24 * 3600 * 1000) {
              // console.log(3)
              // this.info.gtThreeDay ? this.info.gtOneDay += 1 : this.info.gtOneDay = 1
              outline.threeDay++
            }
          })
          this.outline = outline
          // console.log(this.info)
          this.$nextTick().then(() => {
            this.renderCharts()
          })
          // this.loadOk = true
          // this.updateCharts()
        }
      })
    },
    // 渲染图标数据
    renderCharts () {
      // console.log('start')
      // 饼图 维修时长分段统计数据
      // const pieTotal = echart.init(document.getElementById('pie-total'))
      // 线图 按小时的在库数量趋势
      const lineTime = echart.init(document.getElementById('line-time'))
      // 线图 各节点实时台数
      const lineNode = echart.init(document.getElementById('line-node'))
      const timeOption = {
        title: {
          text: '今日在库变化趋势',
          textStyle: {
            color: '#fefefe'
          },
          // textAlign: 'center',
          left: 'center',
          top: 10,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          // formatter: '{a} {c}%'
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            // name: '时间',
            // data: legend,
            data: getHours(),
            axisLine: {
              lineStyle: {
                color: '#fefefe',
                width: 1
              }
            },
            axisTick: {
              interval: 0
            },
            // axisLabel: {
            //   interval: 0,
            //   fontSize: 9
            // },
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '数量',
            splitLine: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: '#fefefe',
                width: 1
              }
            },
          }
        ],
        axisLine: {
          lineStyle: {
            color: '#fefefe'
          }
        },
        series: [
          {
            type: 'line',
            smooth: true,
            areaStyle: {
              // color: '#00d2ff58'
              color: 'rgba(0, 208, 255, 0.35)'
            },
            data: this.info.hourStatistic.items.filter((item) => item.k >= moment().startOf('day').valueOf()).map((item) => item.v)
          }
        ],
      }
      const nodeOption = {
        color: ['rgba(27, 212, 141, 0.9)'],
        title: {
          text: '各节点实时生产台数',
          textStyle: {
            color: '#fefefe'
          },
          // textAlign: 'center',
          left: '30%',
          top: 10,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        grid: {
          left: '5%',
          right: '10%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'value',
            boundaryGap: false,
            name: '数量',
            axisLine: {
              lineStyle: {
                color: '#fefefe',
                width: 1
              }
            },
            splitLine: {
              show: false,
            }
          }
        ],
        yAxis: [
          {
            type: 'category',
            // name: '小时',
            splitLine: {
              show: false
            },
            axisLabel: {
              interval: 0,
              fontSize: 9
            },
            axisTick: {
              show: false
            },
            data: this.info.nodeStatistic.items.map((item) => item.k),
            axisLine: {
              lineStyle: {
                color: '#fefefe',
                width: 1
              }
            },
          }
        ],
        series: [
          {
            type: 'bar',
            barWidth: '30%',
            label: {
              normal: {
                show: true,
                position: 'right'
              }
            },
            data: this.info.nodeStatistic.items.map((item) => item.v)
          }
        ]
      }
      lineNode.setOption(Object.assign(baseChartOption, nodeOption))
      const lineTimeOption = Object.assign(baseChartOption, timeOption)
      lineTime.setOption(lineTimeOption)
      window.addEventListener('resize', () => {
        // pieTotal.resize()
        lineNode.resize()
        lineTime.resize()
      })
      bus.$on('menuSizeChanged', (statu) => {
        // console.log('resize')
        setTimeout(() => {
          // pieTotal.resize()
          lineNode.resize()
          lineTime.resize()
        }, 500)
      })
      this.lineTime = lineTime
      // this.pieTotal = pieTotal
      this.lineNode = lineNode
    },
    // 更新图表新UI
    updateCharts () {
      this.lineTime && this.lineTime.setOption({
        series: [{
          data: this.info.hourStatistic.items.filter((item) => item.k >= moment().startOf('day').valueOf()).map((item) => item.v)
        }]
      })
      this.lineNode && this.lineNode.setOption({
        yAxis: [
          {
            data: this.info.nodeStatistic.items.map((item) => item.k)
          }
        ],
        series: [
          {
            data: this.info.nodeStatistic.items.map((item) => item.v)
          }
        ]
      })
      this.pieTotal && this.pieTotal.setOption({
        series: [
          {
            data: [
              { value: this.info.timeoutTable.timeout1, name: '超1.5h' },
              { value: this.info.timeoutTable.timeout2, name: '超8h' },
              { value: this.info.timeoutTable.timeout3, name: '超3天' },
            ]
          }
        ]
      })
    },
    updatePage () {
      getStatistic().then((res) => {
        if (res.code === 0) {
          this.info = res.result
          this.updateCharts()
          const sum = (items, key) => {
            return items.reduce((pre, cur) => {
              return pre + cur.v[key]
            }, 0)
          }
          const createObj = (items) => {
            let temObj = {}
            Object.keys(items[0].v).forEach((key) => {
              temObj[key] = sum(items, key)
            })
            return temObj
          }
          this.info.belongStatistic.items.length > 0 && this.info.belongStatistic.items.push({
            k: '合计',
            v: createObj(this.info.belongStatistic.items)
          })
          this.belongTable = this.info.belongStatistic.items
          this.info.areaStatistic.items.length > 0 && this.info.areaStatistic.items.push({
            k: '合计',
            v: createObj(this.info.areaStatistic.items)
          })
          // console.log(this.belongTable)
          this.areaTable = this.info.areaStatistic.items
          this.outlineTable = this.info.outLineStatistic.items.slice(0, 6)
          this.pagination.total = this.info.outLineStatistic.items.length
          let outline = {
            oneDay: 0,
            threeDay: 0
          }
          this.info.outLineStatistic.items.forEach((item) => {
            if (moment().valueOf() - item.v > 24 * 3600 * 1000) {
              // console.log(1)
              // this.info.gtOneDay ? this.info.gtOneDay += 1 : this.info.gtOneDay = 1
              outline.oneDay++
            }
            if (moment().valueOf() - item.v > 3 * 24 * 3600 * 1000) {
              // console.log(3)
              // this.info.gtThreeDay ? this.info.gtOneDay += 1 : this.info.gtOneDay = 1
              outline.threeDay++
            }
          })
          // console.log('update')
          this.outline = outline
        }
      })
    },
    // 创建点marker
    createPointMarker (statu) {
      let carImg
      switch (statu) {
        case 'alarm':
          carImg = alarmCar
          break
        case 'overtime':
          carImg = overtimeCar
          break
        case 'normal':
          carImg = normalCar
          break
        case 'offline':
          carImg = offlineCar
          break
        case 'spe':
          carImg = speCar
          break
        default:
          carImg = normalCar
          break
      }
      // eslint-disable-next-line no-undef
      // console.log(carImg)
      // console.log(initCarSize)
      const icon = L.icon({
        iconUrl: carImg,
        iconAnchor: [initCarSize[0] * this.vqCarScale / 2, initCarSize[1] * this.vqCarScale / 2],
        iconSize: [initCarSize[0] * this.vqCarScale, initCarSize[1] * this.vqCarScale]
      })
      return icon
    },
    computedIconType (car) {
      let bindTime = car.vehicleDeliverStatus.bindTime
      if (car.locator.sn === speLocatorId) {
        return 'spe'
      }
      // console.log(this.formatTime(bindTime))
      // console.log(this.overtime)
      // console.log(this.formatTime(bindTime) > this.overtime)
      if (this.formatTimeOnly(bindTime) * 1 > this.overtime * 1) {
        // console.log(true)
        return 'overtime'
      } else if (car.vehicle.status !== 0) {
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
      marker.bindPopup(`<div>车 架 号: ---</div><div>标 签 号: ${info.sn}</div><div>位 置 : ${info.address || '---'}</div>`)
      // marker.on('click', this.clickMarker)
      marker.locatorId = info.id
      marker.angle = info.angle
      this.unbindMarkerMap.set(info.id, marker)
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
      let icon = this.createPointMarker(iconType)
      const marker = L.Marker.movingMarker([carPos], [], {
        rotate: true,
        icon,
        initialRotationAngle: 0,
        // title: car.locator.sn + ' ' + car.locator.y + ' ' + car.locator.x
      })
      // 为marker绑上车和定位器的ID
      marker.carId = car.vehicle.id
      marker.locatorId = car.locator.id
      marker.bindPopup(`<div>车 架 号: ${car.vehicle.identification}</div><div>标 签 号: ${car.locator.sn}</div><div>位 置 : ${car.locator.address || '---'}</div>`)
      // 判断是否是特殊区域点
      // const inSpeacalArea = (existenceZone) => {}
      if (car.locator.existenceZone || car.locator.otherZone) { // 特殊区域点
        marker.inSpecialArea = true
        let zone = car.locator.existenceZone ? car.locator.existenceZone : car.locator.otherZone
        marker.zone = zone
        // console.log('do change')
        this.changeSpecialAreaNum(zone, true)
      } else {
        marker.inSpecialArea = false
        this.map && marker.addTo(this.map)
        marker.isAddedToMap = true
      }
      this.markers.push({
        marker,
        id: car.vehicle.id,
        locatorId: car.locator.id
      })
      this.carMarkerMap[car.locator.id] = index
      this.bindMarkerMap.set(car.locator.id, marker)
      // this.map && marker.addTo(this.map)
    },
    // moment,
    formatTimeOnly (s) {
      let repairTime = this.$moment().valueOf() - s
      return this.$moment.duration(repairTime / 1000, 's').asHours().toFixed(2)
    },
    formatTime (s) {
      return moment.duration(s, 's').asHours().toFixed(2)
    },
    timeToNow (timeStamp) {
      return moment(timeStamp).format('HH:mm')
    },
    intervalBroad () {
      this.broadTime = setInterval(() => {
        // this.getBoradData()
        // this.getStoreData()
        this.updatePage()
      }, 3000)
    },
    intervalSummary () {
      this.summaryTime = setInterval(() => {
        this.getImportantSummary()
      }, 30000)
    },
    // // 转变进度条的内容显示
    // format (percent) {
    //   return `正常车辆 ${percent}%`
    // },
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
      // console.log(area)
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
    // 当异步chart数据获取完成后
    // loadOk (newVal) {
    //   if (newVal) {
    //     this.renderCharts()
    //   }
    // },
    specalAreas: {
      handler: function (newVal) {
        // console.log('new areas')
        // console.log(newVal)
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
      const centerx = mapInfo.coordinateDown / this.pointScale + mapInfo.coordinateUpper / this.pointScale
      const centery = mapInfo.coordinateLeft / this.pointScale + mapInfo.coordinateRight / this.pointScale
      const center = [centerx / 2, centery / 2]
      // eslint-disable-next-line no-undef
      const map = L.map('map-small', {
        center,
        // zoom: this.initMapZoom - 0.5,
        // minZoom: this.initMapZoom - 0.5,
        // maxZoom: this.initMapZoom - 0.5,
        zoom: this.vqMapZoom,
        minZoom: this.vqMapZoom,
        maxZoom: this.vqMapZoom,
        zoomControl: false, // 默认不显示缩放按钮
        attributionControl: false // 不显示leaflet 图标logo

      })
      // console.log(mapInfo)
      const imgUrl = mapInfo.twoDFilePath
      const imgBounds = [[mapInfo.coordinateDown / this.pointScale, mapInfo.coordinateLeft / this.pointScale], [mapInfo.coordinateUpper / this.pointScale, mapInfo.coordinateRight / this.pointScale]]
      // const imgUrl = imgMap
      // const imgBounds = [[-0.8, -22.7], [8.0, 1.2]]
      // eslint-disable-next-line no-undef
      L.imageOverlay(imgUrl, imgBounds).addTo(map)
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
          // this.carListTime = setInterval(this.getBindCars, 1800000)
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
      // 渲染车位
      getParksByType({ id: mapInfo.id, type: 4 }).then((res) => {
        const { code, result } = res
        // console.log(result)
        if (code === 0) {
          result.forEach((item) => {
            renderPark(item).addTo(this.map)
          })
        }
      })
    }).catch((err) => {
      console.log(err)
      this.$notify.error({
        message: '获取地图数据失败[失望脸]'
      })
    })
    // 看板总体数据概览变换
    this.intervalBroad()
    // this.renderCharts()
  },
  beforeDestroy () {
    bus.$off('menuSizeChanged')
    this.broadTime && clearInterval(this.broadTime)
    this.summaryTime && clearInterval(this.summaryTime)
    this.carListTime && clearInterval(this.carListTime)
    this.dateTime && clearInterval(this.dateTime)
  }
}
</script>
<style lang="less" scoped>
@import '../assets/less/color.less';
.page {

  .layout {
    height: 95vh;
    margin-top: 5px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 25% 35% 40%;
    grid-template-rows: 70% 30%;
    grid-template-areas: "table table exception-"
                         "bar line exception-";
    grid-gap: 10px;
    // grid-auto-flow: column dense;
    .table {
      grid-area: table;
    }
    .exception {
      grid-area: exception-;
    }
    .bar {
      grid-area: bar;
    }
    .line {
      grid-area: line;
    }
    .car {
      grid-area: car;
    }
    .unique-item {
      background: #00000000 !important;
      box-shadow: none !important;
    }
    .item {
      background: @base-background;
      border-radius: 20px;
      box-shadow: @shadow-base;
      height: 100%;
      overflow-y: auto;
      box-sizing: border-box;
      // border: .5px solid #fff;
      .total-left {
        .head {
          height: 60px;
          padding: 0;
          border-bottom: 1px solid #666;
          display: grid;
          grid-template-rows: auto;
          grid-template-columns: 1fr 1fr 1fr;
          box-sizing: border-box;
          .child {
            align-self: center;
            justify-self: center;
            height: 60px;
            line-height: 60px;
          }
          .icon {
            font-size: 1.4rem;
          }
          .title {
            font-size: 1.3rem;
            font-weight: bold;
            color: @primary-color;
          }
          .left-content {
            font-size: 1.4rem;
            font-weight: bold;
            color: @primary-color;
          }
          .pointer {
            cursor: pointer;
          }
          .active {
            border-bottom: 2px solid @primary-color;
            // height: 60px;
            box-sizing: border-box;
          }
        }
        .item-content {
          padding: 12px 0;
          @media screen and (max-width: 1600px) {
            padding: 5px 0;
          }
          .tabs {
            display: flex;
            align-items: center;
            // justify-content: space-around;
            height: 45px;
            line-height: 45px;
            font-size: 1.05rem;
            font-weight: 400;
            // color: @primary-color;
            border-bottom: 1px solid #666;
            box-sizing: border-box;
            .tab {
              padding: 0 20px;
              cursor: pointer;
            }
            .tab-active {
              border-bottom: 2px solid @primary-color;
              box-sizing: border-box;
              color: @primary-color;
              font-weight: bold;
            }
          }
          .vq-table {
            padding: 15px;
            box-sizing: border-box;
            .outline-total {
              display: flex;
              align-items: center;
              padding-bottom: 15px;
              padding-left: 5px;
              .item {
                margin-right: 20px;
                span {
                  font-size: 1.2rem;
                  color: @warning;
                  font-weight: bold;
                }
              }
            }
            .el-table {
              border: 1px solid #fff;
              border-radius: 10px;
            }
            .cell {
              text-align: center;
              color: #eee;
            }
            .cell-click {
              cursor: pointer;
            }
            .cell-success {
              color: @primary-color;
            }
            .cell-warn {
              color: @warning;
            }
            .cell-error {
              color: @danger;
            }
          }
          .line-content {
            margin: 13px 0 0 0;
            border-bottom: 1px solid #666;
            border-top: 1px solid #666;
            padding: 10px 15px;
            box-sizing: border-box;
            text-align: left;
            // padding-bottom: 15px;
            @media screen and (max-width: 1600px) {
              margin: 6px 0 0 0;
              // padding-bottom: 8px;
            }
            .sub-title {
              font-size: 1.3rem;
              font-weight: 500;
              @media screen and (max-width: 1600px) {
                font-size: 1.1rem;
                font-weight: 400;
              }
            }
            .list {
              padding-top: 12px;
              display: grid;
              grid-template-rows: 1fr;
              grid-template-columns: 1fr 1fr;
              font-size: 1.1em;
              @media screen and (max-width: 1600px) {
                font-size: 1em;
                padding-top: 5px;
              }
            }
          }
          .title {
            font-size: 1.3rem;
            font-weight: 600;
            @media screen and (max-width: 1600px) {
              font-size: 1.1rem;
              // font-weight: 500;
            }
          }
          .title-sub {
            margin: 12px 0 0 0;
            font-size: 1.1rem;
            text-align: left;
            padding-left: 15px;
            // color: @primary-color;
            @media screen and (max-width: 1600px) {
              margin: 6px 0 0 0;
              font-size: 1rem;
            }
          }
          .box {
            min-height: 95px;
            max-height: 125px;
            border-radius: 8px;
            border: 1.5px solid #ccc;
            margin: 12px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr;
            @media screen and (max-width: 1600px) {
              margin: 7px;
            }
            .child {
              align-self: center;
              .attr {
                padding: 4px;
                color: #ddd;
                @media screen and (max-width: 1600px) {
                  padding: 2px;
                }
              }
            }
          }
          .out-line {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: auto;
            margin: 13px 0 13px 0;
            font-size: 1.1em;
            text-align: left;
            padding-left: 15px;
            // border-bottom: 1px solid #666;
            @media screen and (max-width: 1600px) {
              margin: 6px 0 6px 0;
              font-size: 1em;
            }
            .child {
              align-self: center;
              // justify-self: center;
            }
          }
        }
      }
      .head {
        height: 60px;
        padding: 10px;
        border-bottom: 1px solid #666;
        display: grid;
        grid-template-rows: auto;
        grid-template-columns: 1fr 1fr;
        box-sizing: border-box;
        .title {
          align-self: center;
          font-size: 1.4rem;
        }
        .search {
          align-self: center;
        }
      }
      .map {
        // height: calc(100% - 60px);
        height: 100%;
        display: grid;
        grid-template-columns: 95% 1%;
        grid-template-rows: 1fr;
        // grid-gap: 10;
        // align-items: center;
        .percent {
          align-self: center;
          justify-self: center;
          padding: 0 3px;
        }
        .page-map {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      }
      .total-right {
        position: relative;
        .date {
          height: 60px;
          // padding: 10px;
          border-bottom: 1px solid #666;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 3fr 1fr;
          grid-template-rows: 1fr;
          .time {
            font-size: 2.5rem;
            align-self: center;
            color: @primary-color;
            font-weight: 450;
          }
          .date-info {
            align-self: center;
            .child {
              padding: 5px 0;
            }
            // display: grid;
            // grid-template-columns: 1fr 1fr;
            // grid-template-rows: 1fr;
          }
        }
        .error-infos {
          box-sizing: border-box;
          height: calc(90vh - 120px);
          .sub-title {
            font-size: 1.3rem;
            // margin-top: 10px;
            padding-top: 10px;
            position: relative;
            @media screen and (max-width: 1600px) {
              font-size: 1rem;
            }
            .close-icon {
              position: absolute;
              cursor: pointer;
              top: 10px;
              right: 30px;
              font-size: 1rem;
            }
          }
          .list-content {
            // height: calc(58vh - 60px);
            overflow-y: auto;
            .list-item {
              // ..
              margin: 15px;
              .item-row {
                display: grid;
                grid-template-columns: 25% 75%;
                grid-template-rows: auto;
                color: #ddd;
                .name {
                  border: 1px solid #aaa;
                  padding: 10px 0;
                  // border-bottom: none;
                  &:nth-last-child(1) {
                    border-bottom: 1px solid #aaa;
                  }
                  @media screen and (max-width: 1600px) {
                    padding: 5px 0;
                  }
                }
                .val {
                  border: 1px solid #aaa;
                  padding: 10px 0;
                  @media screen and (max-width: 1600px) {
                    padding: 5px 0;
                  }
                }
              }
            }
          }
        }
        .car-list {
          position: absolute;
          right: 0;
          top: 60px;
          background: @base-background-opacity;
          z-index: 3000;
          width: 70%;
        }
      }
      .no-data {
        padding-top: 15px;
      }
      .total-layout {
        display: grid;
        grid-template-rows: 1fr 1fr 1fr;
        grid-template-columns: auto;
        row-gap: 13px;
        // row-gap: 8px;
        @media screen and (max-width: 1800px) {
          row-gap: 8px;
        }
      }
      .item-log {
        // font-size: .8rem;
        padding: 5px;
        .log {
          display: grid;
          grid-template-columns: 20% 60% 20%;
          grid-template-rows: auto;
          padding: 10px 5px;
          border-radius: 5px;
          box-sizing: border-box;
          // background: rgb(37, 39, 39);
          margin-top: 10px;
        }
      }
      .overview {
        height: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        .overview-item {
          background: rgba(53, 51, 51, 0.322);
          border-radius: 5px;
          box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
        }
      }
      .percent {
        // position: relative;
        // width: 100px;
        // height: 300px;
        // // background: red;
        // top: -500px;
        // left: 700px;
        z-index: 1500;
        .percent-item {
          margin: 15px auto;
          .text {
            margin-bottom: 5px;
          }
          .number {
            margin-top: 5px;
            font-size: .8rem;
          }
        }
      }
    }
    .chart {
      overflow: hidden;
    }
  }
  }
</style>
