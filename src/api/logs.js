import request from './axios'

export const getLogs = (param) => {
  return request.post('/api/systemLog/v1.0/query', param)
}
