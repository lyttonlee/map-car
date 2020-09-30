<template>
  <div class="car-list">
    <el-input class="input" size="small" @keyup.enter.native="doSearch" v-model="search" @blur="doSearch" placeholder="请输入要查询车辆的车架号或定位器SN"></el-input>
    <!-- <div class="header-area">
      <template v-for="(area, index) in areas">
        <div :class="activeAreaIndex === index ? `menu active` : 'menu'" @click="changeArea(index)" :key="index">{{area}}</div>
      </template>
    </div> -->
    <div v-intro="'点击不同的状态标签可筛选并显示当前不同状态的车辆'" v-intro-step="4" class="header">
      <template v-for="(menu, index) in menus">
        <div :class="activeIndex === index ? `menu active` : 'menu'" @click="changeMenu(index)" :key="index">{{menu + ` (${renderedNum[index]})`}}</div>
      </template>
    </div>
    <div class="list" v-intro="'点击车辆列表可以显示该车的详细信息及维修流程信息！'" v-intro-step="5">
      <div class="list-item">
        <div>
          车辆状态
        </div>
        <div class="car-oui">车架号</div>
        <div class="car-time">维修时长</div>
      </div>
      <template v-for="(car, index) in renderedCars">
        <div v-if="car.vehicle" :class="listActiveIndex === index ? 'list-item active' : 'list-item'" @click="showCarInfo(car, index)" :key="index">
          <div :class="computeCarClassColorByStatu(car.vehicle.status, car.vehicleDeliverStatus.bindTime)">
            <zx-icon type="zx-car2"></zx-icon>
          </div>
          <div class="car-oui">{{car.vehicle.identification}}</div>
          <div :class="formatTime(car.vehicleDeliverStatus.bindTime) * 1 >= overtime * 1 ? 'warn' : 'success'">{{formatTime(car.vehicleDeliverStatus.bindTime)}}小时</div>
        </div>
      </template>
    </div>
    <div class="unbind-list">
      <div class="title">未绑定车辆</div>
      <div class="list-item">
        <div>
          车辆状态
        </div>
        <div class="car-oui">定位器SN</div>
        <div class="car-time">位置</div>
      </div>
      <template v-for="(car, index) in unbindCars">
        <div v-if="car.sn" :class="unbindActiveIndex === index ? 'list-item active' : 'list-item'" @click="showUnbindCarInfo(car, index)" :key="index">
          <div class="unbind">
            <zx-icon type="zx-car2"></zx-icon>
          </div>
          <div class="car-oui">{{car.sn}}</div>
          <div class="success">{{car.address}}</div>
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
  introOption
} from '../config/config'
export default {
  props: {
    cars: {
      type: Array,
      required: true
    },
    unbindCars: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      menus: ['全部', '告警', '超时'],
      areas: ['全部区域', 'PQ', 'PA', 'AF', 'WE'],
      activeIndex: 0,
      activeAreaIndex: 0,
      renderedCars: [],
      search: '', // 要搜索的车架号 模糊匹配
      listActiveIndex: '',
      unbindActiveIndex: '',
    }
  },
  computed: {
    ...mapGetters(['overtime']),
    renderedNum () {
      let alarmNum = this.renderedCars.filter((car) => car.vehicle.status !== 0).length
      let overtimeNum = this.renderedCars.filter((car) => this.formatTime(car.vehicleDeliverStatus.bindTime) * 1 >= this.overtime * 1).length
      return [this.renderedCars.length, alarmNum, overtimeNum]
    },
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
  mounted () {
    // console.log(this.unbindCars)
    this.freshTime = setInterval(() => {
      this.renderedCars = [...this.renderedCars]
    }, 60000)
  },
  beforeDestroy () {
    this.freshTime && clearInterval(this.freshTime)
    this.freshTime = null
  },
  methods: {
    guide () {
      // console.log(this.$intro)
      let homeSideIntro = !localStorage.getItem('homeSideIntro') || true
      homeSideIntro && this.$intro().setOptions(introOption).start().oncomplete(() => {
        console.log('over')
        localStorage.setItem('homeSideIntro', true)
        // this.$refs['carlist'].guide()
      }).onexit(() => {
        localStorage.setItem('homeSideIntro', true)
        // this.$refs['carlist'].guide()
      })
    },
    // 搜索车架号查询
    doSearch () {
      this.renderedCars = this.computeRenderCars()
      // console.log(this.renderedCars)
    },
    initCars () {
      // console.log(this.cars)
      // this.activeIndex = 0
      // let cars
      // this.renderedCars = this.cars
      // if (this.activeIndex === 0 && this.search === '') {
      //   this.renderedCars = this.cars
      // }
      // if (this.activeIndex !== 0) {
      //   this.changeMenu(this.activeIndex)
      // }
      // if (this.search) {
      //   this.doSearch()
      // }
      this.renderedCars = this.computeRenderCars()
    },
    formatTime (s) {
      let repairTime = moment().valueOf() - s
      return moment.duration(repairTime / 1000, 's').asHours().toFixed(2)
    },
    changeMenu (index) {
      // if (this.activeIndex !== index) {
      // console.log('change-0')
      this.activeIndex = index
      this.renderedCars = this.computeRenderCars()
      // console.log('change')
      // }
    },
    changeArea (index) {
      this.activeAreaIndex = index
      this.$emit('changeMap', this.activeAreaIndex)
    },
    // ？？？
    computeRenderCars () {
      // console.log('do this')
      let temCars
      // 先切换menu 再在结果中找出符合搜索条件的car
      switch (this.activeIndex) {
        case 0:
          temCars = this.cars.filter((car) => car !== null)
          break
        case 1:
          temCars = this.cars.filter((car) => car.vehicle && car.vehicle.status !== 0)
          break
        case 2:
          temCars = this.cars.filter((car) => {
            // car.vehicleDeliverStatus.bindTime
            if (!car.vehicleDeliverStatus) return false
            return this.formatTime(car.vehicleDeliverStatus.bindTime) * 1 >= this.overtime * 1
          })
          break
        default:
          temCars = this.cars.filter((car) => car !== null)
          break
      }
      // 搜索
      if (this.search !== '') {
        temCars = temCars.filter((car) => car.vehicle && (car.vehicle.identification.includes(this.search) || car.locator.sn.includes(this.search)))
      }
      // 切换地图上对应的marker显示
      let carIds = temCars.map((car) => {
        return car.vehicle ? car.vehicle.id : null
      })
      carIds = carIds.filter((id) => id !== null)
      // console.log(carIds)
      // console.log(temCars)
      this.$emit('changeShowingMarkers', carIds)
      return temCars
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
    showCarInfo (car, index) {
      this.$emit('showCarInfo', car)
      this.listActiveIndex = index
    },
    showUnbindCarInfo (car, index) {
      this.$emit('showUnbindCarInfo', car)
      this.unbindActiveIndex = index
    },
    clearListActive () {
      // console.log('clear')
      this.listActiveIndex = ''
    },
    setListActive (carId) {
      // console.log(this.renderedCars)
      let index = this.renderedCars.findIndex((car) => car.vehicle.id === carId)
      // console.log(index)
      if (index !== -1) {
        this.listActiveIndex = index
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import '../assets/less/color.less';
.car-list {
  .input {
    margin-bottom: 15px;
  }
  .header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto;
    border-bottom: 1px solid #fff;
    .menu {
      cursor: pointer;
    }
    .active {
      border-bottom: 1px solid @primary-color;
      color: @primary-color;
    }
  }
  .header-area {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    grid-template-rows: auto;
    border-bottom: 1px solid #fff;
    margin-bottom: 15px;
    .menu {
      cursor: pointer;
    }
    .active {
      border-bottom: 1px solid @primary-color;
      color: @primary-color;
    }
  }
  .list {
    margin-top: 15px;
    height: 60vh;
    max-height: 60vh;
    overflow-y: auto;
    .list-item {
      cursor: pointer;
      // margin-top: 10px;
      padding-top: 10px;
      border-bottom: .5px solid rgba(251, 252, 250, 0.473);
      display: grid;
      grid-template-columns: 20% 50% 30%;
      grid-template-rows: auto;
      &:hover {
        background: @page-background;
        border-bottom: .5px solid rgba(251, 252, 250, 0.699);
      }
    }
    .active {
      background: @page-background;
      border-bottom: .5px solid rgba(251, 252, 250, 0.699);
    }
  }
  .unbind-list {
    height: 30vh;
    overflow-y: auto;
    .title {
      font-size: 1.2rem;
      font-weight: bold;
    }
    .list-item {
      .unbind {
        color: rgb(122, 118, 118);
      }
      cursor: pointer;
      // margin-top: 10px;
      padding-top: 10px;
      border-bottom: .5px solid rgba(251, 252, 250, 0.473);
      display: grid;
      grid-template-columns: 20% 50% 30%;
      grid-template-rows: auto;
      &:hover {
        background: @page-background;
        border-bottom: .5px solid rgba(251, 252, 250, 0.699);
      }
    }
    .active {
      background: @page-background;
      border-bottom: .5px solid rgba(251, 252, 250, 0.699);
    }
  }
}
</style>
