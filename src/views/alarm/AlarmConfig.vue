<template>
  <div class="page">
    <div class="block"></div>
    <el-table v-if="alarmConfig.length > 0" :data="alarmConfig" style="width: 100%;" size="small">
      <el-table-column label="类型" prop="name"></el-table-column>
      <!-- <el-table-column label="描述" prop="format"></el-table-column> -->
      <el-table-column label="描述" prop="message"></el-table-column>
      <el-table-column label="自动处理">
        <template slot-scope="scope">
          <div>{{scope.row.autoDispose === true ? '是' : '否'}}</div>
        </template>
      </el-table-column>
      <el-table-column label="阈值">
        <template slot-scope="scope">
          <div>{{formatThreshold(scope.row)}}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" round :disabled="!scope.row.thresholdOne" @click="editAlarmConfig(scope.row)" >修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- {{alarmConfig}} -->
    <Modal v-if="showModal" @quit="quit">
      <div class="test">aasdasdas</div>
    </Modal>
  </div>
</template>
<script>
import {
  mapState
} from 'vuex'
export default {
  components: {
    Modal: () => import('../../components/Modal')
  },
  data () {
    return {
      showModal: false,
      content: ''
    }
  },
  computed: {
    ...mapState(['alarmConfig'])
  },
  methods: {
    formatThreshold (row) {
      console.log(row)
      let { code, thresholdOne } = row
      if (code === 1) { // 低电告警
        return thresholdOne + '%'
      } else if (code === 2) { // 超时告警
        return this.$moment.duration(thresholdOne).asHours() + '小时'
      } else {
        return ''
      }
    },
    editAlarmConfig (config) {
      console.log(config)
      this.content = config
      this.showModal = true
    },
    quit () {
      this.content = ''
      this.showModal = false
    }
  }
}
</script>
<style lang="less" scoped>
.page {
  .block {
    margin-top: 20px;
  }
}
</style>
