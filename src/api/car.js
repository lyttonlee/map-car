import request from './axios'

export const queryUWB = (param) => {
  return request.post('/api/locator/v1.0/query', param)
}

export const shakeUWB = (params) => {
  return request.get('/api/locator/v1.0/shake', { params })
}
