import request from './axios'

export const createUser = (user) => {
  return request.post('/api/users/v1.0/new', user)
}

export const queryUsers = () => {
  return request.get('/api/users/v1.0/query')
}

export const deleteUser = (id) => {
  return request.delete(`/api/users/v1.0/delete/${id}`)
}

export const getAllRoles = () => {
  return request.get('/common/v1.0/roles')
}

export const getUserStatus = () => {
  return request.get('/common/v1.0/userStatus')
}
