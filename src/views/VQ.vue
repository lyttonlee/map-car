<template>
  <div class="page">
    <!-- <div v-if="true" class="page-title">
      {{$route.name}}
      <ShowTime />
    </div> -->
    <div class="layout">
      <div class="item">
        <div class="total-left">
          <div class="head">
            <div class="child icon">
              <zx-icon type="zx-kucun"></zx-icon>
            </div>
            <div class="child title">{{'在库'}}</div>
            <div class="child left-content">{{info.totalNum}}台</div>
          </div>
          <div class="item-content">
            <div class="title">VQ返修复检: {{info.vqCheckNum}}台</div>
            <div class="title-sub success">超1.5h(未达8h): {{info.timeout1}}台</div>
            <div class="box">
              <div class="child">
                <template v-for="(item, index) in officeMap">
                  <div class="attr" :key="index">{{item.name + ' : ' + info.timeoutDetail1[item.key] + '台'}}</div>
                </template>
              </div>
              <div class="child">
                <template v-for="(item, index) in nodeMap">
                  <div class="attr" :key="index">{{item.name + ' : ' + info.timeoutDetail1[item.key] + '台'}}</div>
                </template>
              </div>
            </div>
            <div class="title-sub warn">超8h: {{info.timeout2}}台</div>
            <div class="box">
              <div class="child">
                <template v-for="(item, index) in officeMap">
                  <div class="attr" :key="index">{{item.name + ' : ' + info.timeoutDetail2[item.key] + '台'}}</div>
                </template>
              </div>
              <div class="child">
                <template v-for="(item, index) in nodeMap">
                  <div class="attr" :key="index">{{item.name + ' : ' + info.timeoutDetail2[item.key] + '台'}}</div>
                </template>
              </div>
            </div>
            <div v-if="info.afOutLine" class="title">AF线外返修: {{info.afOutLine.threeHour + info.afOutLine.oneDay + info.afOutLine.threeDay}}台</div>
            <div v-if="info.afOutLine" class="out-line">
              <div class="child success">超3h: {{info.afOutLine.threeHour}}</div>
              <div class="child warn">超1天: {{info.afOutLine.oneDay}}</div>
              <div class="child error">超3天: {{info.afOutLine.threeDay}}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="item">
        <div class="head">
          <div class="title">实时地图</div>
          <div class="search">
            <el-input v-model="searchParam" @blur="onSearch" @keyup.native.enter="onSearch" size="small" placeholder="请输入车架号"></el-input>
          </div>
        </div>
        <div class="map">
          <div id="map-small" class="page-map"></div>
          <div class="percent">
            <template v-for="(item, index) in percentData">
              <div :key="index" class="percent-item">
                <div class="text">{{item.title}}</div>
                <el-progress :show-text="false" :stroke-width="8" :percentage="item.percent" :color="item.color"></el-progress>
                <div class="number">{{item.percent}}% ({{item.num}}辆)</div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div class="item">
        <div class="total-right">
          <div class="date">
            <div class="time">{{moment(date).format('HH:mm:ss')}}</div>
            <div class="date-info">
              <div class="day">{{moment(date).format('YYYY-MM-DD')}}</div>
              <div class="week">{{moment(date).format('dddd')}}</div>
            </div>
          </div>
          <div v-if="info.outOfBatch" class="line-content">
            <div class="sub-title">线内脱批: {{info.outOfBatch.oneDay + info.outOfBatch.threeDay}}台</div>
            <div class="list">
              <div class="warn">超一天(未达3天): {{info.outOfBatch.oneDay}}台</div>
              <div class="error">超三天: {{info.outOfBatch.threeDay}}台</div>
            </div>
          </div>
          <div class="error-infos">
            <div class="sub-title">在库异常信息</div>
            <div class="list-item">
              <div class="item-row">
                <div class="name">录入时间</div>
                <div class="val">xxxxxxxxxxxx</div>
              </div>
              <div class="item-row">
                <div class="name">设备ID</div>
                <div class="val">xxxxxxxxxxxx</div>
              </div>
              <div class="item-row">
                <div class="name">异常内容</div>
                <div class="val">xxxxxxxxxxxx</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="item chart" id="pie-total"></div>
      <div class="item chart" id="line-time"></div>
      <div class="item chart" id="line-node"></div>
    </div>
  </div>
