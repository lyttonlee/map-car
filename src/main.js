import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'normalize.css'
import 'animate.css'
import ElementUi from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 字体图标
import './assets/css/font.css'
// 图标组件
import Icon from '@/components/Icon'

// socket.io
import VueSocketIo from 'vue-socket.io'

Vue.use(new VueSocketIo({
  debug: false,
  connection: 'http://192.168.1.205:9099'
}))

router.beforeEach((to, from, next) => {
  const token = store.state.token || localStorage.getItem('token')
  // const hasAddRoute = store.state.hasAdded
  // if (!hasAddRoute && token) {
  //   // 添加路由
  //   // 此情况用于刷新页面
  //   // router.addRoutes(store.state.addRoutes)
  //   console.log('refresh?')
  //   store.dispatch('addExtraRoute', localStorage.getItem('roles'))
  // }
  // 要去的页面需要登录权限
  if (to.meta.auth) {
    // 再判断是否是登录状态
    if (token) {
      next()
    } else {
      next({
        path: '/login'
      })
    }
  } else if (to.path === '/login') { // 要去登录页面
    // 先完成登出操作
    store.dispatch('logout').then(() => {
      next()
    })
  } else {
    next()
  }
})

Vue.config.productionTip = false
Vue.use(ElementUi)
Vue.component('zx-icon', Icon)
console.log(window.location)
console.log(process.env.NODE_ENV)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
