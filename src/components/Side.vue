<template>
  <div class="nav">
    <div class="user">
      <img src="../assets/logo.png" class="avatar" alt="avatar">
      <div>Mack Sire</div>
      <div>VQ manger</div>
    </div>
    <div class="menu">
      <template v-for="(menu, index) in renderRoutes">
        <router-link v-show="menu.meta && menu.meta.auth" class="menu-item" :to="menu.path" :key="index" exact>
          <zx-icon :type="menu.meta.icon" />
          {{menu.name}}
        </router-link>
      </template>
    </div>
  </div>
</template>
<script>
import {
  mapState,
  mapActions
} from 'vuex'
export default {
  data () {
    return {
      renderRoutes: []
    }
  },
  computed: {
    ...mapState(['addRoutes', 'hasAdded', 'roles'])
  },
  methods: {
    ...mapActions(['addExtraRoute']),
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
  color: @primary-color !important;
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
    border-bottom: 1px solid @back-color;
    .avatar {
      width: 80px;
      border-radius: 50%;
      border: 1px solid @page-color;
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
      color: rgb(196, 196, 196);
      padding: 15px 0 15px 35px;
      text-align: left;
      &:hover {
        background: rgba(78, 78, 78, 0.925);
        color: rgb(202, 202, 202);
      }
    }
  }
}
</style>
