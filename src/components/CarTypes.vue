<template>
  <div class="tags">
    <template v-for="(value, key, index) in carTypes">
      <div class="item" :key="index + key">
        <span>{{value.name + ' : '}}</span>
        <!-- <span class="bolck" :style="{ background: value }"></span> -->
        <img class="img" :src="value.img" alt="">
      </div>
    </template>
  </div>
</template>
<script>
import alarmCar from '../assets/img/car-red.png'
import overtimeCar from '../assets/img/car-yellow.png'
import normalCar from '../assets/img/car-blue.png'
import offlineCar from '../assets/img/car-offline.png'
export default {
  data () {
    return {
      carTypes: {
        noraml: {
          name: '正常',
          img: normalCar
        },
        alarm: {
          name: '告警',
          img: alarmCar
        },
        overtime: {
          name: '超时',
          img: overtimeCar
        },
        offline: {
          name: '未绑定',
          img: offlineCar
        },
      }
    }
  }
}
</script>
<style lang="less" scoped>
.tags {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 10px;
  box-sizing: border-box;
  .item {
    display: flex;
    margin: 0 15px;;
    align-items: center;
    .img {
      display: inline-block;
      width: 12px;
      margin-left: 10px;
      // border-radius: 3px;
    }
  }
}
</style>
