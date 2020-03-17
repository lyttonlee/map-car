<template>
  <div class="page">
    <div class="search">
      <el-input placeholder="请输入要查询的日志"></el-input>
    </div>
    <el-table :data="logs" style="width: 100%;background:#fff0" size="mini">
      <el-table-column label="人员" prop="name"></el-table-column>
      <el-table-column label="事件内容" prop="event"></el-table-column>
      <el-table-column label="时间" prop="time"></el-table-column>
    </el-table>
    <!-- <div class="test">
      <Roll />
    </div> -->
  </div>
</template>
<script>
// import Roll from '../../components/roll/RollList'
export default {
  components: {
    // Roll
  },
  data () {
    return {
      logs: [
        { name: 'XaL', event: '车辆XXXXX绑定标签 3213123', time: '2020-2-12 15：20' },
        { name: 'XaL', event: '指派车辆XXXXX至XX,XX车间返修', time: '2020-2-12 15：23' },
        { name: 'XaL', event: '确定车辆XXXXX通过复检', time: '2020-2-13 16：00' },
        { name: 'XaL', event: '处理了告警', time: '2020-2-13 17：28' },
      ]
    }
  }
}
</script>
<style lang="less" scoped>
.page {
  .search {
    margin: 20px 0;
  }
  .test {
    margin:  50px 0;
    background: #333;
    height: 200px;
    overflow: hidden;
  }
}
</style>
