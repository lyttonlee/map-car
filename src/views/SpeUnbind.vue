<template>
  <div class="page home">
    <div class="box">
      <TableItem key="title" :attrs="['序号', 'VIN', 'UWB编号' ,'电量']" />
      <template v-for="(car, index) in renderList">
        <TableItem :key="index" :big="index === 0" :attrs="[index + 1, car ? car.vehicle.identification : '', car ? car.locator.id : '', car ? car.locator.power + '%' : '']" />
      </template>
    </div>
    <div id="map-spe1" class="map">
      <div class="fixed-tip">
        <zx-icon class="big" type="zx-alarm"></zx-icon><span class="num">{{alarmNum}}</span>
      </div>
    </div>
  </div>
</template>
<script>
import {
  mapState,
  mapActions,
} from 'vuex'
import {
  // getBindSpeCars
  getUnbindCars
} from '../api/special'
import {
  createCar,
  // createVMCar,
  updatePosition,
  // createTooltip,
  // drawLine,
  createNumTooltip
} from '../utils/spe'
import TableItem from '../components/TableItem'
export default {
  components: {
    TableItem
  },
  // ..
  data () {
    return {
      // ..
      bindMap: new Map(),
      unbindMap: [],
      bindList: [],
      renderList: new Array(3).fill(null),
      alarmNum: 0
    }
  },
  computed: {
    ...mapState(['speicalMapInfo', 'carScale', 'productLineId', 'pointScale', 'initMapZoom', 'officeName'])
  },
  methods: {
    ...mapActions(['getMapInfo']),
    async getCars () {
      const { result, code, desc } = await getUnbindCars()
      if (code === 0) {
        // console.log(result)
        const { bindList, alarmNum } = result
        for (let i = 0; i < 2; i++) {
          if (bindList[i]) {
            this.renderList[i] = bindList[i]
          } else {
            this.renderList[i] = null
          }
        }
        this.renderList = [...this.renderList]
        this.updateBindCar(bindList)
        this.alarmNum = alarmNum
      } else {
        this.$notify.error(desc)
      }
    },
    updateBindCar (bindList = []) {
      // update car
      // console.log(bindList)
      if (bindList.length > 0) {
        // remove cars who has out map
        this.bindMap.forEach((marker, vin) => {
          // console.log(vin)
          if (!bindList.find((car) => car.vehicle.identification === vin)) {
            // console.log('remove')
            marker.remove()
            this.bindMap.delete(vin)
          }
        })
        // update
        bindList.forEach((car, index) => {
          // ..
          const vin = car.vehicle.identification
          // const power = car.locator.power
          if (this.bindMap.has(vin)) {
            updatePosition(this.bindMap.get(vin), car, index, this.mapInfo.carScale, false)
            this.bindMap.get(vin).setTooltipContent(...createNumTooltip(index))
          } else {
            const marker = createCar(car, this.mapInfo.carScale, index)
            this.bindMap.set(vin, marker)
            marker.addTo(this.map)
            marker.setRotation(270)
            // marker.bindTooltip(...createVinTooltip(vin, index)).openTooltip()
            marker.bindTooltip(...createNumTooltip(index)).openTooltip()
            // console.log(marker.getTooltip())
          }
        })
      } else {
        this.bindMap.forEach((marker) => marker.remove())
        this.bindMap = new Map()
      }
    },
  },
  mounted () {
    this.getMapInfo().then(() => {
      // console.log(this.speicalMapInfo)
      let mapInfo = this.speicalMapInfo.find((map) => map.name === this.officeName)
      if (!mapInfo) {
        this.$notify.error({
          message: '没有找到合适的地图数据'
        })
        return new Error('没有找到合适的地图数据')
      }
      // eslint-disable-next-line no-debugger
      // debugger
      const centerx = mapInfo.coordinateDown / this.pointScale + mapInfo.coordinateUpper / this.pointScale
      const centery = mapInfo.coordinateLeft / this.pointScale + mapInfo.coordinateRight / this.pointScale
      const center = [centerx / 2, centery / 2]
      // eslint-disable-next-line no-undef
      const map = L.map('map-spe1', {
        // center: [0, 0],
        center,
        zoom: mapInfo.zoom,
        minZoom: mapInfo.zoom,
        maxZoom: mapInfo.zoom,
        doubleClickZoom: false,
        zoomControl: false, // 默认不显示缩放按钮
        attributionControl: false // 不显示leaflet 图标logo
      })
      // console.log(mapInfo)
      const imgUrl = mapInfo.twoDFilePath
      const imgBounds = [[mapInfo.coordinateDown / this.pointScale, mapInfo.coordinateLeft / this.pointScale], [mapInfo.coordinateUpper / this.pointScale, mapInfo.coordinateRight / this.pointScale]]
      const mapPoints = [
        [mapInfo.coordinateDown / this.pointScale, mapInfo.coordinateLeft / this.pointScale],
        [mapInfo.coordinateUpper / this.pointScale, mapInfo.coordinateLeft / this.pointScale],
        [mapInfo.coordinateUpper / this.pointScale, mapInfo.coordinateRight / this.pointScale],
        [mapInfo.coordinateDown / this.pointScale, mapInfo.coordinateRight / this.pointScale],
      ]
      this.currentMapPoints = mapPoints
      this.mapInfo = mapInfo
      this.imageOverlay = L.imageOverlay(imgUrl, imgBounds)
      this.imageOverlay.addTo(map)
      this.map = map
      // drawLine().addTo(map)
      this.getCars()
      this.bindTime = setInterval(() => {
        this.getCars()
      }, 1000)
    }).catch((err) => {
      console.log(err)
      this.$notify.error({
        message: '获取地图数据失败[失望脸]'
      })
    })
  },
  beforeDestroy () {
    this.bindTime && clearInterval(this.bindTime)
    this.bindTime = null
  }
}
</script>
<style lang="less" scoped>
.page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .box {
    height: 35vh;
    width: 100%;
    overflow-y: auto;
  }
  .map {
    height: 60%;
    width: 100%;
    position: relative;
    .fixed-tip {
      position: absolute;
      right: 20px;
      bottom: 10px;
      z-index: 3000;
      // background: rgba(0, 0, 0, 0.192);
      .big {
        font-size: 4rem;
        color: red;
      }
      .num {
        font-size: 3rem;
        color: red;
      }
    }
  }
}
</style>
