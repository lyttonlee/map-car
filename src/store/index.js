import Vue from 'vue'
import Vuex from 'vuex'
import {
  LOGOUT,
  LOGIN,
  ROLES,
  CARSTATUS,
  LOCATORSTATUS,
  ALARMCONFIG,
  MAPINFO,
  CARNODES,
  CHILDMAPINFO,
} from './types'
import router from '../router'
import {
  initPointScale
} from '../config/config'
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
  getAllRoles
} from '../api/user'
import {
  queryCarStatus,
  queryLocatorStatus,
  getCarNodes
} from '../api/common'
import {
  queryAlarmConfig
} from '../api/alarm'
import {
  queryMap
} from '../api/fence'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: '' || localStorage.getItem('token'),
    username: '' || localStorage.getItem('username'),
    roles: '' || localStorage.getItem('roles'),
    nickname: '' || localStorage.getItem('nickname'),
    imageUrl: '' || localStorage.getItem('imageUrl'),
    roleList: [],
    carStatus: '',
    locatorStatus: '',
    productLineId: 1,
    floorId: 1,
    alarmConfig: '',
    mapInfo: '',
    carScale: 1.5,
    carNodes: '',
    pointScale: initPointScale,
    childMapInfos: [],
  },
  mutations: {
    [LOGOUT]: (state) => {
      localStorage.removeItem('roles')
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('nickname')
      localStorage.removeItem('imageUrl')
      state.token = ''
      state.username = ''
      state.roles = ''
      state.nickname = ''
      state.imageUrl = ''
    },
    [LOGIN]: (state, user) => {
      localStorage.setItem('username', user.username)
      localStorage.setItem('token', user.token)
      localStorage.setItem('roles', user.roles)
      localStorage.setItem('nickname', user.nickname)
      localStorage.setItem('imageUrl', user.imageUrl)
      state.token = user.token
      state.username = user.username
      state.roles = user.roles
      state.nickname = user.nickname
      state.imageUrl = user.imageUrl
    },
    [ROLES]: (state, roles) => {
      state.roleList = roles
    },
    [CARSTATUS]: (state, carStatus) => {
      state.carStatus = carStatus
    },
    [LOCATORSTATUS]: (state, status) => {
      state.locatorStatus = status
    },
    [ALARMCONFIG]: (state, status) => {
      state.alarmConfig = status
    },
    [MAPINFO]: (state, mapInfo) => {
      state.mapInfo = mapInfo
    },
    [CARNODES]: (state, carNodes) => {
      state.carNodes = carNodes
    },
    [CHILDMAPINFO]: (state, childMap) => {
      state.childMapInfos = childMap
    },
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
    },
    // 获取可枚举的初始状态
    queryStatus ({ commit, state }) {
      queryLocatorStatus().then((res) => {
        let { code, result } = res
        if (code === 0) {
          console.log(result)
          commit(LOCATORSTATUS, result)
        }
      })
      queryCarStatus().then((res) => {
        let { code, result } = res
        if (code === 0) {
          console.log(result)
          commit(CARSTATUS, result)
        }
      })
      let params = {
        productLineId: state.productLineId
      }
      queryAlarmConfig(params).then((res) => {
        let { code, result } = res
        if (code === 0) {
          console.log(result)
          commit(ALARMCONFIG, result)
        }
      })
      getCarNodes().then((res) => {
        let { code, result } = res
        if (code === 0) {
          console.log(result)
          commit(CARNODES, result)
        }
      })
    },
    // 获取地图数据
    getMapInfo ({ commit, state }) {
      return new Promise((resolve, reject) => {
        let params = {
          productLineId: state.productLineId
        }
        queryMap(params).then((res) => {
          let { code, result, desc } = res
          if (code === 0) {
            console.log(result)
            let mapInfo = result[0].buildings[0].floors.find((mapInfo) => mapInfo.parentId === null)
            let childMapInfo = result[0].buildings[0].floors.filter((child) => child.parentId === mapInfo.id)
            commit(MAPINFO, mapInfo)
            commit(CHILDMAPINFO, childMapInfo)
            resolve(mapInfo)
          } else {
            let err = new Error(desc)
            reject(err)
          }
        })
      })
    }
  },
  getters: {
    // .
    overtime (state) {
      // console.log(state)
      let time = state.alarmConfig.find((alarm) => alarm.code === 2).thresholdOne
      let hours = time / 1000 / 60 / 60
      return hours.toFixed(2)
    },
    lowPower (state) {
      let value = state.alarmConfig.find((alarm) => alarm.code === 1).thresholdOne
      return value
    },
    alarmValues (state) {
      let alarmConfig = state.alarmConfig.map((config) => {
        return {
          code: config.code,
          name: config.name
        }
      })
      return alarmConfig
    },
  },
  modules: {
  }
})
