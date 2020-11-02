import request from './axios'

// get spe cars

export const getBindSpeCars = () => {
  return request.post('/common/v1.0/bind/vehicleList')
}
