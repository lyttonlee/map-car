<template>
  <div class="car-list">
    <!-- {{repair}} -->
    <div class="title">在修 ({{repair.length}})</div>
    <div class="list">
      <div class="list-item">
        <div class="car-oui">车架号</div>
        <!-- <div class="car-oui">位置</div> -->
        <div class="car-oui">位置</div>
        <div class="car-time">维修时长</div>
        <div class="car-oui">SN</div>
      </div>
      <template v-for="(car, index) in repair">
        <div :class="listActiveIndex === index ? 'list-item active' : 'list-item'" @click="showCarInfo(car, index, 'repair')" :key="index">
          <div class="car-oui">{{car.vehicle ? car.vehicle.identification : '---'}}</div>
          <div>{{car.locator.address}}</div>
          <!-- <div>{{computedCarNode(car.vehicleDeliverStatus.node)}}</div> -->
          <div :class="car.vehicleDeliverStatus && formatTime(car.vehicleDeliverStatus.startTime) * 1 >= overtime * 1 ? 'warn' : 'success'">{{car.vehicleDeliverStatus ? formatTime(car.vehicleDeliverStatus.startTime) + '小时' : '---'}}</div>
          <div class="action">{{car.locator.sn}}</div>
        </div>
      </template>
    </div>
    <div class="title">其它 ({{pending.length}})</div>
    <div class="list-pending">
      <div class="list-item">
        <div class="car-oui">车架号</div>
        <!-- <div class="car-oui">位置</div> -->
        <div class="car-oui">位置</div>
        <div class="car-time">维修时长</div>
        <div class="car-oui">SN</div>
      </div>
      <template v-for="(car, index) in pending">
        <div :class="pendingActiveIndex === index ? 'list-item active' : 'list-item'" @click="showCarInfo(car, index, 'pending')" :key="index">
          <div class="car-oui">{{car.vehicle ? car.vehicle.identification : '---'}}</div>
          <div>{{car.locator.address}}</div>
          <!-- <div>{{computedCarNode(car.vehicleDeliverStatus.node)}}</div> -->
          <div>{{'---'}}</div>
          <div class="action">{{car.locator.sn}}</div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import {
  mapGetters,
} from 'vuex'
import {
  computedCarNode,
} from '../utils/utils'
import {
  queryLocatorAddress
} from '../api/common'
export default {
  props: {
    repair: {
      type: Array,
      required: true
    },
    pending: {
      type: Array,
      required: true
    },
  },
  data () {
    return {
      listActiveIndex: '',
      pendingActiveIndex: ''
    }
  },
  computed: {
    ...mapGetters(['overtime']),
  },
  created () {
    // this.initCars()
    // console.log(this.repair)
    // console.log(this.getCurrentAddressByLocatorId(526))
  },
  methods: {
    computedCarNode,
    formatTime (s) {
      let repairTime = moment().valueOf() - s
      return moment.duration(repairTime / 1000, 's').asHours().toFixed(2)
    },
    // 计算车辆应该显示的颜色
    computeCarClassColorByStatu (code) {
      let iconClass
      // console.log(code)
      switch (code) {
        case 0:
          iconClass = 'normal'
          break
        case 1:
          iconClass = 'error'
          break
        case 2:
          iconClass = 'error'
          break
        default:
          iconClass = 'normal'
          break
      }
      // if (code !== 0) {
      //   return 'error'
      // } else {
      //   return 'normal'
      // }
      return iconClass
    },
    // 点击车辆显示详情
    showCarInfo (car, index, type) {
      let info = {
        car,
        type
      }
      this.$emit('showCarInfo', info)
      if (type === 'repair') {
        this.listActiveIndex = index
        this.pendingActiveIndex = ''
      } else {
        this.pendingActiveIndex = index
        this.listActiveIndex = ''
      }
    },
    // 查询定位器的实时位置
    getCurrentAddressByLocatorId (locatorId) {
      console.log(this.car)
      let params = {
        locatorId
      }
      let address
      queryLocatorAddress(params).then((res) => {
        console.log(res)
        let { code, result } = res
        if (code === 0) {
          address = result || '未知地区'
          // this.currentTime = timestamp
          // console.log(this.car)
        } else {
          address = '未获取到'
        }
        this.repair.forEach((car) => {
          if (car.locator.id === locatorId) {
            car.locator.address = address
          }
        })
        this.pending.forEach((car) => {
          if (car.locator.id === locatorId) {
            car.locator.address = address
          }
        })
        console.log(this.repair)
      })
    },
    clearListActive () {
      // console.log('clear')
      this.listActiveIndex = ''
    },
    setListActive (locatorId) {
      // console.log(this.renderedCars)
      let index = this.repair.findIndex((car) => car.locator.id === locatorId)
      let pendingIndex = this.pending.findIndex((car) => car.locator.id === locatorId)
      // console.log(index)
      if (index !== -1) {
        this.listActiveIndex = index
      }
      if (pendingIndex !== -1) {
        this.pendingActiveIndex = pendingIndex
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import '../assets/less/color.less';
.car-list {
  .title {
    font-size: 1.5rem;
    font-weight: bold;
  }
  .list {
    margin-top: 15px;
    height: 65vh;
    overflow-y: auto;
    .list-item {
      cursor: pointer;
      // margin-top: 10px;
      padding-top: 10px;
      border-bottom: .5px solid rgba(251, 252, 250, 0.473);
      display: grid;
      grid-template-columns: 40% 20% 25% 10%;
      grid-template-rows: auto;
      &:hover {
        background: @page-background;
        border-bottom: .5px solid rgba(251, 252, 250, 0.699);
      }
      .action {
        color: @primary-color;
      }
    }
    .active {
      background: @page-background;
      border-bottom: .5px solid rgba(251, 252, 250, 0.699);
    }
  }
  .list-pending {
    margin-top: 15px;
    height: 20vh;
    overflow-y: auto;
    .list-item {
      cursor: pointer;
      // margin-top: 10px;
      padding-top: 10px;
      border-bottom: .5px solid rgba(251, 252, 250, 0.473);
      display: grid;
      grid-template-columns:  40% 20% 25% 10%;
      grid-template-rows: auto;
      &:hover {
        background: @page-background;
        border-bottom: .5px solid rgba(251, 252, 250, 0.699);
      }
      .action {
        color: @primary-color;
      }
    }
    .active {
      background: @page-background;
      border-bottom: .5px solid rgba(251, 252, 250, 0.699);
    }
  }
}
</style>
