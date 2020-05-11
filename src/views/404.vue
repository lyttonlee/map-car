<template>
  <div class="not-found">
    <h1>404 Not Found</h1>
    <h2>很抱歉您要访问的页面没有找到！</h2>
    <div class="action" @click="goBack">返回浏览!</div>
    <div class="action" @click="goHome">回到主页!</div>
  </div>
</template>
<script>
import {
  mapState
} from 'vuex'
export default {
  computed: {
    ...mapState(['officeName'])
  },
  methods: {
    goBack () {
      this.$router.go(-1)
    },
    goHome () {
      this.officeName ? this.$router.push('/workshop') : this.$router.push('/vq')
    }
  }
}
</script>
<style lang="less" scoped>
.not-found {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .action {
    cursor: pointer;
    color: royalblue;
    &:hover {
      color: rgb(231, 12, 23);
    }
  }
}
</style>
