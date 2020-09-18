<template>
  <div class="page">
    <div class="map-wrap">
      <div id="map" class="map"></div>
      <div class="draw">
        <template v-for="(value, key, index) in fenceStyles">
          <div class="item" :key="index">
            <div :class="activeKey === key ? 'btn active' : 'btn'" @click="draw(key)" >添加{{ key }}车位</div>
          </div>
        </template>
        <div class="item" key="clear">
          <div class="btn" @click="reset()" >重置</div>
        </div>
        <i v-if="roles === 'SuperAdmin'">
          <template v-for="(value, key, index) in fenceStyles">
            <div class="item" :key="index">
              <div :class="activeKey === key && roles === 'SuperAdmin' ? 'btn active' : 'btn'" @click="draw(key, true)" >设置默认{{ key }}车位</div>
            </div>
          </template>
        </i>
        <!-- <div class="item" key="submit">
          <div class="btn submit" @click="submit()" >提交</div>
        </div> -->
      </div>
      <div class="tags">
        <template v-for="(value, key, index) in fenceStyles">
          <div class="item" :key="index">
            <span>{{key.toUpperCase() + ' : '}}</span>
            <span class="bolck" :style="{ background: value }"></span>
          </div>
        </template>
      </div>
    </div>
    <div class="action">
      <div class="tips">
        <h3>操作说明</h3>
        <p>1. 请先选择需要添加车位的科室</p>
        <p>2. 请将鼠标移动到VQ停车场，点击左键选择停车场的起点</p>
        <p>3. 移动鼠标会自动绘制出矩形区域，再次点击鼠标左键完成绘制</p>
        <p>4. 系统通过计算后会获得最新的车位结果</p>
        <h3>注意事项</h3>
        <p>1. 请只在VQ车场范围内进行绘制</p>
        <p>2. 如果发现绘制区域不符合实际使用，点击重置按钮可以恢复到默认的分配方案</p>
      </div>
      <div class="parks">
        <h3>车位统计</h3>
        <el-table :data="officeParks" size="mini" >
          <el-table-column label="科室" prop="name"></el-table-column>
          <!-- <el-table-column label="默认车位数" prop="default"></el-table-column> -->
          <el-table-column label="车位数" prop="num"></el-table-column>
          <el-table-column label="颜色">
            <template slot-scope="scope">
              <div :style="{background: scope.row.color, width: '40px', height: '20px'}"></div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>
