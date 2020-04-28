<template>
  <div class="page">
    <!-- <div v-if="true" class="page-title">
      {{$route.name}}
      <ShowTime />
    </div> -->
    <div class="layout">
      <div class="item unique-item">
        <div class="total-layout">
          <template v-for="(item, index) in broad">
            <TotalItem :key="index" :id="'car-broad-' + index" :info="item" type="broad" />
          </template>
        </div>
      </div>
      <div class="item item-row-1-3 item-col-2-4 map">
        <div id="map-small" class="page"></div>
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
      <div class="item" id="out-put"></div>
      <div class="item unique-item">
        <div class="total-layout">
          <template v-for="(item, index) in storeData">
            <TotalItem :key="index" :id="'car-store-' + index" :info="item" />
          </template>
        </div>
      </div>
      <div class="item">
        <!-- <h4>超八小时未出荷车辆列表</h4> -->
        <el-carousel :autoplay="true" indicator-position="none" arrow="never" :interval="5000" >
          <el-carousel-item  v-for="(item, index) in importantLogs" :key="index">
            <div class="item-log">
              <template v-for="(log, index) in item">
                <div class="log" :key="index">
                  <div>{{log.name}}</div>
                  <div>{{log.content}}</div>
                  <div>{{$moment(log.time).toNow()}}</div>
                </div>
              </template>
            </div>
          </el-carousel-item>
          <div class="no-data" v-if="importantLogs.length === 0">没有数据</div>
        </el-carousel>
      </div>
      <div class="item item-col-1-3" id="repaired-percent-chart"></div>
      <div class="item item-col-3-5" id="repair-num-chart"></div>
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
import getLastDays from '../mock/days'
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
} from '../api/vq'
import alarmCar from '../assets/img/car-red.png'
import overtimeCar from '../assets/img/car-yellow.png'
import normalCar from '../assets/img/car-blue.png'
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
    }
  },
  components: {
    // ShowTime
    // SeamLessScroll
    // CountTo: () => import('../components/CountTo'),
    TotalItem: () => import('../components/TotalItem'),
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
      const newPos = JSON.parse(data)
      // console.log(newPos)
      // 找到对应的marker
      let markerIndex = this.markers.findIndex((item) => item.locatorId === newPos.content.id)
      // 移动位置
      if (markerIndex !== -1) {
        let currentMarker = this.markers[markerIndex].marker
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
          currentMarker.moveTo([newPos.content.y / this.pointScale, newPos.content.x / this.pointScale], 500, newPos.content.angle)
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
          this.loadOk = true
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
            this.bindCars.forEach((car) => {
              this.renderMarker(car)
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
    // 渲染图标数据
    renderCharts () {
      const repairNum = echart.init(document.getElementById('repair-num-chart'))
      const repairedPercentChart = echart.init(document.getElementById('repaired-percent-chart'))
      repairNum.setOption({
        color: ['#00ffde', '#00d2ff', '#fcff00', '#6e7074', '#546570', '#c4ccd3'],
        title: {
          text: this.charts[2].tableName,
          textStyle: {
            color: '#fff'
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
        textStyle: {
          color: '#fefefe'
        },
        legend: {
          // type: 'scroll',
          // orient: 'vertical',
          left: '20%',
          bottom: '5%',
          data: this.charts[2].itemNames,
          textStyle: {
            color: '#fefefe'
          }
        },
        grid: {
          left: '5%',
          right: '6%',
          bottom: '20%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            name: '日期',
            // data: legend,
            data: getLastDays(7),
            axisLine: {
              lineStyle: {
                color: '#fefefe',
                width: 1
              }
            },
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
        series: Object.keys(this.charts[2].datas).map((item) => {
          return {
            name: item,
            type: 'line',
            data: this.charts[2].datas[item],
            // label: {
            //   normal: {
            //     show: true,
            //     position: 'top'
            //   }
            // },
          }
        }),
      })
      // console.log(repairNum)
      const customRepairedOption = {
        title: {
          text: this.charts[1].tableName,
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
          },
          // formatter: '{a} {c}%'
        },
        legend: {
          // type: 'scroll',
          // orient: 'vertical',
          left: '20%',
          bottom: '5%',
          data: this.charts[1].itemNames,
          textStyle: {
            color: '#fefefe'
          }
        },
        grid: {
          left: '5%',
          right: '6%',
          bottom: '20%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            name: '日期',
            // data: legend,
            data: getLastDays(7),
            axisLine: {
              lineStyle: {
                color: '#fefefe',
                width: 1
              }
            },
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '百分比',
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
        series: Object.keys(this.charts[1].datas).map((item) => {
          return {
            name: item,
            type: 'line',
            data: this.charts[1].datas[item],
            // label: {
            //   normal: {
            //     show: true,
            //     position: 'top'
            //   }
            // },
          }
        }),
      }
      const outputOption = {
        title: {
          text: this.charts[0].tableName,
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
          right: '12%',
          bottom: '20%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            name: '日期',
            // data: legend,
            data: getLastDays(7),
            axisLine: {
              lineStyle: {
                color: '#fefefe',
                width: 1
              }
            },
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '小时',
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
        series: Object.keys(this.charts[0].datas).map((item) => {
          return {
            type: 'line',
            data: this.charts[0].datas[item],
            label: {
              normal: {
                show: true,
                position: 'top'
              }
            },
            areaStyle: {}
          }
        })
      }
      const outNum = echart.init(document.getElementById('out-put'))
      outNum.setOption(Object.assign(baseChartOption, outputOption))
      const repairedOption = Object.assign(baseChartOption, customRepairedOption)
      repairedPercentChart.setOption(repairedOption)
      window.addEventListener('resize', () => {
        repairNum.resize()
        outNum.resize()
        repairedPercentChart.resize()
      })
      bus.$on('menuSizeChanged', (statu) => {
        console.log('resize')
        setTimeout(() => {
          repairNum.resize()
          outNum.resize()
          repairedPercentChart.resize()
        }, 500)
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
    // 渲染车辆点到地图上
    renderMarker (car) {
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
      marker.bindPopup(`<div>车 架 号: ${car.vehicle.identification}</div><div>标 签 号: ${car.locator.sn}</div>`)
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
        this.getBoradData()
        this.getStoreData()
      }, 5000)
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
      let center = [specalArea.center.y, specalArea.center.x]
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
    loadOk (newVal) {
      if (newVal) {
        this.renderCharts()
      }
    },
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
    // 看板总体数据概览变换
    this.intervalBroad()
  },
  beforeDestroy () {
    bus.$off('menuSizeChanged')
    this.broadTime && clearInterval(this.broadTime)
    this.summaryTime && clearInterval(this.summaryTime)
    this.carListTime && clearInterval(this.carListTime)
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
    grid-template-columns: 30% 19% 19% 30%;
    grid-template-rows: 40% 30% 30%;
    grid-gap: 10px;
    grid-auto-flow: column dense;
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
      .no-data {
        padding-top: 15px;
      }
      .total-layout {
        display: grid;
        grid-template-rows: 1fr 1fr 1fr;
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
    .map {
      display: grid;
      grid-template-columns: auto 70px;
      grid-gap: 10;
      align-items: center;
    }
  }
  }
</style>
