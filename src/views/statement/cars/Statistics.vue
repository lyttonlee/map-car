<template>
  <div class="page">
    <!-- <h2>statistics</h2> -->
    <div class="action">
      <el-date-picker
        v-model="dates"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期">
      </el-date-picker>
      <el-checkbox-group v-model="dates2">
        <template v-for="(item) in times">
          <el-checkbox-button :key="item.date" >{{item.name}}</el-checkbox-button>
        </template>
      </el-checkbox-group>
      <el-button>导出</el-button>
    </div>
    <div class="body">2</div>
    <div class="chart">3</div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      dates: '',
      dates2: '',
      times: [
        {
          name: '7天',
          date: 7
        },
        {
          name: '半个天',
          date: 14
        }
      ]
    }
  }
}
</script>
<style lang="less" scoped>
.page {
  .action {
    height: 15vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .body {
    height: 50vh;
  }
  .chart {
    height: 35vh;
  }
}
</style>
