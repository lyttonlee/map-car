<template>
  <div class="page">
    <div class="block"></div>
    <el-table :data="alarmConfig" style="width: 100%;" size="small">
      <el-table-column label="类型" prop="name"></el-table-column>
      <el-table-column label="描述" prop="format"></el-table-column>
      <el-table-column label="通知内容" prop="message"></el-table-column>
      <el-table-column label="自动处理">
        <template slot-scope="scope">
          <div>{{scope.row.autoDispose === true ? '是' : '否'}}</div>
        </template>
      </el-table-column>
      <el-table-column label="阈值" prop="thresholdOne"></el-table-column>
    </el-table>
    <!-- {{alarmConfig}} -->
  </div>
</template>
<script>
import {
  mapState
} from 'vuex'
export default {
  computed: {
    ...mapState(['alarmConfig'])
  }
}
</script>
<style lang="less">
.page {
  .block {
    margin-top: 20px;
  }
}
</style>
