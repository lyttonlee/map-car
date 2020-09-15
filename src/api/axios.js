import axios from 'axios'
import { Notification } from 'element-ui'
import router from '../router'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/',
  timeout: 30000
})

const err = (error) => {
  // console.log(error.message)
  // console.log(error.response)
  if (error.response && error.response.status === 401) {
    const isLoginPage = () => router.history.current.path === '/login'
    // console.log(401)
    if (!isLoginPage()) {
      Notification.error({
        message: '鉴权失败,请重新登录!',
      })
      router.push('/login')
    }
  } else {
    if (error.message && error.message.includes('timeout')) {
      Notification.error({
        message: '网络连接超时，请检查您的网络!'
      })
    } else {
      Notification.error({
        message: '服务器异常，请联系管理员！'
      })
    }
  }
  return Promise.reject(error)
}
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  config.headers['Content-Type'] = 'application/json;charset=UTF-8'
  if (token) {
    config.headers[ 'Authorization' ] = token // 让每个请求携带自定义 token
  }
  return config
}, err)

request.interceptors.response.use((response) => {
  return response.data
}, err)

export default request
