import request from './axios'

export const getTimesDuration = () => {
  return request.get('/api/statistic/v1.0/statistic/startTime')
}

export const getStatistic = (params) => {
  return request.get('/api/statistic/v1.0/statistic/report', { params })
}

export const downLoadReport = (params) => {
  return request.get('/api/statistic/v1.0/statistic/excel', { params, responseType: 'blob' })
}
