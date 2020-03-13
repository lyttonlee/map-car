<template>
  <div class="page">
    <div class="search">
      <el-input placeholder="搜索筛选框"></el-input>
    </div>
    <el-table :data="alarms" style="width: 100%;background:#fff0" size="mini">
      <el-table-column label="类型" prop="name"></el-table-column>
      <el-table-column label="状态" prop="statu"></el-table-column>
      <el-table-column label="时间" prop="time"></el-table-column>
      <el-table-column label="操作">
        <template>
          <el-button size="small" type="danger">处理告警</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  data () {
    return {
      alarms: [
        { name: '滞留告警', statu: '未处理', time: '2020-2-5 12：90', },
        { name: '超出界限告警', statu: '未处理', time: '2020-2-7 12：90', },
        { name: '滞留告警', statu: '已处理', time: '2020-2-5 11：90', },
        { name: '滞留告警', statu: '未处理', time: '2020-2-5 2：00', },
        { name: '超时告警', statu: '未处理', time: '2020-2-8 12：90', },
        { name: '滞留告警', statu: '未处理', time: '2020-2-12 12：90', },
        { name: '滞留告警', statu: '未处理', time: '2020-2-17 12：90', }
      ]
    }
  }
}
</script>
<style lang="less" scoped>
.page {
  .search {
    margin: 15px 0;
  }
}
</style>
