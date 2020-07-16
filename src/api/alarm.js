import request from './axios'

export const queryAlarm = (param) => {
  return request.post('/api/alarm/v1.0/alarms', param)
}

export const queryAlarmConfig = (params) => {
  return request.get('/api/alarm/v1.0/alarmConfigs', { params })
}

export const disposeAlarm = (param) => {
  return request.post('/api/alarm/v1.0/alarm/dispose', param)
}

export const editAlarm = (param) => {
  return request.post('/api/alarm/v1.0/alarmConfigs', param)
}

export const getShownAlarmType = () => {
  return request.get('/api/alarm/v1.0/alarmType/vehicle')
}
