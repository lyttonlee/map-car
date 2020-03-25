<template>
  <div class="page">
    <div class="search">
      <el-input v-model="search" @blur="doSearch" placeholder="搜索筛选框"></el-input>
    </div>
    <el-table :data="alarms" style="width: 100%;background:#fff0" size="mini">
      <el-table-column label="类型">
        <template slot-scope="scope">
          <div>{{formatAlarmType(scope.row.alarmCode)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="车架号" prop="vehicleIdentification"></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <div>{{scope.row.alarmDispose === true ? '已处理' : '未处理'}}</div>
        </template>
      </el-table-column>
      <el-table-column label="时间">
        <template slot-scope="scope">
          {{$moment(scope.row.alarmTime).format('YYYY-MM-DD HH:mm:ss')}}
        </template>
      </el-table-column>
      <el-table-column label="位置" prop="address"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <div v-if="scope.row.alarmDispose === true">{{scope.row.alarmAnnotation}}</div>
          <el-button v-else size="small" @click="doDispose(scope.row)" type="primary">处理告警</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :hide-on-single-page="true"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.current"
      @current-change="pageChanged"
      layout="total, prev, pager, next">
    </el-pagination>
    <div class="dispose" v-if="showDispose">
      <h3>告警处理</h3>
      <el-input class="input" v-model="disposeInfo" placeholder="请输入处理记录！"></el-input>
      <div class="action">
        <el-button-group>
          <el-button round="" type="primary" :disabled="!disposeInfo" :loading="loading" @click="submitDispose()">确定</el-button>
          <el-button round="" type="danger" @click="quitDispose" >退出</el-button>
        </el-button-group>
      </div>
    </div>
  </div>
</template>
<script>
import {
  queryAlarm,
  disposeAlarm,
} from '../../api/alarm'
import {
  mapState
} from 'vuex'
export default {
  data () {
    return {
      alarms: [],
      pagination: {
        pageSize: 15,
        total: 0,
        current: 1,
      },
      search: '',
      showDispose: false,
      disposeInfo: '',
      loading: false,
      disposeId: '',
    }
  },
  computed: {
    ...mapState(['productLineId', 'alarmConfig'])
  },
  methods: {
    // 解析告警类型
    formatAlarmType (code) {
      if (typeof this.alarmConfig !== 'object') return
      let alarm = this.alarmConfig.find((alarm) => {
        return alarm.code === code
      })
      if (alarm) {
        return alarm.name
      } else {
        return '未知告警'
      }
    },
    queryAlarmList (param) {
      let queryParam
      if (param) {
        queryParam = param
      } else {
        queryParam = {
          productLineId: this.productLineId,
          pageSize: this.pagination.pageSize,
        }
      }
      queryAlarm(queryParam).then((res) => {
        console.log(res)
        let { code, result } = res
        if (code === 0) {
          this.alarms = result.resultList
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
      this.queryAlarmList(param)
    },
    doSearch () {
      console.log('do')
      if (this.search) {
        let param = {
          productLineId: this.productLineId,
          pageSize: this.pagination.pageSize,
          currentPage: 1,
          dimMatch: this.search
        }
        this.queryAlarmList(param)
      } else {
        this.queryAlarmList()
      }
    },
    // 点击处理告警
    doDispose (row) {
      console.log(row)
      this.showDispose = true
      this.disposeId = row.alarmId
    },
    // 退出处理
    quitDispose () {
      this.showDispose = false
      this.disposeInfo = ''
      this.disposeId = ''
    },
    // 提交处理告警
    submitDispose () {
      this.loading = true
      let param = {
        annotation: this.disposeInfo,
        id: this.disposeId
      }
      disposeAlarm(param).then((res) => {
        let { code, desc } = res
        if (code === 0) {
          this.loading = false
          this.$notify.success({
            message: desc,
            position: 'bottom-right'
          })
          this.quitDispose()
          this.queryAlarmList()
        } else {
          this.loading = false
          this.$notify.error({
            message: desc,
            position: 'bottom-right'
          })
        }
      })
    }
  },
  created () {
    this.queryAlarmList()
  }
}
</script>
<style lang="less" scoped>
.page {
  .search {
    margin: 15px 0;
  }
  .dispose {
    width: 500px;
    height: 20vh;
    position: fixed;
    top: 200px;
    left: 600px;
    background: rgb(82, 82, 82);
    border-radius: 20px;
    padding: 15px;
    box-shadow: 2px 3px 5px #333;
    z-index: 2000;
    .input {
      width: 100%;
    }
    .action {
      margin-top: 30px;
    }
  }
}
</style>
