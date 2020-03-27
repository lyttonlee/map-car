<template>
  <div class="page">
    <div id="map-base-station" class="map"></div>
  </div>
</template>
<script>
import {
  queryBaseStation
} from '../../../api/fence'
import {
  mapState,
  mapActions
} from 'vuex'
export default {
  data () {
    return {
      mapInfo: '',
      baseStations: ''
    }
  },
  computed: {
    ...mapState(['productLineId'])
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
          this.baseStations = result
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
      // eslint-disable-next-line no-undef
      const map = L.map('map-base-station', {
        center: [4, -10],
        zoom: 6,
        minZoom: 6,
        maxZoom: 6,
        zoomControl: false, // 默认不显示缩放按钮
        attributionControl: false // 不显示leaflet 图标logo

      })
      // console.log(this.mapInfo)
      const imgUrl = this.mapInfo.twoDFilePath
      const imgBounds = [[this.mapInfo.coordinateDown, this.mapInfo.coordinateLeft], [this.mapInfo.coordinateUpper, this.mapInfo.coordinateRight]]
      // eslint-disable-next-line no-undef
      L.imageOverlay(imgUrl, imgBounds).addTo(map)
      this.map = map
    },
  },
  mounted () {
    this.queryMap()
  }
}
</script>
<style lang="less">
.page {
  .map {
    height: 90vh;
  }
}
</style>
