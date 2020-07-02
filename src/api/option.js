import request from './axios'

export const getSystemOption = () => {
  return request.get('/api/systemParam/v1.0/query')
}

export const updateConfirmTime = (time) => {
  return request.post('/api/systemParam/v1.0/update/systemparam', time)
}