</template>
<script>
// import ShowTime from '@/components/showTime'
import {
  initCarSize
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
  getStatisticData,
  getBindList,
  getAlarmList,
  queryStore,
  queryEfficiency,
  querySummary,
  getSpecicalFence,
  getStatistic,
} from '../api/vq'
import alarmCar from '../assets/img/car-red.png'
import overtimeCar from '../assets/img/car-yellow.png'
import normalCar from '../assets/img/car-blue.png'
import offlineCar from '../assets/img/car-offline.png'
import {
  mapState,
  mapActions,
  mapGetters,
} from 'vuex'
export default {
  data () {
    return {
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
      officeMap: [
        { key: 'we', name: 'WE' },
        { key: 'af', name: 'AF' },
        { key: 'pq', name: 'PQ' },
        { key: 'pa', name: 'PA' },
        { key: 'dhec', name: 'DHEC' }
      ],
      nodeMap: [
        { key: 'delivery', name: '待 出 荷' },
        { key: 'area1', name: '再检查1' },
        { key: 'area2', name: '再检查2' },
        { key: 'area3', name: '再检查3' },
        { key: 'vqCheck', name: 'VQ解析' }
      ],
      searchParam: '',
    }
  },
  components: {
    // ShowTime
    // SeamLessScroll
    // CountTo: () => import('../components/CountTo'),
    // TotalItem: () => import('../components/TotalItem'),
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
        if (this.isDelay(this.bindCars[currentCarIndex].vehicleDeliverStatus.bindTime)) {
          iconType = 'overtime'
        } else {
          iconType = 'alarm'
        }
        let Icon = this.createPointMarker(iconType)
        // console.log('改变了车的颜色状态')
        // console.log('改变了车的颜色状态')
        let m = currentMarker.setIcon(Icon)
        m.setRotation(currentMarker.angle)
        this.$notify.error({
          dangerouslyUseHTMLString: true,
          // message: newAlarm.vehicleId + '发生告警: ' + newAlarm.message + this.$moment(newAlarm.timestamp).format('YYYY-MM-DD HH:mm:ss') + '位置：' + newAlarm.address,
          message: `<div>${newAlarm.vehicleId}发生告警</div><div>内容: '${newAlarm.message}</div><div>时间: ${this.$moment(newAlarm.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div><div>地点: ${newAlarm.address}</div>`,
          position: 'bottom-right',
          duration: 2500
        })
      }
    },
    position (data) {
      // console.log('接收到position事件推送')
      // console.log(data)
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
          if (!newPos.existenceZone && currentMarker.isAddedToMap === true) {
            currentMarker.moveTo([newPos.y / this.pointScale, newPos.x / this.pointScale], 500, newPos.angle)
          }
          currentMarker.angle = newPos.angle
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
              }
            } else { // 不存在 添加这两车
              this.noUploadCars.push(newPos)
              let index = this.noUploadCars.length - 1
              this.renderNouploadMarker(newPos, index)
              this.noUploadMap.set(newPos.id, index)
            }
          }
        }
      })
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
        this.renderMarker(newCar, this.bindCars.length - 1)
      }
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
      }
    },
    unBind (data) {
      const removeCar = JSON.parse(data)
      console.log('删除了car')
      // console.log(removeCar)
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
        let curCar = this.noUploadCars.find((car) => car.sn === this.searchParam)
        if (curCar) {
          let marker = this.noUpLoadMarkers[this.noUploadMap[curCar.id]]
          let isOpenPopup = marker.isPopupOpen()
          if (!isOpenPopup) {
            marker.openPopup()
          }
        } else {
          this.$message.error('很抱歉没有找到相关车辆')
        }
      }
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
          // console.log(result)
          for (let index = 0; index < result.length; index += 5) {
            // console.log(index)
            // let item = result.slice(index, index + 5)
            let item = result.slice(index, index + 5)
            // console.log(item)
            this.importantLogs.push(item)
          }
          // console.log(this.importantLogs)
        }
      })
    },
    // 获取过往统计数据
    getChartData () {
      getStatisticData().then((res) => {
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
        console.log(res)
        if (res.code === 0) {
          this.info = res.result
          // this.pageLoading = false
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
      const pieTotal = echart.init(document.getElementById('pie-total'))
      // 线图 按小时的在库数量趋势
      const lineTime = echart.init(document.getElementById('line-time'))
      // 线图 各节点实时台数
      const lineNode = echart.init(document.getElementById('line-node'))
      // console.log('start')
      pieTotal.setOption({
        color: ['#00d2ff', '#fcff00', 'red', '#6e7074', '#546570', '#c4ccd3'],
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}台  ({d}%)',
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
          orient: 'vertical',
          right: '1%',
          bottom: 'center',
          data: ['超1.5h', '超8h', '超3天'],
          textStyle: {
            color: '#fefefe'
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '60%'],
            center: ['45%', '50%'],
            data: [
              { value: this.info.timeoutTable.timeout1, name: '超1.5h' },
              { value: this.info.timeoutTable.timeout2, name: '超8h' },
              { value: this.info.timeoutTable.timeout3, name: '超3天' },
            ],
          }
        ],
      })
      // console.log(pieTotal)
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
            }
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
          text: '个节点实时生产台数',
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
        pieTotal.resize()
        lineNode.resize()
        lineTime.resize()
      })
      bus.$on('menuSizeChanged', (statu) => {
        // console.log('resize')
        setTimeout(() => {
          pieTotal.resize()
          lineNode.resize()
          lineTime.resize()
        }, 500)
      })
      this.lineTime = lineTime
      this.pieTotal = pieTotal
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
      marker.bindPopup(`<div>车 架 号: ---</div><div>标 签 号: ${info.sn}</div><div>位 置 : ${info.address}</div>`)
      // marker.on('click', this.clickMarker)
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
      marker.bindPopup(`<div>车 架 号: ${car.vehicle.identification}</div><div>标 签 号: ${car.locator.sn}</div><div>位 置 : ${car.locator.address}</div>`)
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
      this.carMarkerMap[car.locator.id] = index
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
      }, 10000)
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
      console.log(area)
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
    height: 90vh;
    margin-top: 5px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 27% 45% 27%;
    grid-template-rows: 70% 30%;
    grid-gap: 10px;
    // grid-auto-flow: column dense;
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
          padding: 10px;
          border-bottom: 1px solid #666;
          display: grid;
          grid-template-rows: auto;
          grid-template-columns: 1fr 1fr 1fr;
          box-sizing: border-box;
          .child {
            align-self: center;
            justify-self: center;
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
        }
        .item-content {
          padding: 15px 0;
          @media screen and (max-width: 1600px) {
            padding: 8px 0;
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
            margin: 15px 0;
            font-size: 1.1rem;
            font-weight: 500;
            // color: @primary-color;
            @media screen and (max-width: 1600px) {
              margin: 8px 0;
              font-size: 1rem;
            }
          }
          .box {
            min-height: 100px;
            max-height: 130px;
            border-radius: 8px;
            border: 1.5px solid #fff;
            margin: 15px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr;
            @media screen and (max-width: 1600px) {
              margin: 8px;
            }
            .child {
              .attr {
                padding: 5px;
                color: #ddd;
                @media screen and (max-width: 1600px) {
                  padding: 3px;
                }
              }
            }
          }
          .out-line {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: auto;
            margin: 15px 0;
            @media screen and (max-width: 1600px) {
              margin: 8px 0;
            }
            .child {
              align-self: center;
              justify-self: center;
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
        height: calc(100% - 60px);
        display: grid;
        grid-template-columns: 80% 15%;
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
        .date {
          height: 60px;
          padding: 10px;
          border-bottom: 1px solid #666;
          box-sizing: border-box;
          .time {
            font-size: 1.5rem;
          }
          .date-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr;
          }
        }
        .line-content {
          margin: 15px 0;
          border-bottom: 1px solid #666;
          box-sizing: border-box;
          padding-bottom: 15px;
          @media screen and (max-width: 1600px) {
            margin: 8px 0;
            padding-bottom: 8px;
          }
          .sub-title {
            font-size: 1.3rem;
            @media screen and (max-width: 1600px) {
              font-size: 1rem;
            }
          }
          .list {
            padding-top: 15px;
            display: grid;
            grid-template-rows: 1fr;
            grid-template-columns: 1fr 1fr;
          }
        }
        .error-infos {
          .sub-title {
            font-size: 1.3rem;
            @media screen and (max-width: 1600px) {
              font-size: 1rem;
            }
          }
          .list-item {
            // ..
            margin: 10px;
            .item-row {
              display: grid;
              grid-template-columns: 25% 75%;
              grid-template-rows: auto;
              color: #ddd;
              .name {
                border: 1px solid #eee;
                padding: 5px 0;
              }
              .val {
                border: 1px solid #eee;
                padding: 5px 0;
              }
            }
          }
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
