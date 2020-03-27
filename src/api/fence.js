import request from './axios'

export const queryMap = (params) => {
  return request.get('/api/map/v1.0/entire', { params })
}

// 获取基站信息
export const queryBaseStation = (params) => {
  return request.get('/api/map/v1.0/baseStations/query', { params })
}

export const queryFence = (params) => {
  return request.get('/api/map/v1.0/zone', { params })
}

export const createFence = (lineId, param) => {
  return request.post(`/api/map/v1.0/zone/ad/${lineId}`, param)
}

export const deleteFence = (params) => {
  return request.delete('/api/map/v1.0/zone/delete', { params })
}

export const updateFence = (lineId, param) => {
  return request.put(`/api/map/v1.0/zone/update/${lineId}`, param)
}
