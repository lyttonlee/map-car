<template>
  <div class="info">
    <div @click="closeInfo" class="close">
      <zx-icon type="zx-guanbi1" />
    </div>
    <div class="car-info">
      <div class="item">车辆型号: {{car.vehicleName}}</div>
      <div class="item">车架号码: {{car.vehicleIdentification}}</div>
      <div class="item">车辆问题: {{car.flawDetail}}</div>
      <div class="item">入荷时间: {{$moment(car.bindTime).format('YYYY-MM-DD HH:mm:ss')}}</div>
      <div class="item">维修时长: {{$moment(car.bindTime).toNow(true)}}</div>
      <div class="item">当前状态: {{computedCarStatu(car.statu, car.bindTime)}}</div>
      <!-- <div class="item">标签电量: {{computedCarStatu(car.statu, car.bindTime)}}</div> -->
      <div class="item">当前位置: {{address}}</div>
      <div class="item">当前时间: {{currentTime ? $moment(currentTime).format('YYYY-MM-DD HH:mm:ss') : ''}}</div>
    </div>
    <div class="process">
      <template v-for="(log, index) in car.logs">
        <Log :key="index" :log="log" />
      </template>
      <!-- <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in car.logs"
          :key="index"
          :timestamp="$moment(activity.time).format('YYYY-MM-DD HH:mm')">
          <div>{{activity.detail}}</div>
          <div>操作员: {{activity.nickName ? activity.nickName : '系统自动生成'}}</div>
        </el-timeline-item>
      </el-timeline> -->
    </div>
    <!-- <div>{{car}}</div> -->
  </div>
</template>
<script>
import moment from 'moment'
import {
  queryLocatorAddress
} from '../api/common'
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
      activities: []
    }
  },
  methods: {
    closeInfo () {
      this.$emit('close')
    },
    computedCarStatu (code, bindTime) {
      console.log(code)
      const isDelay = (bindTime) => {
        // console.log(bindTime)
        let duration = moment().valueOf() - bindTime
        // console.log(duration)
        let hours = moment.duration(duration / 1000, 's').hours()
        // console.log(hours)
        if (hours >= 8) {
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
      console.log(this.car)
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
    }
  },
  created () {
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
  width: 300px;
  height: 70vh;
  border-radius: 10px;
  background: @base-background-opacity;
  // box-shadow: @shadow-base;
  padding: 10px 5px;
  z-index: 1001;
  position: fixed;
  right: 400px;
  top: 80px;
  font-size: .9rem;
  .car-info {
    margin: 10px;
    text-align: left;
    .item {
      margin: 12px 0 6px 0;
    }
  }
  .close {
    font-size: .8rem;
    width: 40px;
    text-align: left;
    cursor: pointer;
  }
  .process {
    height: 370px;
    overflow-y: auto;
  }
}
</style>
