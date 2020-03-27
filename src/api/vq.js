import request from './axios'

export const getRealTimeData = () => {
  return request.get('/api/monitor/v1.0/realTimeData')
}

export const getStatisticData = () => {
  return request.get('/api/monitor/v1.0/statisticData')
}

export const getBindList = (params) => {
  return request.get('/api/monitor/v1.0/bindList', { params })
}

export const getAlarmList = () => {
  return request.post('/api/alarm/v1.0/alarms', {})
}

export const getAlalrmTypes = () => {
  return request.get('/api/alarm/v1.0/types')
}

export const queryCars = (param) => {
  return request.post('/api/vehicle/v1.0/query', param)
}

// 获取库存信息
export const queryStore = () => {
  return request.get('/api/monitor/v1.0/statistic/store')
}

// 获取效率信息
export const queryEfficiency = () => {
  return request.get('/api/monitor/v1.0/statistic/efficiency')
}

// 获取重要信息
export const querySummary = () => {
  return request.get('/api/monitor/v1.0/important/summary')
}
