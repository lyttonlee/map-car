<template>
  <div class="no-auth">
    <h1>很抱歉您没有权利访问该页面！</h1>
    <div class="action" @click="goBack">返回浏览!</div>
    <div class="action" @click="goLogin">重新登录!</div>
  </div>
</template>
<script>
import {
  mapState,
  mapActions
} from 'vuex'
export default {
  computed: {
    ...mapState(['officeName'])
  },
  methods: {
    ...mapActions(['logout']),
    goBack () {
      this.$router.go(-2)
    },
    goHome () {
      this.officeName ? this.$router.push('/workshop') : this.$router.push('/vq')
    },
    async goLogin () {
      await this.logout()
      this.$router.push('/login')
    }
  }
}
</script>
<style lang="less" scoped>
.no-auth {
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
