<template>
  <div class="page">
    <div class="select-alarm-type">
      <el-radio-group @change="changeAlarmType" v-model="showAlarmType" size="small">
        <el-radio-button label="car">车辆告警</el-radio-button>
        <el-radio-button label="other">其它告警</el-radio-button>
      </el-radio-group>
    </div>
    <div class="search">
      <el-input v-model="search" @keyup.enter.native="doSearch" @blur="doSearch" placeholder="请输入车架号"></el-input>
    </div>
    <div v-intro="'按类型和状态快速查询告警'" v-intro-step="1" class="search-box">
      <!-- <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange">全部告警类型</el-checkbox> -->
      <el-checkbox-group style="margin-left: 0px" :min="1" v-model="checkedAlarms" @change="checkedAlarmChange">
        <el-checkbox v-for="alarm in alarmValues" :label="alarm.code" :key="alarm.code">{{alarm.name}}</el-checkbox>
      </el-checkbox-group>
      <!-- <el-checkbox :indeterminate="isStatuIndeterminate" v-model="checkAllStatu" @change="checkStatuAllChange">全部状态</el-checkbox> -->
      <el-checkbox-group style="margin-left: 20px" :min="1" v-model="checkedStatu" @change="checkedStatuChange">
        <el-checkbox v-for="statu in alarmStatus" :label="statu.code" :key="statu.code">{{statu.name}}</el-checkbox>
      </el-checkbox-group>
    </div>
    <div v-intro="'告警列表显示最近发生的告警，可通过 处理告警 按钮对该告警快速处理并标记'" v-intro-step="2">
      <el-table :data="alarms" style="width: 100%;background:#fff0" size="small">
        <el-table-column label="类型">
          <template slot-scope="scope">
            <div><zx-icon class="error" style="font-size: 1.1rem" :type="computeAlarmIcon(scope.row.alarmCode)"></zx-icon> <span> {{formatAlarmType(scope.row.alarmCode)}}</span></div>
          </template>
        </el-table-column>
        <el-table-column label="定位器SN" prop="locatorSn"></el-table-column>
        <el-table-column label="车架号" prop="vehicleIdentification"></el-table-column>
        <el-table-column label="告警信息" width="300px" prop="alarmMessage"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- <div :class="scope.row.alarmDispose ? '' : 'error'" >{{scope.row.alarmDispose === true ? '已处理' : '未处理'}}</div>
            <div v-if="scope.row.alarmDispose">已处理</div> -->
            <el-tooltip v-if="scope.row.alarmDispose" class="success" effect="dark" :content="scope.row.alarmAnnotation" placement="top">
              <el-button type="text" size="small">已处理</el-button>
            </el-tooltip>
            <div v-else class="error">未处理</div>
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
            <!-- <el-button size="mini" round type="info" :disabled="true" v-if="scope.row.alarmDispose === true">{{scope.row.alarmAnnotation || ''}}</el-button> -->
            <div v-if="scope.row.alarmDispose === true">{{''}}</div>
            <el-button v-if="scope.row.alarmDispose === true" round size="mini" :disabled="true"  type="info">处理告警</el-button>
            <el-button v-else round size="mini" @click="doDispose(scope.row)" type="primary">处理告警</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      class="pagination"
      :hide-on-single-page="false"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.current"
      @current-change="pageChanged"
      layout="total, prev, pager, next">
    </el-pagination>
    <div class="dispose" v-if="showDispose">
      <div class="box">
        <h3>告警处理</h3>
        <el-input class="input" v-model="disposeInfo" placeholder="请输入处理记录！"></el-input>
        <div class="action">
          <el-button-group >
            <el-button size="small" round type="primary" :disabled="!disposeInfo" :loading="loading" @click="submitDispose()">确定</el-button>
            <el-button size="small" round type="danger" @click="quitDispose" >退出</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  queryAlarm,
  disposeAlarm,
  getShownAlarmType
} from '../../api/alarm'
import {
  mapState,
  // mapGetters,
} from 'vuex'
import {
  computeAlarmIcon,
} from '../../utils/utils'
import {
  introOption
} from '../../config/config'
export default {
  data () {
    return {
      alarms: [],
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1,
      },
      search: '',
      showDispose: false,
      disposeInfo: '',
      loading: false,
      disposeId: '',
      // 告警类型
      isIndeterminate: false,
      checkAll: true,
      checkedAlarms: [],
      // 告警状态
      alarmStatus: [{ code: 1, name: '未处理' }, { code: 2, name: '已处理' }],
      isStatuIndeterminate: false,
      checkAllStatu: true,
      checkedStatu: [1, 2],
      skipIntro: true,
      showAlarmType: 'car',
      alarmValues: []
    }
  },
  computed: {
    ...mapState(['productLineId', 'alarmConfig']),
    // ...mapGetters(['alarmValues']),
  },
  methods: {
    computeAlarmIcon,
    getInitType () {
      getShownAlarmType().then((res) => {
        // console.log(res)
        const { code, result } = res
        if (code === 0) {
          const { car, other } = result
          this.carAlarm = car
          this.otherAlarm = other
          if (this.showAlarmType === 'car') {
            this.alarmValues = car
            this.checkedAlarms = car.map((config) => {
              return config.code
            })
            let param = {
              productLineId: this.productLineId,
              pageSize: this.pagination.pageSize,
              currentPage: 1,
              alarmCodes: this.checkedAlarms
            }
            this.queryAlarmList(param)
          }
          if (this.showAlarmType === 'other') {
            this.alarmValues = other
            this.checkedAlarms = other.map((config) => {
              return config.code
            })
            let param = {
              productLineId: this.productLineId,
              pageSize: this.pagination.pageSize,
              currentPage: 1,
              alarmCodes: this.checkedAlarms
            }
            this.queryAlarmList(param)
          }
        }
      })
    },
    guide () {
      // console.log(this.$intro)
      this.$intro().setOptions(introOption).start().oncomplete(() => {
        localStorage.setItem('alarmIntro', true)
      }).onexit(() => {
        localStorage.setItem('alarmIntro', true)
      })
    },
    changeAlarmType () {
      // console.log(this.alarmValues)
      // console.log(this.showAlarmType)
      if (this.showAlarmType === 'car') {
        this.alarmValues = this.carAlarm
        this.checkedAlarms = this.carAlarm.map((config) => {
          return config.code
        })
        let param = {
          productLineId: this.productLineId,
          pageSize: this.pagination.pageSize,
          currentPage: 1,
          alarmCodes: this.checkedAlarms
        }
        this.queryAlarmList(param)
      }
      if (this.showAlarmType === 'other') {
        this.alarmValues = this.otherAlarm
        this.checkedAlarms = this.otherAlarm.map((config) => {
          return config.code
        })
        let param = {
          productLineId: this.productLineId,
          pageSize: this.pagination.pageSize,
          currentPage: 1,
          alarmCodes: this.checkedAlarms
        }
        this.queryAlarmList(param)
      }
    },
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
        // console.log(res)
        let { code, result } = res
        if (code === 0) {
          this.alarms = result.resultList
          this.pagination.total = result.pageObject.totalSize
          this.pagination.current = result.pageObject.currentPage
        }
      })
    },
    pageChanged (ev) {
      // console.log(ev)
      let param = {
        productLineId: this.productLineId,
        pageSize: this.pagination.pageSize,
        currentPage: ev
      }
      let param1 = this.computeParam()
      if (param1) {
        param = Object.assign(param1, param)
      }
      this.queryAlarmList(param)
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
      //   this.queryAlarmList(param)
      // } else {
      //   this.queryAlarmList()
      // }
      this.queryAlarmList(this.computeParam())
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
          this.queryAlarmList(this.computeParam())
        } else {
          this.loading = false
          this.$notify.error({
            message: desc,
            position: 'bottom-right'
          })
        }
      })
    },
    // 选择的告警类型改变
    checkedAlarmChange (ev) {
      // console.log(ev)
      this.checkAll = ev.length === this.alarmValues.length
      // console.log(this.checkAll)
      // console.log(this.checkedAlarms)
      let param = this.computeParam()
      if (param) {
        this.queryAlarmList(param)
      } else {
        this.queryAlarmList()
      }
    },
    // 全选告警类型状态改变
    checkAllChange (ev) {
      // console.log(ev)
      if (ev) { // true
        this.isIndeterminate = false
        this.checkedAlarms = this.alarmValues.map((config) => {
          return config.code
        })
      } else {
        this.isIndeterminate = true
        this.checkedAlarms = [1]
      }
    },
    // 全部告警处理状态改变
    // checkStatuAllChange (ev) {},
    // 告警处理状态改变
    checkedStatuChange (ev) {
      // console.log(ev)
      this.checkAllStatu = ev.length === this.alarmStatus.length
      // console.log(this.checkAllStatu)
      let param = this.computeParam()
      if (param) {
        this.queryAlarmList(param)
      } else {
        this.queryAlarmList()
      }
    },
    // 计算请求参数
    computeParam () {
      // if (!this.search && this.checkAll && this.checkAllStatu) return null
      let param = {
        productLineId: this.productLineId,
        pageSize: this.pagination.pageSize,
        currentPage: 1,
      }
      if (this.search) {
        param.dimMatch = this.search
      }
      if (!this.checkAllStatu) {
        if (this.checkedStatu[0] === 2) {
          param.dispose = true
        }
        if (this.checkedStatu[0] === 1) {
          param.dispose = false
        }
        // param.dispose = this.checkedStatu[0] === 2 ? true : false
      }
      param.alarmCodes = this.checkedAlarms
      // if (!this.checkAll) {
      //   param.alarmCodes = this.checkedAlarms
      // }
      return param
    }
  },
  created () {
    // this.queryAlarmList()
    this.getInitType()
    // console.log(this.alarmValues)
    // this.checkedAlarms = this.alarmValues.map((config) => {
    //   return config.code
    // })
    this.skipIntro = localStorage.getItem('alarmIntro') || false
  },
  mounted () {
    // this.$nextTick().then(() => {
    //   !this.skipIntro && this.guide()
    // })
    setTimeout(() => {
      !this.skipIntro && this.guide()
    }, 1000)
  }
}
</script>
<style lang="less" scoped>
@import '../../assets/less/color.less';
.page {
  overflow-y: auto;
  .search {
    margin: 15px 0;
  }
  .select-alarm-type {
    text-align: left;
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
      width: 500px;
      height: 20vh;
      background: @page-background;
      border-radius: 20px;
      padding: 15px;
      box-shadow: @shadow-base;
      .input {
        width: 100%;
      }
      .action {
        margin-top: 30px;
      }
    }
  }
}
</style>
