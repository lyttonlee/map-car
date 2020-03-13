import axios from 'axios'
import { Notification } from 'element-ui'
import router from '../router'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/',
  timeout: 10000
})

const err = (error) => {
  console.log(error)
  if (error.response && error.response.status === 401) {
    const isLoginPage = () => router.history.current.path === '/login'
    if (!isLoginPage) {
      Notification.error({
        message: '鉴权失败,请重新登录!'
      })
      router.push('/login')
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
