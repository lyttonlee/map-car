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
