import request from './axios'

export const getRealTimeData = () => {
  return request.get('/api/monitor/v1.0/realTimeData')
}

export const getStatisticData = () => {
  return request.get('/api/monitor/v1.0/statisticData')
}

export const getBindList = () => {
  return request.get('/api/monitor/v1.0/bindList')
}

export const getAlarmList = () => {
  return request.get('/api/alarm/v1.0/alarms')
}

export const getAlalrmTypes = () => {
  return request.get('/api/alarm/v1.0/types')
}
