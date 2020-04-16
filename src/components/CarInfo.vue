<template>
  <div class="info">
    <div @click="closeInfo" class="close">
      <zx-icon type="zx-guanbi" />
    </div>
    <div class="car-info">
      <div class="section">
        <div class="item">车架号码: {{car.vehicleIdentification}}</div>
        <div class="item">定 位 器: {{car.locatorSn}}<span><zx-icon customClass="icon-power" :type="computePowerIcon(car.power)"></zx-icon>{{car.power + '%'}}</span></div>
        <div class="item">当前状态: {{computedCarStatu(car.status, car.bindTime)}}<span><zx-icon customClass="icon-power error" v-if="computedCarStatu(car.status, car.bindTime).includes('超时')" type="zx-chaoshigaojing1"></zx-icon><zx-icon customClass="icon-power error" v-if="computedCarStatu(car.status, car.bindTime).includes('告警')" type="zx-alarm"></zx-icon></span></div>
        <div class="item">指派: <template v-for="(icon, index) in icons">
          <span class="icon" :key="index">
            <zx-icon :class="car.dispatchZones.toLowerCase().includes(icon.name) ? 'success' : ''" :type="icon.icon"></zx-icon>
          </span>
          </template></div>
        <div class="item">当前环节: {{computedCarNode(car.node) + ' -- ' + $moment(car.startTime).toNow(true)}}</div>
        <div class="item">当前位置: {{address}}</div>
        <div class="item">入荷时间: {{car.bindTime ? $moment(car.bindTime).format('YYYY-MM-DD HH:mm:ss') : '未知'}}</div>
      </div>
      <div class="section">
        <div class="item">车辆型号: {{car.vehicleType}}</div>
        <div class="item">车辆颜色: {{car.vehicleOutSideColor}}</div>
        <div class="item">发动机号: {{car.vehicleEngineType}}</div>
        <div class="item">变 速 箱: {{car.vehicleGearBox}}</div>
      </div>
      <div class="section">
        <div class="item">车辆问题: {{car.flawDetail}}</div>
        <div class="action" @click="showDetail">返修详情</div>
      </div>
    </div>
    <div v-if="showProcess" class="process">
      <div @click="closeProcess" class="close">
        <zx-icon type="zx-guanbi" />
      </div>
      <div class="all-time">
        总时长: {{ car.bindTime ? $moment(car.bindTime).toNow(true) : '未知'}}
      </div>
      <template v-for="(log, index) in car.filterLog">
        <Log :key="index" :isLast="index === car.filterLog.length - 1" :log="log" />
      </template>
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import {
  queryLocatorAddress
} from '../api/common'
import {
  computedCarNode,
  computePowerIcon
} from '../utils/utils'
import {
  mapGetters,
} from 'vuex'
export default {
  components: {
    Log: () => import('./Log')
  },
  props: {
    car: {
      required: true,
      type: Object
    }
  },
  data () {
    return {
      address: '',
      currentTime: '',
      activities: [],
      showProcess: true,
      icons: [{ name: 'pa', icon: 'zx-PA' }, { name: 'we', icon: 'zx-WE' }, { name: 'af', icon: 'zx-AF' }, { name: 'pq', icon: 'zx-PQ' }]
    }
  },
  computed: {
    ...mapGetters(['overtime'])
  },
  methods: {
    computedCarNode,
    computePowerIcon,
    showDetail () {
      this.showProcess = !this.showProcess
    },
    closeProcess () {
      this.showProcess = false
    },
    closeInfo () {
      this.$emit('close')
    },
    computedCarStatu (code, bindTime) {
      // console.log(code)
      const isDelay = (bindTime) => {
        // console.log(bindTime)
        let duration = moment().valueOf() - bindTime
        // console.log(duration)
        let hours = moment.duration(duration / 1000, 's').asHours()
        // console.log(hours)
        if (hours >= this.overtime * 1) {
          return true
        } else {
          return false
        }
      }
      let statu
      if (code !== 0) { // 告警状态，判断是否超时
        if (isDelay(bindTime)) { // 已超时
          statu = '告警 超时'
        } else {
          statu = '告警'
        }
      } else { // 非告警状态，说明正常
        statu = '正常'
      }
      return statu
    },
    // 查询定位器的实时位置
    getCurrentAddressByLocatorId () {
      // console.log(this.car)
      let params = {
        locatorId: this.car.locatorId
      }
      queryLocatorAddress(params).then((res) => {
        // console.log(res)
        let { code, result, timestamp } = res
        if (code === 0) {
          this.address = result
          this.currentTime = timestamp
          // console.log(this.car)
        }
      })
    },
    clearAddress () {
      this.address = ''
    }
  },
  watch: {
    car: {
      handler: function (newValue) {
        if (newValue) {
          this.clearAddress()
        }
      },
      deep: true
    },
  },
  created () {
    console.log(this.car)
    this.activities = this.car.logs.sort((a, b) => a.time - b.time)
    this.getCurrentAddressByLocatorId()
    this.time = setInterval(this.getCurrentAddressByLocatorId, 5000)
  },
  beforeDestroy () {
    this.time && clearInterval(this.time)
  }
}
</script>
<style lang="less" scoped>
@import '../assets/less/color.less';
.info {
  width: 350px;
  height: 85vh;
  border-radius: 10px;
  background: @base-background-opacity;
  // box-shadow: @shadow-base;
  padding: 10px 5px;
  z-index: 1001;
  position: fixed;
  right: 370px;
  top: 20px;
  font-size: .9rem;
  .car-info {
    margin: 10px;
    text-align: left;
    .section:not(:last-child) {
      padding-bottom: 10px;
      border-bottom: 2px solid #fff;
      .item {
        // margin: 12px 0 6px 0;
        padding: 5px 0 0 0;
        .icon {
          font-size: 1.2rem;
          padding: 0 5px;
        }
        .icon-power {
          padding-left: 15px;
          font-size: .9rem;
          vertical-align: middle;
        }
      }
    }
    .section:last-child {
      .action {
        color: @primary-color;
        font-size: 1rem;
        text-align: center;
        margin-top: 20px;
        cursor: pointer;
      }
    }
    .item {
      margin: 12px 0 6px 0;
    }
    .item-unique {
      font-size: 1.3rem;
      font-weight: bold;
      color: @primary-color;
    }
  }
  .close {
    font-size: .8rem;
    width: 100%;
    text-align: right;
    cursor: pointer;
    // float: right;
  }
  .process {
    width: 300px;
    position: fixed;
    border-radius: 10px;
    background: @base-background-opacity;
    padding: 10px 5px;
    top: 20px;
    right: 740px;
    min-height: 300px;
    max-height: 85vh;
    overflow-y: auto;
    .all-time {
      padding-left: 20px;
      text-align: left;
      font-size: 1.3rem;
      font-weight: bold;
      color: @primary-color;
    }
  }
}
</style>
