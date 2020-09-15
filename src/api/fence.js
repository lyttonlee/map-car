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

// 生成车位
export const createCarPort = (param) => {
  return request.post('/api/superAdmin/v1.0/new/parks', param, {
    responseType: 'blob'
  })
}

// 获取上传车位文件的地址
export const getUploadUrl = () => {
  return request.get('/api/superAdmin/v1.0/post/url/parks')
}

// 上传车位文件
export const uploadParksFile = (param) => {
  return request.post('/api/superAdmin/v1.0/excel/parks', param, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除停车位
export const deleteParks = (param) => {
  return request.post('/api/superAdmin/v1.0/dele/parks', param)
}

// 创建地图分块
export const createSmallMap = (param) => {
  return request.post('/api/superAdmin/v1.0/new/mapPartition', param)
}

// 删除地图块
export const deleteSmallMap = (params) => {
  return request.delete('/api/superAdmin/v1.0/delete/mapPartition', { params })
}

// 添加vq车场地图区域块
// param: {
//   points: string[],
//   type: string,  => 'AF WE PA PQ'
// }

// 删除vq车场地图区域块
// params: {
//   id: number
// }

// 。。
// 请求转发

export const transRequest = (param, url) => {
  return request.post('/common/v1.0/transfer', {
    param,
    url
  })
}

export const getParksByType = (params) => {
  return request.get('/api/map/v1.0/zone/specifiy', { params })
}
