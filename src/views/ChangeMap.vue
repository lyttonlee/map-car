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
          <div class="btn" @click="draw()" >重画</div>
        </div>
        <div class="item" key="submit">
          <!-- <el-button type="danger" size="small" @click="submit()">提交</el-button> -->
          <div class="btn submit" @click="submit()" >提交</div>
        </div>
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
        <p>4. 点击确认添加按钮完成车位添加</p>
        <h3>注意事项</h3>
        <p>1. 如果需要绘制多个位置区域，为保证系统内部对车辆位置计算的准确性请保证区域之间没有重合部分</p>
        <p>2. 如果发现绘制区域不符合实际使用，可以点击清除按钮重新绘制</p>
        <p>3. 对已绘制提交的区域，点击对应的删除按钮可以删除</p>
        <p>4. 请只在VQ车场范围内进行绘制</p>
      </div>
      <div class="parks">
        <h3>新增区域</h3>
        <el-table :data="officeParks" size="mini" >
          <el-table-column label="科室" prop="name"></el-table-column>
          <el-table-column label="默认车位数" prop="default"></el-table-column>
          <el-table-column label="当前持有车位数" prop="cur"></el-table-column>
          <el-table-column label="变化对比">
            <template slot-scope="scope">
              <div :class="scope.row.default - scope.row.cur < 0 ? 'success' : 'error'">{{Math.abs(scope.row.default - scope.row.cur)}}</div>
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
  renderFence
} from '../utils/map'
import {
  fenceStyles
} from '../config/config'
import {
  mapState
} from 'vuex'
export default {
  data () {
    return {
      // ..
      fenceStyles,
      activeKey: '',
      officeParks: [
        {
          name: 'WE',
          default: 135,
          cur: 210,
        },
        {
          name: 'AF',
          default: 150,
          cur: 95,
        },
      ],
      map: null
    }
  },
  computed: {
    ...mapState(['pointScale', 'childMapInfos'])
  },
  methods: {
    deleteFence (row) {
      console.log(row)
    },
    draw (key) {
      this.activeKey = key
      createFence(this.map, key)
    },
    submit () {
      console.log(this.map.customPolygon)
      const points = this.map.customPolygon.getLatLngs()[0].map((point) => {
        return `${point.lng * this.pointScale}_${point.lat * this.pointScale}_0`
      })
      console.log(points)
      console.log(this.map.customPolygon.getLatLngs())
      // request {}
      const param = {
        points,
        type: this.activeKey
      }
      console.log(param)
    }
  },
  async mounted () {
    const opts = {
      minZoom: 8,
      maxZoom: 13
    }
    const { map, mapInfo, mapPoints } = await initMap(opts)
    renderFence(map, this.childMapInfos)
    this.map = map
    this.mapInfo = mapInfo
    this.mapPoints = mapPoints
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
