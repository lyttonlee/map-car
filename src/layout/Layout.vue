<template>
  <div id="app">
    <!-- <TestVoice /> -->
    <!-- <div class="select" @click="showSelect">
      选择产线(仅为PC时显示)
    </div> -->
    <ToggleMenu @toggleMenu="toggleMenu" />
    <!-- <SelectLine ref="selectLine" /> -->
    <el-container>
      <!-- <transition
        mode="out-in"
        enter-active-class="animated fadeInLeft"
        leave-active-class="animated fadeOutLeft"
      > -->
        <el-aside v-if="show">
          <Side />
        </el-aside>
      <!-- </transition> -->
      <el-main>
        <transition
          mode="out-in"
          enter-active-class="animated bounceInLeft"
          leave-active-class="animated bounceOutRight"
        >
          <router-view/>
        </transition>
      </el-main>
    </el-container>
  </div>
</template>

<script>
// import TestVoice from '@/components/TestVoice'
import Side from '@/components/Side'
import ToggleMenu from '@/components/ToggleMenu'
// import SelectLine from './components/SelectLine'
import bus from '@/bus/bus'
import {
  mapActions
} from 'vuex'
export default {
  data () {
    return {
      show: true
    }
  },
  sockets: {
    login (data) {
      let loginedUser = JSON.parse(data)
      console.log(loginedUser)
      this.$notify.success({
        dangerouslyUseHTMLString: true,
        message: `<div>${loginedUser.content.nickname}</div><div>登录平台: ${loginedUser.content.platform}</div>`,
        title: '用户登录'
      })
    }
  },
  components: {
    // TestVoice,
    Side,
    ToggleMenu,
    // SelectLine
  },
  methods: {
    toggleMenu (isShow) {
      console.log(isShow)
      this.show = isShow
      bus.$emit('menuSizeChanged', isShow)
    },
    showSelect () {
      console.log('show')
      this.$refs['selectLine'].visible = true
    },
    ...mapActions(['queryStatus']),
    getAllStatus () {
      this.queryStatus()
    }
  },
  created () {
    this.getAllStatus()
  },
  mounted () {
    // ..
  }
}
</script>

<style lang="less">
@import '../assets/less/main.less';
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: @sub-font-color;
  font-size: 14px;
  // overflow: hidden;
  // background: #eee;
  .select {
    position: fixed;
    right: 30px;
    bottom: 60px;
    width: 100px;
    height: 60px;
    background: rgba(12, 10, 10, 0.719);
    cursor: pointer;
    z-index: 1100;
  }
  .el-container {
    width: 100vw;
    height: 100vh;
    // background: @page-background;
    .liner-gradient;
    overflow: hidden;
    .el-aside {
      width: 200px !important;
      height: 100vh;
      background: @base-background;
      overflow: hidden;
      // box-shadow: 1px 0 5px rgb(121, 121, 121);
    }
    .el-main {
      width: 100%;
      height: 100vh;
      // background: @page-background;
      padding: 0 !important;
      box-sizing: border-box;
      overflow: hidden;
    }
  }
}
</style>
