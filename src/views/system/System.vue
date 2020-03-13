<template>
  <div class="page">
    <h3>系统管理按登录人员不同，呈现内同不同</h3>
    <h4>vq操作员 只显示自己的操作记录, PC，管理员会显示所有人员操作日志记录， 科室人员应该无此页面</h4>
    <div class="search">
      <el-input placeholder="搜索筛选框"></el-input>
    </div>
    <el-table :data="logs" style="width: 100%;background:#fff0" size="mini">
      <el-table-column label="人员" prop="name"></el-table-column>
      <el-table-column label="事件内容" prop="event"></el-table-column>
      <el-table-column label="时间" prop="time"></el-table-column>
    </el-table>
    <div class="test">
      <Roll />
    </div>
  </div>
</template>
<script>
import Roll from '../../components/roll/RollList'
export default {
  components: {
    Roll
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
