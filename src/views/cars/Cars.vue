<template>
  <div class="page">
    <div class="search">
      <el-input placeholder="搜索筛选框"></el-input>
    </div>
    <el-table :data="cars" style="width: 100%;background:#fff0" size="mini">
      <el-table-column label="类型" prop="name"></el-table-column>
      <el-table-column label="问题" prop="problem"></el-table-column>
      <el-table-column label="状态" prop="statu"></el-table-column>
      <el-table-column label="入荷时间" prop="time"></el-table-column>
      <el-table-column label="出荷时间" prop="over"></el-table-column>
      <el-table-column label="操作">
        <template>
          <el-button size="small" type="danger">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  data () {
    return {
      cars: [
        { name: '本田-xx', statu: '未出荷', time: '2020-2-5 12：90', over: '', problem: 'xxx损坏' },
        { name: '本田-xx', statu: '未出荷', time: '2020-2-7 12：90', over: '', problem: 'xxx损坏' },
        { name: '本田-xx', statu: '未出荷', time: '2020-2-5 11：90', over: '', problem: 'xxx损坏' },
        { name: '本田-xx', statu: '已出荷', time: '2020-2-5 2：00', over: '2020-2-7 12：90', problem: 'xxx损坏' },
        { name: '本田-xx', statu: '已出荷', time: '2020-2-8 12：90', over: '2020-2-7 12：90', problem: 'xxx损坏' },
        { name: '本田-xx', statu: '已出荷', time: '2020-2-12 12：90', over: '2020-2-7 12：90', problem: 'xxx损坏' },
        { name: '本田-xx', statu: '已出荷', time: '2020-2-17 12：90', over: '2020-2-7 12：90', problem: 'xxx损坏' }
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
