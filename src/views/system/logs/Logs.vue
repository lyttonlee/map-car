<template>
  <div class="page">
    <div class="search">
      <el-input v-model="search" @keyup.enter.native="doSearch" @blur="doSearch" placeholder="请输入要查找日志相关人员和内容！"></el-input>
    </div>
    <div class="search-box">
      <el-date-picker
        class="date-picker"
        v-model="times"
        type="datetimerange"
        :picker-options="pickerOptions"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="timeChange"
        align="right">
      </el-date-picker>
      <el-checkbox-group class="checkbox-search" :min="1" v-model="checkedStatu" @change="checkedStatuChange">
        <el-checkbox v-for="statu in logCodes" :label="statu.value" :key="statu.value">{{statu.message}}</el-checkbox>
      </el-checkbox-group>
    </div>
    <el-table :data="logs" style="width: 100%;background:#fff0" size="mini">
      <el-table-column label="人员" prop="nickname"></el-table-column>
      <el-table-column label="类型">
        <template slot-scope="scope">
          <div>{{formatLogCode(scope.row.type)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="事件内容" prop="content"></el-table-column>
      <el-table-column label="操作平台" prop="platform"></el-table-column>
      <el-table-column label="时间">
        <template slot-scope="scope">
          <div>{{$moment(scope.row.timestamp).format('YYYY-MM-DD HH:mm:ss')}}</div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pagination"
      size="mini"
      :hide-on-single-page="false"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.current"
      @current-change="pageChanged"
      layout="total, prev, pager, next">
    </el-pagination>
    <!-- <div class="test">
      <Roll />
    </div> -->
  </div>
</template>
<script>
// import Roll from '../../components/roll/RollList'
import {
  mapState
} from 'vuex'
import {
  getLogs,
  getLogCode,
} from '../../../api/logs'
export default {
  components: {
    // Roll
  },
  data () {
    return {
      logs: [],
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1,
      },
      logCodes: [],
      checkedStatu: [0, 2, 3, 4],
      checkAll: true,
      search: '',
      times: '',
      pickerOptions: {
        disabledDate (ev) {
          // console.log(ev)
          return ev.getTime() > Date.now()
        },
        shortcuts: [{
          text: '最近一周',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  computed: {
    ...mapState(['productLineId'])
  },
  methods: {
    computeParam () {
      // .
      let param = {
        productLineId: this.productLineId,
        pageSize: this.pagination.pageSize,
        currentPage: 1,
      }
      if (this.search) {
        param.dimMatch = this.search
      }
      if (this.times) {
        let [start, end] = this.times.map((time) => time.valueOf())
        param.startTime = start
        param.endTime = end
      }
      if (!this.checkAll) {
        param.type = this.checkedStatu
      }
      return param
    },
    checkedStatuChange (ev) {
      console.log(ev)
      if (ev.length !== this.logCodes.length) {
        this.checkAll = false
      }
      this.getSystemLogs(this.computeParam())
    },
    timeChange (ev) {
      console.log(ev)
      // console.log(this.times)
      // let [start, end] = this.times.map((time) => time.valueOf())
      // console.log(start, end)
      this.getSystemLogs(this.computeParam())
    },
    getSystemLogs (param) {
      let queryParam
      if (param) {
        queryParam = param
      } else {
        queryParam = {
          productLineId: this.productLineId,
          pageSize: this.pagination.pageSize,
        }
      }
      getLogs(queryParam).then((res) => {
        console.log(res)
        let { code, result } = res
        if (code === 0) {
          this.logs = result.resultList
          this.pagination.total = result.pageObject.totalSize
          this.pagination.current = result.pageObject.currentPage
        }
      })
    },
    getLogCodeList () {
      getLogCode().then((res) => {
        let { code, result } = res
        if (code === 0) {
          this.logCodes = result
        }
      })
    },
    formatLogCode (code) {
      return this.logCodes.find((log) => log.value === code).message
    },
    pageChanged (ev) {
      console.log(ev)
      let param = {
        productLineId: this.productLineId,
        pageSize: this.pagination.pageSize,
        currentPage: ev
      }
      let param1 = this.computeParam()
      param = Object.assign(param1, param)
      this.getSystemLogs(param)
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
      //   this.getSystemLogs(param)
      // } else {
      //   this.getSystemLogs()
      // }
      this.getSystemLogs(this.computeParam())
    },
  },
  created () {
    this.getSystemLogs()
    this.getLogCodeList()
  }
}
</script>
<style lang="less" scoped>
@import '../../../assets/less/main.less';
.page {
  .search {
    margin: 15px 0;
  }
  .search-box {
    display: flex;
    align-items: center;
    .checkbox-search {
      padding-left: 20px;
      // align-items: center;
    }
  }
  .pagination {
    width: 100%;
    background: @base-background;
    padding: 5px 0;
    margin-top: 15px;
    border-radius: 10px;
  }
}
</style>
