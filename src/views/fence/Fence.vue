<template>
  <div class="page">
    <div id="map-fence" class="page"></div>
    <div class="action">
      <el-button-group>
        <el-button round @click="toggleShowFence">关闭/显示围栏设置</el-button>
        <el-button round @click="toggleShowPickMap">关闭/显示截取地图</el-button>
      </el-button-group>
    </div>
    <div v-show="showPickMap" class="pick-map">
      <h5>科室地图截取</h5>
      <el-table :data="childMapInfos" size="mini" >
        <el-table-column label="地图名称" prop="name"></el-table-column>
        <el-table-column label="Action">
          <template slot-scope="scope">
            <el-button size="mini" round @click="deleteMap(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-input v-model="pickMapInfo.name" placeholder="地图名称"></el-input>
      <el-input v-model="pickMapInfo.zoom" @change="changeMapZoom" placeholder="当前缩放等级"></el-input>
      <el-input v-model="carScale" @change="changeCarScale" placeholder="车辆图标缩放等级"></el-input>
      <el-button @click="pickMap" :disabled="!canAddPoint" type="primary">选择要截取地图的两个点</el-button>
      <el-button @click="resetPoints">重置</el-button>
      <template v-for="(point, index) in pickedMapPoints">
        <div :key="index">{{`x: ${point.x} y: ${point.y}`}}</div>
      </template>
      <el-button type="primary" :disabled="!canSubmitPick" @click="submitPick" >确定截取</el-button>
    </div>
    <div class="control"  v-show="showAboutFence">
      <div class="left">
        <!-- 控制区域 -->
        <el-button @click="addFence">ADD Fence</el-button>
        <el-button @click="transAddress">Test Address</el-button>
        <el-button @click="drawCarport">Add Car Port</el-button>
        <input type="file" @change="upload">
        <el-button @click="drawTwoPoints">通过矩形删除围栏</el-button>
        <el-input placeholder="缩放marker 就是车" v-model="carScale" @change="changeCarScale"></el-input>
        <el-input placeholder="旋转marker 就是车" v-model="carRotate" @change="changeCarRotate"></el-input>
        <el-button type="info" @click="quitDraw">重置</el-button>
        <div v-if="isDeleteParks" class="fence-data">
          <template v-for="(point, index) in fencePoints">
            <div :key="index">{{point}}</div>
          </template>
          <el-button :disabled="!canDelete" @click="submitPoints">确认</el-button>
        </div>
        <div v-if="isCreating" class="fence-data">
          <el-input placeholder="围栏名称" v-model="fenceName"></el-input>
          <el-input placeholder="围栏type" v-model="fenceType"></el-input>
          <el-input placeholder="请输入区域角度" v-model="angle"></el-input>
          <template v-for="(point, index) in fencePoints">
            <div :key="index">{{point}}</div>
          </template>
          <el-button :disabled="!canSubmit" @click="submitFence">submit</el-button>
        </div>
        <div v-if="isCreateCarport">
          <template v-for="(point, index) in fencePoints">
            <div :key="index">{{point}}</div>
          </template>
          <el-input placeholder="车位名字" v-model="carportName"></el-input>
          <el-input placeholder="X偏移" v-model="xOffset"></el-input>
          <el-input placeholder="Y偏移" v-model="yOffset"></el-input>
          <el-input placeholder="数量" v-model="offsetNum"></el-input>
          <el-input placeholder="角度" v-model="portAngle"></el-input>
          <el-button :disabled="!canDraw" @click="submitCarport">submit</el-button>
        </div>
      </div>
      <div class="content">
        <el-table :data="fences" size="mini" >
          <el-table-column label="围栏名称" prop="name"></el-table-column>
          <el-table-column label="类型" prop="type"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button-group>
                <el-button type="danger" round size="mini" @click="deleteCurrentFence(scope.row)" >删除</el-button>
                <!-- <el-button type="primary" @click="editCurrentFence(scope.row)" >修改</el-button> -->
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
import {
  // queryMap,
  queryFence,
  createFence,
  deleteFence,
  createCarPort,
  deleteParks,
  // getUploadUrl,
  uploadParksFile,
  createSmallMap,
  deleteSmallMap,
} from '../../api/fence'
// import request from '../../api/axios'
import {
  transXYToAddress
} from '../../api/common'
import Car from '../../assets/img/car-blue.png'
import {
  initCarSize
} from '../../config/config'
import {
  mapState,
  mapActions,
} from 'vuex'
export default {
  // ..
  data () {
    return {
      showAboutFence: true,
      showPickMap: false,
      mapInfo: '',
      fences: [],
      fenceName: '', // 要添加的围栏名称
      fencePoints: [], // 围栏的点坐标
      isCreating: false, // 是否正在创建围栏
      fenceLayers: [], // 地图围栏图形集合
      fenceType: 3,
      colors: ['#67C23A', '#E6A23C', '#F56C6C', '#369899'],
      angle: 0,
      isCreateCarport: false,
      xOffset: '',
      yOffset: '',
      offsetNum: '',
      carportName: '',
      portAngle: '',
      isDeleteParks: false,
      carScale: 1,
      carRotate: '',
      pickMapInfo: {
        name: '',
        zoom: 0,
      },
      pickedMapPoints: [],
      pickedMapPolygon: '',
    }
  },
  computed: {
    ...mapState(['pointScale', 'childMapInfos']),
    canSubmit () {
      if (this.fenceName && this.fencePoints.length > 2) {
        return true
      } else {
        return false
      }
    },
    canDraw () {
      if (this.offsetNum && this.xOffset && this.yOffset && this.carportName && this.fencePoints.length > 3) {
        return true
      } else {
        return false
      }
    },
    canDelete () {
      if (this.fencePoints.length === 2) {
        return true
      } else {
        return false
      }
    },
    canAddPoint () {
      if (this.pickedMapPoints.length < 2) {
        return true
      } else {
        return false
      }
    },
    canSubmitPick () {
      if (this.pickedMapPoints.length === 2 && this.pickMapInfo.name && this.pickMapInfo.zoom && this.carScale) {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    ...mapActions(['getMapInfo']),
    changeMapZoom (zoom) {
      console.log(zoom)
      this.map.setZoom(zoom)
    },
    resetPoints () {
      this.pickedMapPoints = []
      this.pickedMapPolygon.remove()
      this.map.off('click')
      this.pickMap()
    },
    // 截取地图点
    pickMap () {
      let points = []
      this.map.on('click', (ev) => {
        console.log(ev)
        let point = [ ev.latlng.lat, ev.latlng.lng ]
        this.pickedMapPoints.push({ y: point[0] * this.pointScale, x: point[1] * this.pointScale })
        points.push(point)
        console.log(points)
        console.log(this.pickedMapPoints)
        if (this.pickedMapPoints.length === 2) {
          let newPoints = [points[0], [points[0][0], points[1][1]], points[1], [points[1][0], points[0][1]]]
          let polyline = L.polygon(newPoints, { color: 'green' })
          polyline.addTo(this.map)
          // this.smallMapPolygon.push(polyline)
          this.pickedMapPolygon = polyline
          this.map.off('click')
        }
      })
    },
    // 删除小地图
    deleteMap (map) {
      let id = map.id
      let params = {
        id
      }
      deleteSmallMap(params).then((res) => {
        console.log(res)
        let { code, desc } = res
        if (code === 0) {
          this.$notify.success({
            message: desc
          })
        } else {
          this.$notify.error({
            message: desc
          })
        }
      })
    },
    // 提交截取的地图数据
    submitPick () {
      let param = {
        parentId: this.mapInfo.id,
        name: this.pickMapInfo.name,
        zoom: this.pickMapInfo.zoom,
        carScale: this.carScale * 1,
        leftUp: this.pickedMapPoints[0],
        rightDown: this.pickedMapPoints[1]
      }
      createSmallMap(param).then((res) => {
        console.log(res)
        let { code, desc } = res
        if (code === 0) {
          this.$notify.success({
            message: desc
          })
          this.pickMapInfo.name = ''
          this.map.off('click')
          this.pickedMapPoints = []
          this.pickedMapPolygon.remove()
          // this.getMapConfig()
        } else {
          this.$notify.error({
            message: desc
          })
        }
      })
    },
    toggleShowFence () {
      this.showAboutFence = !this.showAboutFence
    },
    toggleShowPickMap () {
      this.showPickMap = !this.showPickMap
    },
    getMapConfig () {
      this.getMapInfo().then((mapInfo) => {
        this.mapInfo = mapInfo
        this.createMap()
      })
      // let params = {
      //   productLineId: 1
      // }
      // queryMap(params).then((res) => {
      //   console.log(res)
      //   let { code, result } = res
      //   if (code === 0) {
      //     // this.mapInfo = result[0].buildings[0].floors[0]
      //     this.mapInfo = result[0].buildings[0].floors.find((mapInfo) => mapInfo.parentId === null)
      //     this.createMap()
      //   }
      // })
    },
    // 获取已有的地图围栏
    getAllFences () {
      let params = {
        productLineId: 1,
        id: this.mapInfo.id
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
        return [y / this.pointScale, x / this.pointScale]
      })
      console.log(formatPoints)
      const polygon = L.polygon(formatPoints, { color: this.colors[fence.type] })
      // 围栏区域添加文字
      // polygon.bindPopup(fence.name)
      // polygon.openPopup()
      polygon.bindTooltip(fence.name + '  ' + 'type' + fence.type + ' ' + 'angle' + fence.angle)
      this.fenceLayers.push(polygon)
      this.map && polygon.addTo(this.map)
      // console.log(this.fenceLayers)
    },
    // 设置围栏参数
    addFence () {
      let points = []
      let polyline
      this.isCreating = true
      this.isCreateCarport = false
      this.map && this.map.on('click', (ev) => {
        // console.log(ev)
        let point = [ ev.latlng.lat, ev.latlng.lng ]
        points.push(point)
        this.fencePoints.push(`${ev.latlng.lng * this.pointScale}_${ev.latlng.lat * this.pointScale}_0`)
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
        angle: this.angle,
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
          this.isCreating = false
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
    // 清楚地图标记
    clearMap () {
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
    },
    createMap () {
      const centerx = this.mapInfo.coordinateDown / this.pointScale + this.mapInfo.coordinateUpper / this.pointScale
      const centery = this.mapInfo.coordinateLeft / this.pointScale + this.mapInfo.coordinateRight / this.pointScale
      const center = [centerx / 2, centery / 2]
      // eslint-disable-next-line no-undef
      const map = L.map('map-fence', {
        center,
        zoom: 9,
        // minZoom: 6,
        // maxZoom: 6,
        zoomControl: false, // 默认不显示缩放按钮
        attributionControl: false // 不显示leaflet 图标logo

      })
      // console.log(this.mapInfo)
      const imgUrl = this.mapInfo.twoDFilePath
      const imgBounds = [[this.mapInfo.coordinateDown / this.pointScale, this.mapInfo.coordinateLeft / this.pointScale], [this.mapInfo.coordinateUpper / this.pointScale, this.mapInfo.coordinateRight / this.pointScale]]
      // eslint-disable-next-line no-undef
      L.imageOverlay(imgUrl, imgBounds).addTo(map)
      this.map = map
      this.getAllFences()
      // 创建一个marker
      const icon = L.icon({
        iconUrl: Car,
        iconAnchor: [7.5, 15.5]
      })
      // console.log(icon)
      const marker = L.Marker.movingMarker([center], [], {
        rotate: true,
        icon,
        initialRotationAngle: 0,
        draggable: true
      })
      this.carMarker = marker
      marker.addTo(map)
      this.map.on('zoomend', (ev) => {
        // console.log(ev.target._zoom)
        this.pickMapInfo.zoom = ev.target._zoom
      })
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
    },
    drawCarport () {
      this.clearMap()
      let points = []
      let polyline
      this.isCreating = false
      this.isCreateCarport = true
      this.map && this.map.on('click', (ev) => {
        // console.log(ev)
        let point = [ ev.latlng.lat, ev.latlng.lng ]
        points.push(point)
        this.fencePoints.push(`${ev.latlng.lng * this.pointScale}_${ev.latlng.lat * this.pointScale}_0`)
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
    submitCarport () {
      console.log('do something')
      this.fencePoints.push(this.fencePoints[0])
      let param = {
        name: this.carportName,
        num: this.offsetNum * 1,
        pointStr: this.fencePoints.join(';'),
        xoff: this.xOffset * 1,
        yoff: this.yOffset * 1,
        angle: this.portAngle * 1,
        mapName: this.mapInfo.name
      }
      createCarPort(param).then((res) => {
        console.log(res)
        // let { code, desc } = res
        // if (code === 0) {
        //   this.refreshMap()
        //   this.map && this.map.off('click')
        //   this.$notify.success({
        //     message: desc
        //   })
        // } else {
        //   this.$notify.error({
        //     message: desc
        //   })
        // }
        let blob = new Blob([res], { type: 'application/vnd.ms-excel' })
        let reader = new FileReader()
        // reader.readAsBinaryString(res)
        reader.readAsDataURL(blob)
        reader.onload = (ev) => {
          console.log(ev)
          const a = document.createElement('a')
          a.href = ev.target.result
          a.download = 'park list'
          a.click()
          a.remove()
          this.isCreateCarport = false
          this.refreshMap()
        }
      })
    },
    upload (ev) {
      let file = ev.target.files[0]
      console.log(file)
      let reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = (ev) => {
        let blob = new Blob([ev.target.result], {
          type: file.type
        })
        // 上传车位文件
        let fd = new FormData()
        fd.append(file.name, blob)
        uploadParksFile(fd).then((res) => {
          console.log(res)
          let { code, result, desc } = res
          if (code === 0) {
            console.log(result)
            console.log(desc)
            this.$notify.success({
              message: desc
            })
          }
        })
      }
    },
    // 清除围栏
    drawTwoPoints () {
      this.isDeleteParks = true
      this.clearMap()
      let points = []
      let polyline
      this.isCreating = false
      this.isCreateCarport = false
      this.map && this.map.on('click', (ev) => {
        // console.log(ev)
        let point = [ ev.latlng.lat, ev.latlng.lng ]
        points.push(point)
        this.fencePoints.push(`${ev.latlng.lng * this.pointScale}_${ev.latlng.lat * this.pointScale}_0`)
        if (points.length === 2) {
          let newPoints = [points[0], [points[0][0], points[1][1]], points[1], [points[1][0], points[0][1]]]
          polyline = L.polygon(newPoints, { color: 'red' })
          polyline.addTo(this.map)
          this.fenceLayers.push(polyline)
        } else if (points.length > 2) {
          // console.log(polyline)
          polyline.addLatLng(point)
        }
      })
    },
    submitPoints () {
      let param = {
        pointStr: this.fencePoints.join(';'),
        mapName: this.mapInfo.name
      }
      deleteParks(param).then((res) => {
        let { code, desc } = res
        if (code === 0) {
          this.$notify.success({
            message: desc
          })
          this.isDeleteParks = false
          this.clearMap()
          this.refreshMap()
        }
      })
    },
    quitDraw () {
      this.fencePoints = []
      this.clearMap()
    },
    // 缩放车的大小
    changeCarScale () {
      let icon = this.carMarker.getIcon()
      let size = initCarSize.map((pixe) => {
        return pixe * this.carScale
      })
      let anchor = initCarSize.map((pixe) => {
        return pixe * this.carScale / 2
      })
      let newIcon = L.icon({
        iconUrl: icon.options.iconUrl,
        iconAnchor: anchor,
        iconSize: size
      })
      console.log(newIcon)
      this.carMarker.setIcon(newIcon)
      // m.setRotation(45)
      // console.log(icon)
    },
    // 旋转车
    changeCarRotate () {
      this.carMarker.setRotation(this.carRotate)
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
@import '../../assets/less/color.less';
.page {
  .action {
    position: fixed;
    left: 30%;
    top: 10px;
    background: @base-background-opacity;
    width: 350px;
    height: 40px;
    padding: 5px;
    z-index: 2000;
  }
  .pick-map {
    position: fixed;
    left: 10px;
    top: 100px;
    background: @base-background-opacity;
    height: 50vh;
    width: 300px;
    padding: 5px;
    z-index: 2000;
  }
  .control {
    display: grid;
    position: fixed;
    grid-template-columns: 300px auto;
    width: 600px;
    height: 70vh;
    background: @page-background-opacity;
    box-shadow: @shadow-base;
    right: 30px;
    top: 100px;
    border-radius: 10px;
    // padding: 15px;
    z-index: 2000;
    .left {
      background: @base-background-opacity;
      padding: 15px 10px;
    }
    .content {
      width: 100%;
      padding: 15px;
      box-sizing: border-box;
      max-height: 70vh;
      overflow-y: auto;
    }
  }
}
</style>
