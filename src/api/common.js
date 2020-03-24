import request from './axios'

export const queryCarStatus = () => {
  return request.get('/common/v1.0/vehicleStatus')
}

export const queryLocatorStatus = () => {
  return request.get('/common/v1.0/locatorStatus')
}

export const transXYToAddress = (param) => {
  return request.post('/api/map/v1.0/address/analysis', param)
}

export const queryLocatorAddress = (params) => {
  return request.get('/api/map/v1.0/address/locator/analysis', { params })
}

export const uploadImage = (param) => {
  return request.post('/common/v1.0/file/upload', param, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
