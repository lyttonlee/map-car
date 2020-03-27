<template>
  <div class="page">
    <!-- <div v-if="true" class="page-title">
      {{$route.name}}
      <ShowTime />
    </div> -->
    <div class="layout">
      <div class="item">
        <div class="overview">
          <template v-for="(item, index) in broad">
            <div :key="index" class="overview-item">
              <h3>{{item.title}}</h3>
              <div :class="judgeTodayData(index, item.now, item.yesterday)">
                  <!-- <CountTo :key="index" :to="item.now"></CountTo> -->
                  <CountTo :key="index" :to="item.now" :uid="index + '0'" suffix="%" :decimalPlaces="2" />
                </div>
              <div>昨日: {{item.yesterday}}</div>
              <div>七日: {{item.averageOfWeek}}</div>
            </div>
          </template>
        </div>
      </div>
      <div class="item item-row-1-3 item-col-2-4 map">
        <div id="map-small" class="page"></div>
        <div class="percent">
          <template v-for="(item, index) in percentData">
            <div :key="index" class="percent-item">
              <div class="text">{{item.title}}</div>
              <el-progress :show-text="false" :stroke-width="8" :percentage="item.percent" :status="item.color"></el-progress>
              <div class="number">{{item.percent}}% ({{item.num}}辆)</div>
            </div>
          </template>
        </div>
      </div>
      <div class="item" id="out-put"></div>
      <div class="item">
        <!-- <h4>告警列表</h4> -->
        <!-- <CountTo :to="num" uid="test" suffix="%" /> -->
        <!--  -->
        <div class="total-layout">
          <TotalItem :info="{a: 2}" id="car-come" />
          <TotalItem :info="{a: 2}" id="car-out" />
          <TotalItem :info="{a: 2}" id="car-exist"/>
        </div>
      </div>
      <div class="item">
        <!-- <h4>超八小时未出荷车辆列表</h4> -->
        <el-carousel :autoplay="true" indicator-position="none" arrow="never">
          <el-carousel-item v-for="(item, index) in cars" :key="index">
            <div class="item-car">
              <div class="head">
                <div class="name">{{item.name}}</div>
                <div :class="formatTime(item.ducration) < 4 ? 'time success' : 'time warn'">{{formatTime(item.ducration)}}小时</div>
              </div>
              <div class="problem">{{item.problem}}</div>
              <div class="lines">
                <template v-for="(line, index) in item.timeLines">
                  <div class="line" :key="index">
                    <div class="text">{{line.text}}</div>
                    <div class="time">{{line.time}}</div>
                  </div>
                </template>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="item item-col-1-3" id="repaired-percent-chart">出荷率时间比例图</div>
      <div class="item item-col-3-5" id="repair-num-chart"></div>
    </div>
  </div>
