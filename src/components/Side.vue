<template>
  <div class="nav">
    <div class="user">
      <!-- <img :src="imageUrl" class="avatar-menu" alt="avatar"> -->
      <img src="../assets/img/logo.png" class="avatar-menu" alt="avatar">
      <div>{{nickname}}</div>
      <!-- <div>{{roles}}</div> -->
      <!-- <el-button class="logout" type="primary" round size="small" @click="logout">退出登录</el-button> -->
      <div class="logout" @click="logout">退出登录</div>
    </div>
    <div class="menu">
      <template v-for="(menu, index) in renderRoutes">
        <router-link v-show="menu.meta && menu.meta.auth" class="menu-item" :to="menu.path" :key="index" >
          <zx-icon :type="menu.meta.icon" />
          {{menu.name}}
        </router-link>
      </template>
    </div>
    <div class="user-guide">
      <div>
        <a class="a-link" href="/web-doc.html" target="_blank">WEB操作手册</a>
      </div>
      <div>
        <a class="a-link" href="/app-doc.html" target="_blank">PDA操作手册</a>
      </div>
      <!-- <div>PDA操作手册</div> -->
      <div @click="resetGuide">系统操作指引</div>
    </div>
  </div>
</template>
<script>
import {
  mapState,
  mapActions
} from 'vuex'
import {
  introPages,
} from '../config/config'
export default {
  data () {
    return {
      renderRoutes: []
    }
  },
  computed: {
    ...mapState(['addRoutes', 'hasAdded', 'roles', 'nickname', 'imageUrl'])
  },
  methods: {
    ...mapActions(['addExtraRoute']),
    resetGuide () {
      introPages.forEach((page) => {
        localStorage.removeItem(page)
      })
      window.location.reload()
    },
    logout () {
      this.$router.push('/login')
    },
    selectMenu (index, path) {
      console.log(index)
      console.log(path)
    }
  },
  created () {
    console.log(this.$router.options.routes)
    let index = this.$router.options.routes.findIndex((route) => route.path === '/')
    let renderConstantRoutes = this.$router.options.routes[index].children
    // if (!this.hasAdded) {
    //   this.addExtraRoute(localStorage.getItem('roles'))
    // }
    this.renderRoutes = renderConstantRoutes.filter((route) => {
      return route.meta.role.includes(this.roles)
    })
  },
  mounted () {
    // ..
    // console.log(this.$router)
  }
}
</script>
<style lang="less" scoped>
@import '../assets/less/main.less';
.router-link-active {
  color: @danger !important;
  background: @page-background;
}
.nav {
  height: 100vh;
  display: flex;
  flex-direction: column;
  // justify-content: center;
  align-items: center;
  .user {
    width: 100%;
    padding: 10px;
    margin: 100px 0 20px 0;
    // border-bottom: 1px solid #fff;
    .avatar-menu {
      width: 80px;
      border-radius: 50%;
      // border: 1px solid @primary-color;
      margin-bottom: 8px;
    }
    .logout {
      margin-top: 10px;
      color: #316c8e;
      cursor: pointer;
    }
  }
  .menu {
    width: 100%;
    display: flex;
    flex-direction: column;
    .menu-item {
      font-size: .95rem;
      display: block;
      text-decoration: none;
      color: @sub-font-color;
      padding: 15px 0;
      // text-align: left;
      &:hover {
        background: @page-background;
        color: @font-color;
      }
    }
  }
  .user-guide {
    width: 100%;
    margin-top: 50px;
    text-decoration: none;
    color: #999;
    border-top: 1px solid #666;
    div {
      padding: 10px 0;
      cursor: pointer;
      &:hover {
        color: @sub-font-color;
      }
      .a-link {
        text-decoration: none;
        color: #999;
        &:hover {
          color: @sub-font-color;
        }
      }
    }
  }
}
</style>
