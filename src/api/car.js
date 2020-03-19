import request from './axios'

export const queryCars = (param) => {
  return request.post('/api/vehicle/v1.0/query', param)
}

export const queryUWB = (param) => {
  return request.post('/api/locator/v1.0/query', param)
}