</template>
<script>
// import ShowTime from '@/components/showTime'
import echart from 'echarts'
import bus from '@/bus/bus'
import { baseChartOption } from '../config/chartConfig'
import { broads } from '../mock/broad'
import getLastDays from '../mock/days'
import imgMap from '../assets/img/office-map.png'
import { cars } from '../mock/cars'
import moment from 'moment'
// import SeamLessScroll from 'vue-seamless-scroll'
import {
  getRealTimeData,
  getStatisticData,
  getBindList,
  getAlarmList,
} from '../api/vq'
import alarmCar from '../assets/img/car-red.png'
import overtimeCar from '../assets/img/car-yellow.png'
import normalCar from '../assets/img/car-blue.png'
export default {
  data () {
    return {
      broad: broads[0],
      cars,
      alarms: [],
      charts: [],
      loadOk: false,
      bindCars: [],
      // 地图上所有车的点数组
      markers: [],
      // percentData: ''
    }
  },
  components: {
    // ShowTime
    // SeamLessScroll
    CountTo: () => import('../components/CountTo'),
    TotalItem: () => import('../components/TotalItem'),
  },
  computed: {
    percentData () {
      // console.log(this.bindCars)
      const isDelay = (bindTime) => {
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
      }
      let allNum = this.bindCars.length
      let normalNum = this.bindCars.filter((car) => car.vehicle.status === 0).length
      let alarmNum = this.bindCars.filter((car) => car.vehicle.status === 1).length
      let overtimeNum = this.bindCars.filter((car) => isDelay(car.vehicleDeliverStatus.bindTime)).length
      let normal = {
        title: '正常车辆',
        num: normalNum,
        percent: Math.floor(normalNum / allNum * 100) || 0,
        color: 'success'
      }
      let alarm = {
        title: '告警车辆',
        num: alarmNum,
        percent: Math.floor(alarmNum / allNum * 100) || 0,
        color: 'exception',
      }
      let overtime = {
        title: '超时车辆',
        num: overtimeNum,
        percent: Math.floor(overtimeNum / allNum * 100) || 0,
        color: 'warning'
      }
      // console.log([normal, alarm, overtime])
      return [normal, alarm, overtime]
    },
  },
  created () {
    this.getBoradData()
    this.getChartData()
    this.getAlarmData()
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
          // message: newAlarm.vehicleId + '发生告警: ' + newAlarm.message + this.$moment(newAlarm.timestamp).format('YYYY-MM-DD HH:mm:ss') + '位置：' + newAlarm.address,
          message: `<div>${newAlarm.vehicleId}发生告警</div><div>内容: '${newAlarm.message}</div><div>时间: ${this.$moment(newAlarm.timestamp).format('YYYY-MM-DD HH:mm:ss')}</div><div>地点: ${newAlarm.address}</div>`,
          position: 'bottom-right',
          duration: 2500
        })
      }
    },
    position (data) {
      console.log('接收到position事件推送')
      console.log(data)
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
    // 获取动态数据
    getBoradData () {
      getRealTimeData().then((res) => {
        // console.log(res)
        if (res.code === 0) {
          this.broad = res.result
        }
      })
    },
    // 获取过往统计数据
    getChartData () {
      getStatisticData().then((res) => {
        console.log(res)
        if (res.code === 0) {
          this.charts = res.result
          this.loadOk = true
          // console.log(this.charts)
        }
      })
    },
    // 获取绑定的车辆信息
    getBindCars () {
      let params = {
        productLineId: 1
      }
      getBindList(params).then((res) => {
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
    // 获取当前所有告警信息
    getAlarmData () {
      getAlarmList().then((res) => {
        console.log(res)
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
        color: ['#91c7ae', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
        title: {
          text: this.charts[2].tableName,
          textStyle: {
            color: '#999'
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
          color: '#999'
        },
        legend: {
          // type: 'scroll',
          // orient: 'vertical',
          left: '20%',
          bottom: '5%',
          data: this.charts[2].itemNames,
          textStyle: {
            color: '#999'
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
            data: getLastDays(7)
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '数量'
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
            color: '#999'
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
        legend: {
          // type: 'scroll',
          // orient: 'vertical',
          left: '20%',
          bottom: '5%',
          data: this.charts[1].itemNames,
          textStyle: {
            color: '#999'
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
            data: getLastDays(7)
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '百分比'
          }
        ],
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
            color: '#999'
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
            data: getLastDays(7)
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '小时'
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
      const icon = L.icon({
        iconUrl: carImg
      })
      return icon
    },
    // 渲染车辆点到地图上
    renderMarker (car) {
      let bindTime = car.vehicleDeliverStatus.bindTime
      // console.log(bindTime)
      let iconType = this.formatTimeOnly(bindTime) > 8 ? 'overtime' : 'normal'
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
      this.markers.push({
        marker,
        id: car.vehicle.id,
        locatorId: car.locator.id
      })
      this.map && marker.addTo(this.map)
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
      }, 5000)
    },
    // // 转变进度条的内容显示
    // format (percent) {
    //   return `正常车辆 ${percent}%`
    // },
  },
  watch: {
    // 当异步chart数据获取完成后
    loadOk (newVal) {
      if (newVal) {
        this.renderCharts()
      }
    }
  },
  mounted () {
    console.log('mounted')
    this.getBindCars()
    // 地图加载
    // eslint-disable-next-line no-undef
    const map = L.map('map-small', {
      center: [4, -10],
      zoom: 6,
      minZoom: 6,
      maxZoom: 6,
      zoomControl: false, // 默认不显示缩放按钮
      attributionControl: false // 不显示leaflet 图标logo

    })
    // console.log(map)
    const imgUrl = imgMap
    // 相对应来说点位(左下 右上) [[y,x],[y,x]]
    const imgBounds = [[-0.8, -22.4], [8.0, 1.2]]
    // eslint-disable-next-line no-undef
    L.imageOverlay(imgUrl, imgBounds).addTo(map)
    this.map = map
    this.map.on('click', (ev) => {
      console.log(ev)
    })
    // 获取完数据后渲染marker
    // this.bindCars.forEach((car) => {
    //   this.renderMarker(car)
    // })
    // 看板总体数据概览变换
    this.intervalBroad()
  },
  beforeDestroy () {
    bus.$off('menuSizeChanged')
    this.broadTime && clearInterval(this.broadTime)
  }
}
</script>
<style lang="less" scoped>
.page {
    .page-title {
      margin: 20px 0;
      padding: 30px 0;
      background: rgba(53, 51, 51, 0.322);
      border-radius: 30px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    .layout {
      height: 90%;
      margin-top: 20px;
      box-sizing: border-box;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      grid-template-rows: 40% 30% 30%;
      grid-gap: 20px;
      grid-auto-flow: column dense;

      .item {
        background: rgba(53, 51, 51, 0.322);
        border-radius: 20px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        .total-layout {
          display: grid;
          grid-template-rows: 1fr 1fr 1fr;
          row-gap: 13px;
        }
        .item-car {
          // height: 100%;
          font-size: .8rem;
          padding: 5px;
          .head {
            display: grid;
            grid-template-columns: 70% 30%;
            margin-top: 5px;
            margin: 10px 0;
            .name {
              text-align: left;
              font-size: 1rem;
              color: aquamarine;
            }
            .time {
              text-align: right;
            }
          }
          .problem {
            text-align: left;
          }
          .line {
            display: grid;
            grid-template-columns: 60% 40%;
            margin-top: 5px;
            .text {
              text-align: left;
            }
            .time {
              text-align: right;
            }
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
        grid-template-columns: 88% 10%;
        grid-gap: 10;
        align-items: center;
      }
    }
  }
</style>
