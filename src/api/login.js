import request from './axios'

export const login = (user) => {
  return request.post('/auth/v1.0/login', user)
}
