<template>
  <div class="page">
    <div id="map-fence" class="page"></div>
    <div class="control">
      <!-- 控制区域 -->
      <el-table :data="fences" size="small" >
        <el-table-column label="围栏名称" prop="name"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button-group>
              <el-button type="danger" round size="small" @click="deleteCurrentFence(scope.row)" >删除</el-button>
              <!-- <el-button type="primary" @click="editCurrentFence(scope.row)" >修改</el-button> -->
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-button @click="addFence">ADD Fence</el-button>
      <el-button @click="transAddress">Test Address</el-button>
      <div v-if="isCreating" class="fence-data">
        <el-input placeholder="围栏名称" v-model="fenceName"></el-input>
        <el-input placeholder="围栏type" v-model="fenceType"></el-input>
        <template v-for="(point, index) in fencePoints">
          <div :key="index">{{point}}</div>
        </template>
        <el-button :disabled="!canSubmit" @click="submitFence">submit</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import {
  queryMap,
  queryFence,
  createFence,
  deleteFence,
} from '../../api/fence'
import {
  transXYToAddress
} from '../../api/common'
export default {
  // ..
  data () {
    return {
      mapInfo: '',
      fences: [],
      fenceName: '', // 要添加的围栏名称
      fencePoints: [], // 围栏的点坐标
      isCreating: false, // 是否正在创建围栏
      fenceLayers: [], // 地图围栏图形集合
      fenceType: 3,
      colors: ['#67C23A', '#E6A23C', '#F56C6C', '#909399']
    }
  },
  computed: {
    canSubmit () {
      if (this.fenceName && this.fencePoints.length > 2) {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    getMapConfig () {
      let params = {
        productLineId: 1
      }
      queryMap(params).then((res) => {
        console.log(res)
        let { code, result } = res
        if (code === 0) {
          this.mapInfo = result[0].buildings[0].floors[0]
          this.createMap()
        }
      })
    },
    // 获取已有的地图围栏
    getAllFences () {
      let params = {
        productLineId: 1,
        id: 3
      }
      queryFence(params).then((res) => {
        console.log(res)
        let { code, result } = res
        if (code === 0) {
          console.log(result)
          this.fences = result
          // 将围栏数据解析并绘制围栏到地图上
          this.fences.length > 0 && this.fences.forEach((fence) => {
            this.renderFence(fence)
          })
        }
      })
    },
    // 绘制围栏到地图上
    renderFence (fence) {
      // 解析点
      let points = fence.points.split(';')
      console.log(fence)
      let formatPoints = points.map((point) => {
        let [x, y] = point.split('_')
        return [y, x]
      })
      // console.log(formatPoints)
      const polygon = L.polygon(formatPoints, { color: this.colors[fence.type] })
      // 围栏区域添加文字
      // polygon.bindPopup(fence.name)
      // polygon.openPopup()
      polygon.bindTooltip(fence.name + '  ' + 'type' + fence.type)
      this.fenceLayers.push(polygon)
      this.map && polygon.addTo(this.map)
      // console.log(this.fenceLayers)
    },
    // 设置围栏参数
    addFence () {
      let points = []
      let polyline
      this.isCreating = true
      this.map && this.map.on('click', (ev) => {
        // console.log(ev)
        let point = [ ev.latlng.lat, ev.latlng.lng ]
        points.push(point)
        this.fencePoints.push(`${ev.latlng.lng}_${ev.latlng.lat}_0`)
        if (points.length === 2) {
          polyline = L.polygon(points, { color: 'red' })
          polyline.addTo(this.map)
          this.fenceLayers.push(polyline)
        } else if (points.length > 2) {
          // console.log(polyline)
          polyline.addLatLng(point)
        }
      })
    },
    // 提交数据创建围栏
    submitFence () {
      this.fencePoints.push(this.fencePoints[0])
      // console.log(this.fencePoints)
      let param = {
        enable: true,
        fenceType: 3,
        name: this.fenceName,
        points: this.fencePoints.join(';'),
        type: this.fenceType,
        mapInfo: {
          id: this.mapInfo.id
        }
      }
      createFence(1, param).then((res) => {
        // console.log(res)
        let { code, desc } = res
        if (code === 0) {
          this.$notify.success({
            message: desc
          })
          this.map && this.map.off('click')
          this.refreshMap()
        } else {
          this.$notify.error({
            message: desc
          })
        }
      })
    },
    // 删除围栏
    deleteCurrentFence (fence) {
      let params = {
        productLineId: 1,
        zoneId: fence.id
      }
      deleteFence(params).then((res) => {
        // console.log(res)
        let { code, desc } = res
        if (code === 0) {
          this.$notify.success({
            message: desc
          })
          this.refreshMap()
        } else {
          this.$notify.error({
            message: desc
          })
        }
      })
    },
    // 重新绘制当前围栏
    editCurrentFence (fence) {
      // console.log(fence)
      // 清楚地图围栏
      // 重新画围栏
    },
    // 刷新地图围栏配置
    refreshMap () {
      this.fenceName = ''
      this.fencePoints = []
      this.fences = []
      this.fenceType = 3
      this.isCreating = false
      // console.log(this.fenceLayers)
      this.fenceLayers.forEach((layer) => {
        layer.remove()
      })
      this.fenceLayers = []
      // this.map.removeLayer()
      this.getAllFences()
    },
    createMap () {
      // eslint-disable-next-line no-undef
      const map = L.map('map-fence', {
        center: [4, -10],
        zoom: 6,
        // minZoom: 6,
        // maxZoom: 6,
        zoomControl: false, // 默认不显示缩放按钮
        attributionControl: false // 不显示leaflet 图标logo

      })
      // console.log(this.mapInfo)
      const imgUrl = this.mapInfo.twoDFilePath
      const imgBounds = [[this.mapInfo.coordinateDown, this.mapInfo.coordinateLeft], [this.mapInfo.coordinateUpper, this.mapInfo.coordinateRight]]
      // eslint-disable-next-line no-undef
      L.imageOverlay(imgUrl, imgBounds).addTo(map)
      this.map = map
      this.getAllFences()
    },
    // 解析地址
    transAddress () {
      this.map && this.map.on('click', (ev) => {
        console.log(ev)
        let point = ev.latlng
        let param = {
          productLineId: 1,
          floorId: 3,
          x: point.lng,
          y: point.lat,
        }
        transXYToAddress(param).then((res) => {
          console.log(res)
          let { code, result } = res
          if (code === 0) {
            this.$notify.success({
              message: result + ' x:' + point.lng + ' y:' + point.lat,
              position: 'bottom-right',
            })
          }
        })
      })
    }
  },
  created () {
    // this.getMapConfig()
  },
  mounted () {
    this.getMapConfig()
    // this.getAllFences()
  }
}
</script>
<style lang="less" scoped>
.page {
  .control {
    position: fixed;
    width: 400px;
    height: 70vh;
    background: rgba(90, 89, 89, 0.445);
    right: 30px;
    top: 100px;
    border-radius: 10px;
    padding: 15px;
    z-index: 2000;
  }
}
</style>
