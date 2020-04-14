<template>
  <div class="info">
    <div @click="closeInfo" class="close">
      <zx-icon type="zx-guanbi1" />
    </div>
    <div class="car-info">
      <div class="item-unique">维修时长: {{ car.bindTime ? $moment(car.bindTime).toNow(true) : '未知'}}</div>
      <div class="item">当前环节: {{computedCarNode(car.node)}}</div>
      <div class="item">车架号码: {{car.vehicleIdentification}}</div>
      <div class="item">车辆型号: {{car.vehicleType}}</div>
      <div class="item">车辆颜色: {{car.vehicleOutSideColor}}</div>
      <div class="item">发动机号: {{car.vehicleEngineType}}</div>
      <div class="item">变 速 箱: {{car.vehicleGearBox}}</div>
      <div class="item">车辆问题: {{car.flawDetail}}</div>
      <div class="item">入荷时间: {{car.bindTime ? $moment(car.bindTime).format('YYYY-MM-DD HH:mm:ss') : '未知'}}</div>
      <div class="item">当前状态: {{computedCarStatu(car.status, car.bindTime)}}</div>
      <div class="item">标签编号: {{car.locatorSn}}</div>
      <div class="item">标签电量: {{car.power + '%'}}</div>
      <div class="item">当前位置: {{address}}</div>
      <div class="item">当前时间: {{currentTime ? $moment(currentTime).format('YYYY-MM-DD HH:mm:ss') : ''}}</div>
    </div>
    <div class="process">
      <template v-for="(log, index) in car.logs">
        <Log :key="index" :isLast="index === car.logs.length - 1" :log="log" />
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
import {
  computedCarNode,
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
      activities: []
    }
  },
  computed: {
    ...mapGetters(['overtime'])
  },
  methods: {
    computedCarNode,
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
    // console.log(this.car)
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
  right: 400px;
  top: 30px;
  font-size: .9rem;
  .car-info {
    margin: 10px;
    text-align: left;
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
    width: 40px;
    text-align: left;
    cursor: pointer;
  }
  .process {
    height: 380px;
    overflow-y: auto;
  }
}
</style>