import {
  initMap,
  createFence,
  // renderFence,
  renderPark,
  getOfficeNameById
} from '../utils/map'
import {
  enumOffices,
  fenceStyles
} from '../config/config'
import {
  mapState
} from 'vuex'
import {
  // queryFence
  getParksByType, transRequest
} from '../api/fence'
export default {
  data () {
    return {
      // ..
      fenceStyles,
      activeKey: '',
      officeParks: [],
      map: null,
      parks: {},
      parkMap: new Map()
    }
  },
  computed: {
    ...mapState(['pointScale', 'childMapInfos', 'productLineId', 'roles'])
  },
  methods: {
    deleteFence (row) {
      console.log(row)
    },
    async draw (key, origin = false) {
      this.activeKey = key
      const res = await createFence(this.map, key, origin)
      // console.log(res)
      res.forEach((item) => {
        const name = getOfficeNameById(item.fenceId)
        this.parks[item.id].setStyle({
          fillColor: fenceStyles[name] || '#689',
          fillOpacity: 0.4,
          stroke: false
        })
      })
      const params = {
        id: this.mapInfo.id,
        type: 4
      }
      const parkRes = await getParksByType(params)
      const { code, result } = parkRes
      if (code === 0) {
        this.parkMap = new Map()
        result.forEach((item) => {
          // 计算vq及科室的车位数量
          if (item.fenceId) {
            const name = getOfficeNameById(item.fenceId)
            this.parkMap.has(name) ? this.parkMap.set(name, this.parkMap.get(name) + 1) : this.parkMap.set(name, 1)
          } else {
            this.parkMap.has('VQ') ? this.parkMap.set('VQ', this.parkMap.get('VQ') + 1) : this.parkMap.set('VQ', 1)
          }
        })
        this.officeParks = enumOffices.map((office) => {
          return {
            name: office,
            num: this.parkMap.get(office) || 0,
            color: this.fenceStyles[office]
          }
        })
      }
      this.activeKey = ''
    },
    // 重置为默认
    async reset () {
      // 。。
      const res = await transRequest({}, '/fenceDate/v1.0/origin/type')
      // console.log(res)
      if (res.code === 0 && res.result.code === 0) {
        this.init()
      }
    },
    async init () {
      // console.log(this.parks)
      Object.values(this.parks).forEach((park) => {
        if (park) {
          park.remove()
        }
      })
      this.parks = {}
      this.parkMap = new Map()
      // 获取所有车位信息
      const params = {
        id: this.mapInfo.id,
        type: 4
      }
      const res = await getParksByType(params)
      // console.log(res)
      const { code, result } = res
      if (code === 0) {
        result.forEach((item) => {
          const park = renderPark(item)
          park.addTo(this.map)
          this.parks[item.id] = park
          // 计算vq及科室的车位数量
          if (item.fenceId) {
            const name = getOfficeNameById(item.fenceId)
            this.parkMap.has(name) ? this.parkMap.set(name, this.parkMap.get(name) + 1) : this.parkMap.set(name, 1)
          } else {
            this.parkMap.has('VQ') ? this.parkMap.set('VQ', this.parkMap.get('VQ') + 1) : this.parkMap.set('VQ', 1)
          }
        })
        // console.log(this.parkMap)
        this.officeParks = enumOffices.map((office) => {
          return {
            name: office,
            num: this.parkMap.get(office) || 0,
            color: this.fenceStyles[office]
          }
        })
      }
    }
  },
  async mounted () {
    const opts = {
      minZoom: 8,
      maxZoom: 13
    }
    const { map, mapInfo, mapPoints } = await initMap(opts)
    // renderFence(map, this.childMapInfos)
    this.map = map
    this.mapInfo = mapInfo
    this.mapPoints = mapPoints
    this.init()
  }
}
</script>
<style lang="less" scoped>
@import '../assets/less/color.less';
.page {
  display: flex;
  .map-wrap {
    height: 100vh;
    width: 50%;
    position: relative;
    .map {
      height: 90vh;
    }
    .draw {
      position: absolute;
      top: 50px;
      left: 20px;
      z-index: 2500;
      // border-bottom: .5px solid #999;
      .item {
        margin: 15px 0;
        .btn {
          margin-top: 10px;
          padding: 10px;
          border-radius: 5px;
          background: @page-background;
          border: .5px solid #222;
          box-sizing: border-box;
          // box-shadow: @shadow-base;
          box-shadow: 1px 3px 3px #000;
          cursor: pointer;
        }
        .submit {
          // background: rgba(46, 6, 6, 0.507);
          // color: @primary-color;
          border-radius: 20px;
          box-shadow: 0 6px 6x rgb(31, 3, 3);
        }
        .active {
          color: @primary-color;
          background: @base-background-opacity;
        }
      }
    }
    .tags {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 20px 10px;
      box-sizing: border-box;
      .item {
        display: flex;
        .bolck {
          display: inline-block;
          width: 60px;
          margin-left: 10px;
          border-radius: 3px;
        }
      }
    }
  }
  .action {
    width: 50%;
    padding: 60px 20px;
    border-left: .5px solid #666;
    height: 100vh;
    box-sizing: border-box;
    overflow-y: auto;
    .tips {
      text-align: left;
      border-bottom: .5px solid #999;
    }
    .parks {
      text-align: left;
      padding: 10px 0;
    }
  }
}
</style>
