<template>
  <div class="page">
    <!-- <h2>statistics</h2> -->
    <div class="action">
      <el-date-picker
        :picker-options="pickerOption"
        type="daterange"
        v-model="selectDates"
        @change="selectDateChange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期">
      </el-date-picker>
      <el-radio-group @change="changeDate" v-model="dates2" :max="1" :min="0">
        <template v-for="(item) in times">
          <el-radio-button :key="item.date" :label="item.date" >{{item.name}}</el-radio-button>
        </template>
      </el-radio-group>
      <el-button @click="downloadFile" class="btn" round type="primary" size="small">导出</el-button>
    </div>
    <div class="body">
      <div class="total-chart">
        <div id="statistic-pie-chart"></div>
      </div>
      <div class="list">
        <template v-for="(item, index) in totalInfos">
          <TotalItem :key="index" :id="`statistic-${index}`" :info="item" :showSub="false" :type="item.type" />
        </template>
      </div>
    </div>
    <div class="chart">
      <div id="line-broad"></div>
      <div id="line-store"></div>
    </div>
  </div>
</template>
<script>
import {
  getStatistic,
  getTimesDuration,
  downLoadReport
} from '../../../api/statistic'
import echarts from 'echarts'
export default {
  components: {
    TotalItem: () => import('../../../components/TotalItem'),
  },
  data () {
    return {
      dates: [],
      selectDates: [],
      start: '',
      end: '',
      dates2: 7,
      minTime: 0,
      maxTime: 0 || Date.now(),
      totalInfos: [
        {
          name: '平均出荷时间',
          icon: 'zx-pingjunchuhe-1',
          today: 0,
          yesterday: 0,
          type: 'broad',
          index: 3
        },
        {
          name: '入荷数',
          icon: 'zx-ruku',
          today: 0,
          yesterday: 0,
          type: 'store'
        },
        {
          name: '出荷数',
          icon: 'zx-chuku',
          today: 0,
          yesterday: 0,
          type: 'store'
        },
      ],
      pieLegend: ['4小时出荷率', '8小时出荷率', '大于8小时出荷率'],
      storeLegend: ['入荷数', '出荷数'],
      times: [
        {
          name: '七天',
          date: 7
        },
        {
          name: '半个月',
          date: 15
        },
        {
          name: '一个月',
          date: 30
        },
        {
          name: '三个月',
          date: 90
        },
        {
          name: '半年',
          date: 180
        }
      ]
    }
  },
  computed: {
    pickerOption () {
      return {
        disabledDate: (ev) => {
          // console.log(ev.getTime())
          // console.log(this.maxTime)
          return ev.getTime() > this.maxTime || ev.getTime() < this.minTime
        },
      }
    },
  },
  methods: {
    changeDate (ev) {
      // console.log(ev)
      this.end = this.$moment().subtract('days', 1).startOf('day').valueOf()
      this.start = this.$moment().subtract('days', ev).startOf('day').valueOf()
      // console.log(this.$moment(this.end).format('YYYY-MM-DD HH:mm:ss'))
      // console.log(this.$moment(this.start).format('YYYY-MM-DD HH:mm:ss'))
      // console.log(this.end > this.maxTime)
      this.selectDates = []
      this.queryPageData()
    },
    selectDateChange (ev) {
      // console.log(ev)
      this.dates2 = ''
      let [start, end] = ev
      this.start = start.valueOf()
      this.end = end.valueOf()
      this.queryPageData()
    },
    queryPageData () {
      let params = {
        start: this.start,
        end: this.end
      }
      getStatistic(params).then((res) => {
        // console.log(res)
        let { code, result, desc } = res
        if (code === 0) {
          let { average, outNum, inNum, four, eight, other, days } = result
          // console.log(inNum)
          // console.log(average)
          // console.log(outNum)
          this.totalInfos.forEach((item, index) => {
            if (index === 0) {
              item.today = average / 1000 / 60 / 60
            }
            if (index === 1) {
              item.today = inNum
              item.index = 1
            }
            if (index === 2) {
              item.today = outNum
              item.index = 1
            }
          })
          let pieSeries = this.pieLegend.map((item, index) => {
            if (index === 0) {
              return {
                name: item,
                value: four
              }
            }
            if (index === 1) {
              return {
                name: item,
                value: eight
              }
            }
            if (index === 2) {
              return {
                name: item,
                value: other
              }
            }
          })
          // console.log(pieSeries)
          this.pieChart.setOption({
            series: [
              {
                data: pieSeries
              }
            ]
          })
          // line-charts
          // console.log(days)
          this.dates = []
          let storeSeries = []
          let broadSeries = []
          days.forEach((day, index) => {
            this.dates.push(this.$moment(day.time).format('MM-DD'))
          })
          this.pieLegend.forEach((name, index) => {
            broadSeries.push({
              name,
              type: 'line',
              data: days.map((day) => {
                if (index === 0) {
                  return day.four.toFixed(2)
                }
                if (index === 1) {
                  return day.eight.toFixed(2)
                }
                if (index === 2) {
                  return day.other.toFixed(2)
                }
              })
            })
          })
          this.storeLegend.forEach((name, index) => {
            storeSeries.push({
              name,
              type: 'line',
              data: days.map((day) => {
                if (index === 0) {
                  return day.inNum
                }
                if (index === 1) {
                  return day.outNum
                }
              })
            })
          })
          this.storeChart.setOption({
            xAxis: [
              {
                type: 'category',
                boundaryGap: false,
                name: '日期',
                // data: legend,
                data: this.dates,
                axisLine: {
                  lineStyle: {
                    color: '#fefefe',
                    width: 1
                  }
                },
              }
            ],
            series: storeSeries
          })
          this.broadChart.setOption({
            xAxis: [
              {
                type: 'category',
                boundaryGap: false,
                name: '日期',
                // data: legend,
                data: this.dates,
                axisLine: {
                  lineStyle: {
                    color: '#fefefe',
                    width: 1
                  }
                },
              }
            ],
            series: broadSeries
          })
        } else {
          this.$notify.warning({
            message: desc
          })
        }
      })
    },
    createCharts () {
      this.pieChart = echarts.init(document.getElementById('statistic-pie-chart'))
      this.pieChart.setOption({
        color: ['#c4c5ff', '#ffef83', '#92d9e8', '#fcff00', '#6e7074', '#546570', '#c4ccd3'],
        textStyle: {
          color: '#fefefe'
        },
        legend: {
          // type: 'scroll',
          orient: 'vertical',
          right: '60',
          bottom: 'center',
          textStyle: {
            color: '#fefefe'
          },
          data: this.pieLegend,
        },
        grid: {
          left: '20%',
          right: '20',
          bottom: '50',
          containLabel: true
        },
        series: [
          {
            name: '出荷率',
            type: 'pie',
            radius: '40%',
            center: ['40%', '55%'],
            data: [{
              name: '4小时出荷率',
              value: 45
            },
            {
              name: '8小时出荷率',
              value: 45
            },
            {
              name: '大于8小时出荷率',
              value: 45
            }],
            label: {
              formatter: '{b} ({d}%)',
            }
          }
        ],
      })
      this.broadChart = echarts.init(document.getElementById('line-broad'))
      this.storeChart = echarts.init(document.getElementById('line-store'))
      this.storeChart.setOption({
        color: ['#00d2ff', '#fcff00', '#00ffde', '#6e7074', '#546570', '#c4ccd3'],
        title: {
          text: '车辆统计',
          textStyle: {
            color: '#fefefe'
          },
          // textAlign: 'center',
          left: '30%',
          top: 10,
        },
        legend: {
          data: this.storeLegend,
          top: '10',
          left: '60%',
          textStyle: {
            color: '#fefefe'
          },
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
          // height: '85%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            name: '日期',
            // data: legend,
            data: this.dates,
            axisLine: {
              lineStyle: {
                color: '#fefefe',
                width: 1
              }
            },
          }
        ],
        dataZoom: [
          {
            show: true,
            realtime: true,
          },
          {
            type: 'inside',
            realtime: true,
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '辆',
            splitLine: {
              show: false
            },
            // min: 180,
            axisLine: {
              lineStyle: {
                color: '#fefefe',
                width: 1
              }
            },
          }
        ],
        series: []
      })
      this.broadChart.setOption({
        color: ['#00d2ff', '#fcff00', '#00ffde', '#6e7074', '#546570', '#c4ccd3'],
        title: {
          text: '出荷率',
          textStyle: {
            color: '#fefefe'
          },
          // textAlign: 'center',
          left: '30%',
          top: 10,
        },
        legend: {
          data: this.pieLegend,
          top: '10',
          left: '60%',
          textStyle: {
            color: '#fefefe'
          },
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
          // height: '85%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            name: '日期',
            // data: legend,
            data: this.dates,
            axisLine: {
              lineStyle: {
                color: '#fefefe',
                width: 1
              }
            },
          }
        ],
        dataZoom: [
          {
            show: true,
            realtime: true,
          },
          {
            type: 'inside',
            realtime: true,
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '%',
            splitLine: {
              show: false
            },
            // min: 180,
            axisLine: {
              lineStyle: {
                color: '#fefefe',
                width: 1
              }
            },
          }
        ],
        series: []
      })
      window.addEventListener('resize', () => {
        this.pieChart.resize()
        this.broadChart.resize()
        this.storeChart.resize()
      })
    },
    // 下载报表
    downloadFile () {
      let params = {
        start: this.start,
        end: this.end
      }
      downLoadReport(params).then((res) => {
        console.log(res)
        // let blob = new Blob([res], {
        //   type: 'application/vnd.ms-excel'
        // })
        let reader = new FileReader()
        reader.readAsDataURL(res)
        // reader.readAsArrayBuffer(blob)
        reader.onloadend = (ev) => {
          console.log(ev)
          let a = document.createElement('a')
          a.href = ev.target.result
          a.download = `${this.$moment(this.start).format('YYYY-MM-DD')} -- ${this.$moment(this.end).format('YYYY-MM-DD')}.xls`
          a.click()
          a.remove()
          a = null
        }
      })
    },
  },
  created () {
    getTimesDuration().then((res) => {
      let { code, result } = res
      if (code === 0) {
        console.log(result)
        let { min, max } = result
        this.minTime = min
        this.maxTime = max
        // todo
        this.end = this.$moment().subtract('days', 1).startOf('day').valueOf()
        this.start = this.$moment().subtract('days', 7).startOf('day').valueOf()
        this.queryPageData()
      }
    })
  },
  mounted () {
    this.createCharts()
  }
}
</script>
<style lang="less" scoped>
.page {
  .action {
    height: 10vh;
    display: grid;
    grid-template-columns: 35% 35% 20%;
    column-gap: 15px;
    justify-content: center;
    align-items: center;
    .btn {
      width: 100px;
    }
  }
  .body {
    height: 40vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: center;
    align-items: center;
    .list {
      display: grid;
      grid-template-rows: 1fr 1fr 1fr;
      // justify-content: stretch;
      align-items: center;
      row-gap: 15px;
      width: 100%;
      max-width: 400px;
    }
    .total-chart {
      width: 100%;
      height: 100%;
      #statistic-pie-chart {
        // width: 400px;
        width: 100%;
        height: 100%;
        // background: rgba(128, 255, 0, 0.096);
      }
    }
  }
  .chart {
    height: 30vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: center;
    align-items: center;
    // background: cornflowerblue;
    #line-store {
      height: 30vh;
    }
    #line-broad {
      height: 30vh;
    }
  }
}
</style>
