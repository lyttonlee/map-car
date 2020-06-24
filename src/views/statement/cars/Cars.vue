<template>
  <div class="page">
    <div class="total">
      <div class="item">
        <h3>累计完成维修车辆数(台)</h3>
        <CountTo key="total-cars" className="font" :to="total" uid="total-cars" :duration="5" ></CountTo>
      </div>
      <div class="item">
        <h3>平均出荷时间(小时)</h3>
        <CountTo key="average-time" className="font" :to="average" uid="average-time" :duration="5" decimalPlaces="2" ></CountTo>
      </div>
      <div class="item">
        <h3>目前在库车辆(台)</h3>
        <CountTo key="repair" className="font" :to="unfinish" uid="repair" :duration="5" decimalPlaces="0" ></CountTo>
      </div>
    </div>
    <div class="search">
      <el-input v-model="search" @keyup.enter.native="doSearch" @blur="doSearch" placeholder="请输入要搜索车辆的车架号"></el-input>
    </div>
    <div class="search-box">
      <el-checkbox-group style="margin-left: 20px" :min="1" v-model="checkedStatu" @change="checkedStatuChange">
        <el-checkbox v-for="statu in unbindStatus" :label="statu.code" :key="statu.code">{{statu.name}}</el-checkbox>
      </el-checkbox-group>
    </div>
    <el-table :data="cars" style="width: 100%;background:#fff0" size="mini">
      <!-- <el-table-column label="类型" prop="vehicleName"></el-table-column> -->
      <el-table-column min-width="100px" label="车架号" prop="vehicleIdentification"></el-table-column>
      <el-table-column min-width="200px" label="问题" prop="flawDetail"></el-table-column>
      <el-table-column label="入荷时间">
        <template slot-scope="scope">
          {{scope.row.bindTime ? $moment(scope.row.bindTime).format('YYYY-MM-DD HH:mm:ss') : '--'}}
        </template>
      </el-table-column>
      <el-table-column label="出荷时间">
        <template slot-scope="scope">
          {{scope.row.unbindTime ? $moment(scope.row.unbindTime).format('YYYY-MM-DD HH:mm:ss') :  scope.row.bindTime ? '维修中' : '--'}}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button round size="mini" type="danger" @click="showDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pagination"
      :hide-on-single-page="true"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.current"
      @current-change="pageChanged"
      layout="total, prev, pager, next">
    </el-pagination>
    <div class="dispose" v-if="showDispose">
      <div class="box">
        <h3>车辆详情</h3>
        <div class="detail">
          <div class="info">
            <div class="item-unique">维修时长: {{ showingCar.unbindTime ? $moment.duration(showingCar.unbindTime - showingCar.bindTime).asHours().toFixed(1) + '小时' : showingCar.bindTime ? $moment(showingCar.bindTime).toNow(true) : '未知'}}</div>
            <div class="item">当前环节: {{computedCarNode(showingCar.node)}}</div>
            <div class="item">车架号码: {{showingCar.vehicleIdentification}}</div>
            <div class="item">车辆型号: {{showingCar.vehicleType}}</div>
            <div class="item">车身颜色: {{showingCar.vehicleOutSideColor}}</div>
            <div class="item">发动机号: {{showingCar.vehicleEngineType}}</div>
            <div class="item">变 速 箱: {{showingCar.vehicleGearBox}}</div>
            <div class="item">车辆问题: {{showingCar.flawDetail}}</div>
            <div class="item">入荷时间: {{showingCar.bindTime ? $moment(showingCar.bindTime).format('YYYY-MM-DD HH:mm:ss') : '未知'}}</div>
            <div class="item" v-if="showingCar.locatorSn">标签编号: {{showingCar.locatorSn}}</div>
            <div class="item" v-if="showingCar.power">标签电量: {{showingCar.power + '%'}}</div>
            <div v-if="showingCar.unbindTime" class="item">出荷时间: {{$moment(showingCar.unbindTime).format('YYYY-MM-DD HH:mm:ss')}}</div>
          </div>
          <div class="logs">
            <template v-for="(item, index) in showingCar.logs">
              <Log :log="item" :uniqueItem="showingCar.logs.length === 1" :isStart="index === 0" :isLast="index === showingCar.logs.length - 1" :key="index" />
            </template>
          </div>
        </div>
        <div class="action">
          <el-button round type="danger" @click="quitModel" >退出</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  queryCars,
} from '../../../api/vq'
import {
  getCarStatistic,
} from '../../../api/statistic'
import {
  computedCarNode,
} from '../../../utils/utils'
import {
  mapState
} from 'vuex'
export default {
  components: {
    CountTo: () => import('@/components/CountTo'),
    Log: () => import('@/components/Log'),
  },
  data () {
    return {
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1,
      },
      cars: [],
      showDispose: false,
      showingCar: '',
      search: '',
      checkedStatu: [1, 2],
      unbindStatus: [{ code: 1, name: '未出荷' }, { code: 2, name: '已出荷' }],
      checkAll: true,
      total: 0,
      average: 0,
      unfinish: 0
    }
  },
  computed: {
    ...mapState(['productLineId'])
  },
  methods: {
    computedCarNode,
    checkedStatuChange (ev) {
      // console.log(ev)
      // console.log(this.checkedStatu)
      if (this.checkedStatu.length === this.unbindStatus.length) {
        this.checkAll = true
      } else {
        this.checkAll = false
      }
      this.getCarList(this.computeParam())
    },
    computeParam () {
      let param = {
        productLineId: this.productLineId,
        pageSize: this.pagination.pageSize,
        currentPage: 1,
      }
      if (this.search) {
        param.dimMatch = this.search
      }
      if (!this.checkAll) {
        if (this.checkedStatu[0] === 1) {
          param.unfinish = true
        }
        if (this.checkedStatu[0] === 2) {
          param.finish = true
        }
      }
      // console.log(param)
      return param
    },
    getCarList (param) {
      let queryParam
      if (param) {
        queryParam = param
      } else {
        queryParam = {
          productLineId: this.productLineId,
          pageSize: this.pagination.pageSize,
        }
      }
      queryCars(queryParam).then((res) => {
        // console.log(res)
        let { code, result } = res
        if (code === 0) {
          this.cars = result.resultList
          this.pagination.total = result.pageObject.totalSize
          this.pagination.current = result.pageObject.currentPage
        }
      })
    },
    doSearch () {
      // console.log('do')
      // if (this.search) {
      //   let param = {
      //     productLineId: this.productLineId,
      //     pageSize: this.pagination.pageSize,
      //     currentPage: 1,
      //     dimMatch: this.search
      //   }
      //   this.getCarList(param)
      // } else {
      //   this.getCarList()
      // }
      this.getCarList(this.computeParam())
    },
    pageChanged (ev) {
      // console.log(ev)
      let param = {
        productLineId: this.productLineId,
        pageSize: this.pagination.pageSize,
        currentPage: ev
      }
      let param1 = this.computeParam()
      param = Object.assign(param1, param)
      this.getCarList(param)
    },
    quitModel () {
      this.showDispose = false
      this.showingCar = ''
    },
    showDetail (car) {
      this.showingCar = car
      // console.log(this.showingCar)
      this.showDispose = true
    },
    getStatisticAll () {
      getCarStatistic().then((res) => {
        let { code, result } = res
        if (code === 0) {
          console.log(result)
          this.total = result.finished
          let time = result.average / 1000 / 60 / 60
          this.average = time.toFixed(2) * 1
          this.unfinish = result.unfinished
        }
      })
    }
  },
  created () {
    this.getCarList()
    this.getStatisticAll()
  }
}
</script>
<style lang="less" scoped>
@import '../../../assets/less/color.less';
.page {
  .total  {
    margin-top: 15px;
    height: 20vh;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto;
    column-gap: 20px;
    .item  {
      padding: 25px;
      background: @base-background;
      border-radius: 10px;
      .font {
        font-size: 4rem;
        color: @primary-color;
        @media screen and (max-width: 1600px) {
          font-size: 3rem;
        }
      }
    }
  }
  .search {
    margin: 15px 0;
  }
  .pagination {
    width: 100%;
    background: @base-background;
    padding: 5px 0;
    margin-top: 15px;
    border-radius: 10px;
  }
  .dispose {
    width: 100%;
    height: 100vh;
    position: fixed;
    background: rgba(128, 128, 128, 0.534);
    top: 0;
    left: 0;
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    .box {
      width: 800px;
      height: 500px;
      background: @page-background;
      border-radius: 20px;
      padding: 15px;
      box-shadow: @shadow-base;
      .detail {
        height: 400px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto;
        column-gap: 15px;
        .info {
          // height: 400px;
          overflow-y: auto;
          padding: 10px 5px;
          margin-top: 15px;
          background: @base-background;
          border: 1px solid rgba(46, 46, 46, 0.534);
          border-radius: 10px;
          .item {
            // font-size: 1rem;
            // border-bottom: 1px dashed #666;
            padding: 10px 0 5px 5px;
            text-align: left;
            letter-spacing: 1.5px;
          }
          .item-unique {
            font-size: 1.3rem;
            font-weight: bold;
            color: @primary-color;
            text-align: left;
          }
        }
        .logs {
          background: @base-background;
          padding: 5px;
          margin-top: 15px;
          overflow-y: auto;
          border-radius: 10px;
        }
      }
      .action {
        text-align: right;
        margin-top: 10px;
      }
    }
  }
}
</style>
