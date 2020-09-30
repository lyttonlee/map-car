import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'normalize.css'
import 'animate.css'
import ElementUi from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
// 字体图标
import './assets/css/font.css'
// 覆盖element-ui 默认样式
import './assets/css/fix-element.css'
import './assets/css/index.css'
// 图标组件
import Icon from '@/components/Icon'

// socket.io
import VueSocketIo from 'vue-socket.io'

// intro.js
import VueIntro from 'vue-introjs'
import 'intro.js/introjs.css'

// moment
import moment from 'moment'
moment.locale('zh-cn')

const hostname = window.location.hostname
// console.log(hostname)
const socketUrl = process.env.NODE_ENV === 'development' ? `http://192.168.1.50:9099` : `http://${hostname}:9099`

Vue.use(VueIntro)
Vue.prototype.$moment = moment
Vue.use(new VueSocketIo({
  debug: false,
  // connection: 'http://192.168.1.205:9099'
  connection: socketUrl
}))

router.beforeEach((to, from, next) => {
  const token = store.state.token || localStorage.getItem('token')
  const roles = store.state.roles || localStorage.getItem('roles')
  // const hasAddRoute = store.state.hasAdded
  // if (!hasAddRoute && token) {
  //   // 添加路由
  //   // 此情况用于刷新页面
  //   // router.addRoutes(store.state.addRoutes)
  //   console.log('refresh?')
  //   store.dispatch('addExtraRoute', localStorage.getItem('roles'))
  // }
  // 要去的页面需要登录权限
  let canVisit = (roles) => {
    // console.log(to)
    return to.meta.role.includes(roles)
  }
  // console.log(to)
  if (to.meta.auth) {
    // 再判断是否是登录状态
    if (token) {
      // console.log(canVisit(roles))
      if (!canVisit(roles)) { // 去的是没有访问权限的页面
        next({
          path: '/unauth'
        })
      } else {
        next()
      }
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
// console.log(window.location)
// console.log(process.env.NODE_ENV)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
