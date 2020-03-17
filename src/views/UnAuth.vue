<template>
  <div class="no-auth">
    <h1>很抱歉您没有权利访问该页面！</h1>
    <div @click="goBack">返回浏览!</div>
  </div>
</template>
<script>
export default {
  methods: {
    goBack () {
      this.$router.go(-1)
    }
  }
}
</script>
<style lang="less" scoped>
.no-auth {
  width: 100%;
  height: 100vh;
}
</style>
