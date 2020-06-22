<template>
  <div class="page">
    <Menu :menus="renderRoutes" />
    <!-- <router-view /> -->
    <MenuView />
  </div>
</template>
<script>
import {
  mapState
} from 'vuex'
export default {
  components: {
    Menu: () => import('@/components/menu/Menu'),
    MenuView: () => import('@/components/menu/View')
  },
  data () {
    return {
      renderRoutes: []
    }
  },
  computed: {
    ...mapState(['roles'])
  },
  methods: {
    getRenderRoutes () {
      console.log(this.$router)
      let routes = this.$router.options.routes.find((route) => route.path === '/').children
      let alarmRoutes = routes.find((route) => route.path === '/statement')
      this.renderRoutes = alarmRoutes.children.filter((route) => route.meta.role.includes(this.roles))
      console.log(this.renderRoutes)
    }
  },
  created () {
    this.getRenderRoutes()
  }
}
</script>
