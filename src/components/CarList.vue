<template>
  <div class="car-list">
    <el-input class="input" size="small" v-model="search" @blur="doSearch" placeholder="请输入要查询的车辆"></el-input>
    <div class="header">
      <template v-for="(menu, index) in menus">
        <div :class="activeIndex === index ? `menu active` : 'menu'" @click="changeMenu(index)" :key="index">{{menu}}</div>
      </template>
    </div>
    <div class="list">
      <div class="list-item">
        <div>
          车辆状态
        </div>
        <div class="car-oui">车架号</div>
        <div class="car-time">维修时长</div>
      </div>
      <template v-for="(car, index) in renderedCars">
        <div class="list-item" @click="showCarInfo(car)" :key="index">
          <div :class="computeCarClassColorByStatu(car.vehicle.status, car.vehicleDeliverStatus.bindTime)">
            <zx-icon type="zx-car2"></zx-icon>
          </div>
          <div class="car-oui">{{car.vehicle.identification}}</div>
          <div :class="formatTime(car.vehicleDeliverStatus.bindTime) > 8 ? 'warn' : 'success'">{{formatTime(car.vehicleDeliverStatus.bindTime)}}小时</div>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import moment from 'moment'
export default {
  props: {
    cars: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      menus: ['全部', '告警', '超时'],
      activeIndex: 0,
      renderedCars: [],
      search: '', // 要搜索的车架号 模糊匹配
    }
  },
  created () {
    this.initCars()
  },
  watch: {
    cars: {
      handler: function (newValue) {
        if (newValue) {
          this.initCars()
        }
      },
      deep: true
    }
  },
  methods: {
    // 搜索车架号查询
    doSearch () {
      if (this.search === '') {
        // ..
        // this.getBindCars()
        this.activeIndex = 0
        this.renderedCars = this.cars
      } else {
        this.activeIndex = 0
        this.renderedCars = this.cars.filter((car) => car.vehicle.identification.includes(this.search))
        // console.log(this.bindCars)
      }
    },
    initCars () {
      console.log(this.cars)
      this.renderedCars = this.cars
    },
    formatTime (s) {
      let repairTime = moment().valueOf() - s
      return moment.duration(repairTime / 1000, 's').asHours().toFixed(2)
    },
    changeMenu (index) {
      if (this.activeIndex !== index) {
        this.activeIndex = index
        switch (index) {
          case 0:
            this.renderedCars = this.cars
            break
          case 1:
            this.renderedCars = this.cars.filter((car) => car.vehicle.status !== 0)
            break
          case 2:
            this.renderedCars = this.cars.filter((car) => {
              // car.vehicleDeliverStatus.bindTime
              return this.formatTime(car.vehicleDeliverStatus.bindTime) >= 8
            })
            break
          default:
            this.renderedCars = this.cars
            break
        }
      }
    },
    // 计算车辆应该显示的颜色
    computeCarClassColorByStatu (code) {
      if (code !== 0) {
        return 'error'
      } else {
        return 'normal'
      }
    },
    // 点击车辆显示详情
    showCarInfo (car) {
      this.$emit('showCarInfo', car)
    }
  }
}
</script>
<style lang="less" scoped>
.car-list {
  .input {
    margin-bottom: 15px;
  }
  .header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-bottom: 1px solid #fff;
    .menu {
      cursor: pointer;
    }
    .active {
      border-bottom: 1px solid chartreuse;
      color: chartreuse;
    }
  }
  .list {
    margin-top: 15px;
    .list-item {
      cursor: pointer;
      // margin-top: 10px;
      padding-top: 10px;
      border-bottom: .5px solid rgba(251, 252, 250, 0.473);
      display: grid;
      grid-template-columns: 20% 50% 30%;
      &:hover {
        background: rgba(34, 34, 34, 0.603);
        border-bottom: .5px solid rgba(251, 252, 250, 0.699);
      }
    }
  }
}
</style>
