<template>
  <div class="page">
    <div class="search">
      <el-input v-model="search" @blur="doSearch" placeholder="请输入要查找日志信息！"></el-input>
    </div>
    <el-table :data="logs" style="width: 100%;background:#fff0" size="mini">
      <el-table-column label="人员" prop="nickname"></el-table-column>
      <el-table-column label="事件内容" prop="content"></el-table-column>
      <el-table-column label="时间">
        <template slot-scope="scope">
          <div>{{$moment(scope.row.timeStamp).format('YYYY-MM-DD HH:mm:ss')}}</div>
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
  getLogs
} from '../../../api/logs'
export default {
  components: {
    // Roll
  },
  data () {
    return {
      logs: [],
      pagination: {
        pageSize: 15,
        total: 0,
        current: 1,
      },
      search: '',
    }
  },
  computed: {
    ...mapState(['productLineId'])
  },
  methods: {
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
    pageChanged (ev) {
      console.log(ev)
      let param = {
        productLineId: this.productLineId,
        pageSize: this.pagination.pageSize,
        currentPage: ev
      }
      if (this.search) {
        param.dimMatch = this.search
      }
      this.getSystemLogs(param)
    },
    doSearch () {
      // console.log('do')
      if (this.search) {
        let param = {
          productLineId: this.productLineId,
          pageSize: this.pagination.pageSize,
          currentPage: 1,
          dimMatch: this.search
        }
        this.getSystemLogs(param)
      } else {
        this.getSystemLogs()
      }
    },
  },
  created () {
    this.getSystemLogs()
  }
}
</script>
<style lang="less" scoped>
@import '../../../assets/less/main.less';
.page {
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
}
</style>
