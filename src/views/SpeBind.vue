<template>
  <div class="page home">
    <div id="map-spe1" class="map"></div>
  </div>
</template>
<script>
import {
  mapState,
  mapActions,
} from 'vuex'
import {
  getBindSpeCars
} from '../api/special'
import {
  createCar,
  createVMCar,
  updatePosition,
  createTooltip,
  drawLine
} from '../utils/spe'
export default {
  // ..
  data () {
    return {
      // ..
      bindMap: new Map(),
      unbindMap: [],
    }
  },
  computed: {
    ...mapState(['speicalMapInfo', 'carScale', 'productLineId', 'pointScale', 'initMapZoom', 'officeName'])
  },
  methods: {
    ...mapActions(['getMapInfo']),
    async getCars () {
      const { result, code, desc } = await getBindSpeCars()
      if (code === 0) {
        // console.log(result)
        const { bindList, unbindList } = result
        this.updateBindCar(bindList)
        this.freshUnbindCars(unbindList)
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
            console.log('remove')
            marker.remove()
            this.bindMap.delete(vin)
          }
        })
        // update
        bindList.forEach((car, index) => {
          // ..
          const vin = car.vehicle.identification
          const power = car.locator.power
          if (this.bindMap.has(vin)) {
            updatePosition(this.bindMap.get(vin), car)
          } else {
            const marker = createCar(car, this.mapInfo.carScale)
            this.bindMap.set(vin, marker)
            marker.addTo(this.map)
            marker.setRotation(270)
            // marker.bindTooltip(...createVinTooltip(vin, index)).openTooltip()
            marker.bindTooltip(...createTooltip(vin, power, index === 0)).openTooltip()
            console.log(marker.getTooltip())
          }
        })
      }
    },
    freshUnbindCars (unbindList = []) {
      // 删除原有的未绑定车
      this.unbindMap.forEach((marker) => marker.remove())
      this.unbindMap = []
      // 重新渲染未绑定车
      // todo..
      unbindList.forEach((vin, index) => {
        const marker = createVMCar(vin, this.mapInfo.carScale, index)
        this.unbindMap.push(marker)
        marker.addTo(this.map)
        marker.setRotation(270)
        marker.bindTooltip(...createTooltip(vin, null, false)).openTooltip()
      })
      // console.log(this.unbindMap)
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
      drawLine().addTo(map)
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
  .map {
    height: 100%;
    width: 100%;
  }
}
</style>
