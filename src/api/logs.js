import request from './axios'

export const getLogs = (param) => {
  return request.post('/api/systemLog/v1.0/query', param)
}

export const getLogCode = () => {
  return request.get('/common/v1.0/systemLog')
}
