<template>
  <div class="page">
    <div id="map-base-station" class="map"></div>
  </div>
</template>
<script>
import {
  queryBaseStation
} from '../../../api/fence'
import normalStation from '../../../assets/img/station-normal.png'
import alarmStation from '../../../assets/img/station-alarm.png'
import {
  mapState,
  mapActions
} from 'vuex'
export default {
  data () {
    return {
      mapInfo: '',
      baseStationMarkers: []
    }
  },
  computed: {
    ...mapState(['productLineId', 'pointScale'])
  },
  methods: {
    ...mapActions(['getMapInfo']),
    getStationStatus () {
      let params = {
        productLineId: this.productLineId,
        floorId: this.mapInfo.id
      }
      queryBaseStation(params).then((res) => {
        console.log(res)
        let { code, result } = res
        if (code === 0) {
          result.forEach((station) => {
            this.createStation(station)
          })
        }
      })
    },
    queryMap () {
      this.getMapInfo().then((res) => {
        console.log(res)
        this.mapInfo = res
        // 创建地图
        this.createMap()
        // 获取基站信息
        this.getStationStatus()
      })
    },
    createMap () {
      const centerx = this.mapInfo.coordinateDown / this.pointScale + this.mapInfo.coordinateUpper / this.pointScale
      const centery = this.mapInfo.coordinateLeft / this.pointScale + this.mapInfo.coordinateRight / this.pointScale
      const center = [centerx / 2, centery / 2]
      // eslint-disable-next-line no-undef
      const map = L.map('map-base-station', {
        center,
        zoom: 9,
        minZoom: 9,
        maxZoom: 20,
        zoomControl: false, // 默认不显示缩放按钮
        attributionControl: false // 不显示leaflet 图标logo

      })
      // console.log(this.mapInfo)
      const imgUrl = this.mapInfo.twoDFilePath
      const imgBounds = [[this.mapInfo.coordinateDown / this.pointScale, this.mapInfo.coordinateLeft / this.pointScale], [this.mapInfo.coordinateUpper / this.pointScale, this.mapInfo.coordinateRight / this.pointScale]]
      // eslint-disable-next-line no-undef
      L.imageOverlay(imgUrl, imgBounds).addTo(map)
      this.map = map
    },
    // 创建基站信息点
    createStation (station) {
      let icon = L.icon({
        iconUrl: station.online ? normalStation : alarmStation,
        // iconSize: [30, 20]
        iconAnchor: [13.5, 14]
      })
      let stationMarker = L.marker([station.y / this.pointScale, station.x / this.pointScale], {
        icon,
        title: station.sn,
      })
      this.baseStationMarkers.push(stationMarker)
      this.map && stationMarker.addTo(this.map)
    },
    // 每5分钟刷新基站状态
    intervalStationStatu () {
      this.time = setInterval(() => {
        // 清楚已有的marker
        this.baseStationMarkers.forEach((station) => {
          station.remove()
        })
        this.baseStationMarkers = []
        // 重新请求新数据
        this.getStationStatus()
      }, 5 * 60 * 1000)
    }
  },
  mounted () {
    this.queryMap()
    this.intervalStationStatu()
  },
  beforeDestroy () {
    this.time && clearInterval(this.time)
  }
}
</script>
<style lang="less" scoped>
.page {
  .map {
    height: 90vh;
  }
}
</style>
