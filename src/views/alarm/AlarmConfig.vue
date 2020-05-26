<template>
  <div class="page">
    <div class="block"></div>
    <div v-intro="'列表会显示所有告警类型的配置信息，用户可按实际需求通过修改按钮对不同类型告警的阈值等的配置做修改'" v-intro-step="1">
      <el-table v-if="alarmConfig.length > 0" :data="alarmConfig" style="width: 100%;" size="small">
        <el-table-column label="类型" prop="name">
          <template slot-scope="scope">
            <div class="error">
              <zx-icon style="font-size: 1.1rem" :type="computeAlarmIcon(scope.row.code)"></zx-icon>
              <span> {{ scope.row.name}}</span>
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="描述" prop="format"></el-table-column> -->
        <el-table-column label="描述" prop="message"></el-table-column>
        <el-table-column label="自动处理">
          <template slot-scope="scope">
            <div>{{scope.row.autoDispose === true ? '是' : '否'}}</div>
          </template>
        </el-table-column>
        <el-table-column label="是否启用">
          <template slot-scope="scope">
            <div>{{scope.row.enabled === true ? '是' : '否'}}</div>
          </template>
        </el-table-column>
        <el-table-column label="是否重复触发">
          <template slot-scope="scope">
            <div>{{scope.row.repeatFlag === true ? '可重复触发' : '仅触发一次'}}</div>
          </template>
        </el-table-column>
        <el-table-column label="阈值">
          <template slot-scope="scope">
            <div>{{formatThreshold(scope.row) || '--'}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" round @click="editAlarmConfig(scope.row)" >修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- {{alarmConfig}} -->
    <Modal ref="modal" v-if="showModal" @quit="quit" @ok="handleOk">
      <h3>修改告警配置</h3>
      <div class="config-alarm">
        <div>告警类型: <zx-icon style="font-size: 1.1rem" class="error" :type="computeAlarmIcon(content.code)"></zx-icon> <span class="error">{{ content.name}}</span></div>
        <div>告警信息: {{content.message}}</div>
        <div  v-if="content.thresholdOne">
          <label>告警阈值: </label>
          <el-input size="small" style="width: 200px" v-if="content.code == 1" placeholder="请输入要修改的阈值" v-model="threshold">
            <template slot="append">{{computedAppend(content.code)}}</template>
          </el-input>
          <el-input size="small" style="width: 200px" v-if="content.code == 2" placeholder="请输入要修改的阈值" v-model="overTime">
            <template slot="append">{{computedAppend(content.code)}}</template>
          </el-input>
        </div>
        <div>
          <label>是否启用: </label>
          <el-switch v-model="content.enabled"></el-switch>
        </div>
        <div>
          <label>是否重复: </label>
          <el-switch v-model="content.repeatFlag"></el-switch>
        </div>
      </div>
      <!-- <div class="test">{{content}}</div> -->
    </Modal>
  </div>
</template>
<script>
import {
  mapState,
  mapActions
} from 'vuex'
import {
  editAlarm
} from '../../api/alarm'
import {
  introOption
} from '../../config/config'
import {
  computeAlarmIcon,
} from '../../utils/utils'
import Modal from '@/components/Modal'
export default {
  components: {
    // Modal: () => import('../../components/Modal')
    Modal
  },
  data () {
    return {
      showModal: false,
      content: '',
      threshold: '',
      overTime: '',
      skipIntro: false,
    }
  },
  computed: {
    ...mapState(['alarmConfig'])
  },
  methods: {
    ...mapActions(['queryStatus']),
    computeAlarmIcon,
    guide () {
      // console.log(this)
      this.$intro().setOptions(introOption).start().oncomplete(() => {
        localStorage.setItem('alarmConfigIntro', true)
      }).onexit(() => {
        localStorage.setItem('alarmConfigIntro', true)
      })
    },
    formatThreshold (row) {
      // console.log(row)
      let { code, thresholdOne } = row
      if (code === 1) { // 低电告警
        return thresholdOne + '%'
      } else if (code === 2) { // 超时告警
        // console.log(thresholdOne)
        return this.$moment.duration(thresholdOne).asHours() + '小时'
      } else {
        return ''
      }
    },
    computedAppend (code) {
      let appendVal = ''
      switch (code) {
        case 1:
          appendVal = '%'
          break
        case 2:
          appendVal = '小时'
          break
        default:
          appendVal = ''
          break
      }
      return appendVal
    },
    editAlarmConfig (config) {
      // console.log(config)
      this.content = config
      this.threshold = config.thresholdOne
      switch (config.code) {
        case 1:
          this.threshold = config.thresholdOne
          break
        case 2:
          this.overTime = this.$moment.duration(config.thresholdOne).asHours()
          break
        default:
          break
      }
      this.showModal = true
    },
    quit () {
      this.content = ''
      this.thresholdOne = ''
      this.overTime = ''
      this.showModal = false
    },
    handleOk () {
      // console.log('do ok')
      let valid = false
      switch (this.content.code) {
        case 1:
          if (this.threshold > 0 && this.threshold <= 50) {
            valid = true
          } else {
            this.$message.error('电量阈值需在0-50之间')
            this.$refs['modal'].isLoading = false
          }
          break
        case 2:
          if (this.overTime >= 1 && this.overTime <= 24) {
            valid = true
          } else {
            this.$message.error('超时告警阈值需在1-24之间')
            this.$refs['modal'].isLoading = false
          }
          break
        default:
          valid = true
          break
      }
      if (valid) {
        // if (this)
        let param = {
          id: this.content.id,
          thresholdOne: this.content.code === 2 ? this.overTime * 60 * 60 * 1000 : this.threshold,
          repeatFlag: this.content.repeatFlag,
          enabled: this.content.enabled,
        }
        editAlarm(param).then((res) => {
          // console.log(res)
          let { code, desc } = res
          if (code === 0) {
            this.$notify.success({
              message: desc
            })
            this.queryStatus()
            this.quit()
          } else {
            this.$notify.error({
              message: desc
            })
            this.$refs['modal'].isLoading = false
          }
        })
      }
    },
  },
  created () {
    this.skipIntro = localStorage.getItem('alarmConfigIntro') || false
  },
  mounted () {
    setTimeout(() => {
      !this.skipIntro && this.guide()
    }, 1000)
  }
}
</script>
<style lang="less" scoped>
.page {
  .block {
    margin-top: 20px;
  }
  .config-alarm {
    text-align: left;
    div {
      padding: 8px 0;
    }
  }
}
</style>
