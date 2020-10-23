import request from './axios'

export const getDimCars = (param) => {
  return request.post('/mobile/vehicle/v1.0/cadidate/identification', null, {
    params: param
  })
}

export const bindCar = (params) => {
  return request.get('/mobile/vehicle/v1.0/bind', { params })
}

export const unbindCar = (params) => {
  return request.get('/mobile/vehicle/v1.0/unbind', { params })
}
