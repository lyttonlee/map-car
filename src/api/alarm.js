import request from './axios'

export const queryAlarm = (param) => {
  return request.post('/api/alarm/v1.0/alarms', param)
}

export const queryAlarmConfig = () => {
  return request.get('/api/alarm/v1.0/alarmConfigs')
}
