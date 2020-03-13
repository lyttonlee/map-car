import Vue from 'vue'
import Vuex from 'vuex'
import {
  LOGOUT,
  LOGIN,
  ADDROUTES,
  ROLES,
} from './types'
import router from '../router'
import {
  // asyncRoutes,
  routes
} from '../router/routes'
import {
  login
} from '../api/login'
import {
  Notification
} from 'element-ui'
import {
  computedAddRoutes
} from '../model/routeModel'
import {
  getAllRoles
} from '../api/user'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: '' || localStorage.getItem('token'),
    username: '' || localStorage.getItem('username'),
    roles: '' || localStorage.getItem('roles'),
    nickname: '' || localStorage.getItem('nickname'),
    addRoutes: [],
    hasAdded: false,
    roleList: []
  },
  mutations: {
    [LOGOUT]: (state) => {
      localStorage.removeItem('roles')
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('nickname')
      state.token = ''
      state.username = ''
      state.roles = ''
      state.nickname = ''
    },
    [LOGIN]: (state, user) => {
      localStorage.setItem('username', user.username)
      localStorage.setItem('token', user.token)
      localStorage.setItem('roles', user.roles)
      localStorage.setItem('nickname', user.nickname)
      state.token = user.token
      state.username = user.username
      state.roles = user.roles
      state.nickname = user.nickname
    },
    [ADDROUTES]: (state, routes) => {
      state.addRoutes = routes
      state.hasAdded = true
    },
    [ROLES]: (state, roles) => {
      state.roleList = roles
    }
  },
  actions: {
    // 获取用户角色枚举
    requestRoles ({ commit }) {
      return new Promise((resolve) => {
        getAllRoles().then((res) => {
          let { code, result } = res
          if (code === 0) {
            console.log(result)
            commit(ROLES, result)
            resolve()
          }
        })
      })
    },
    addExtraRoute ({ commit }, role) {
      let accordRoutes = computedAddRoutes(role)
      accordRoutes.forEach((route) => {
        routes[1].children.push(route)
      })
      router.addRoutes(routes)
      console.log(router)
      commit(ADDROUTES, accordRoutes)
    },
    logout ({ commit }) {
      return new Promise((resolve) => {
        commit(LOGOUT)
        resolve()
      })
    },
    login ({ commit }, payload) {
      return new Promise((resolve, reject) => {
        login(payload).then((res) => {
          console.log(res)
          let { code, result, desc } = res
          if (code === 0) { // 登录成功
            // 判断登录角色需要额外添加的route 路由
            // let roles = result.roles
            // let accordRoutes = computedAddRoutes(roles)
            // console.log(accordRoutes)
            // accordRoutes.forEach((route) => {
            //   routes[1].children.push(route)
            // })
            // router.addRoutes(routes)
            // commit(ADDROUTES, accordRoutes)
            console.log(routes)
            // router.addRoutes(accordRoutes)
            // console.log(router)
            commit(LOGIN, result)
            resolve(result)
            router.push('/vq')
          } else { // 登录失败
            Notification.error({
              message: desc
            })
            reject(desc)
          }
        }).catch((err) => {
          console.log(err)
          const error = '网络波动或服务器超时!请稍后再试'
          reject(error)
        })
      })
    }
  },
  modules: {
  }
})
