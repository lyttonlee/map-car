<template>
  <el-dialog
    :visible="visible"
    :destroy-on-close="true"
    width="50%"
    :show-close="false"
  >
    <h3>您是PC管理员！请选择产线</h3>
    <div class="lines">
      <template v-for="(item) in 4">
        <div class="line" @click="goLine(item)" :key="item">{{`广本${item}线`}}</div>
      </template>
    </div>
  </el-dialog>
</template>
<script>
export default {
  data () {
    return {
      visible: false
    }
  },
  methods: {
    login () {
      this.visible = true
    },
    goLine (i) {
      this.$notify({
        title: '成功',
        message: `您选择了广本${i}线进行登录`,
        type: 'success'
      })
      console.log(this.$route)
      this.$route.path === '/login' && this.$router.push('/')
      this.visible = false
    }
  }
}
</script>
<style lang="less" scoped>
.lines {
  display: grid;
  grid-template-columns: 1fr 1fr;
  .line {
    padding: 20px;
    margin:  10px;
    background: rgb(151, 147, 147);
    cursor: pointer;
  }
}
</style>
