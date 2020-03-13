<template>
  <div class="car-list">
    <div class="header">
      <template v-for="(menu, index) in menus">
        <div :class="activeIndex === index ? `menu active` : 'menu'" @click="changeMenu(index)" :key="index">{{menu}}</div>
      </template>
    </div>
    <div class="list">
      <template v-for="(car, index) in renderedCars">
        <div class="list-item" :key="index">
          <div class="car-icon">
            <zx-icon type="zx-car2"></zx-icon>
          </div>
          <div class="car-oui">{{car.oui}}</div>
          <div class="car-time">{{formatTime(car.bindTime)}}</div>
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
      renderedCars: []
    }
  },
  created () {
    this.initCars()
  },
  methods: {
    initCars () {
      this.renderedCars = this.cars
    },
    formatTime (s) {
      return moment.duration(s, 's').asHours().toFixed(2)
    },
    changeMenu (index) {
      if (this.activeIndex !== index) {
        this.activeIndex = index
        switch (index) {
          case 0:
            this.renderedCars = this.cars
            break
          case 1:
            this.renderedCars = this.cars.filter((car) => car.isAlarm === true)
            break
          case 2:
            this.renderedCars = this.cars.filter((car) => car.isDelay === true)
            break
          default:
            this.renderedCars = this.cars
            break
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
.car-list {
  margin: 15px 0 0 0;
  .header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
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
      margin-top: 10px;
      border-bottom: .5px solid rgba(251, 252, 250, 0.473);
      display: grid;
      grid-template-columns: 20% 40% 20% 20%;
    }
  }
}
</style>
