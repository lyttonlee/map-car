import request from './axios'

export const getWorkShopCars = () => {
  return request.get('/api/vehicle/v1.0/office/list')
}
/**
 *
 *
 * @param {*} param {node: string, vehicleId: number}
 * @returns Promise
 */
export const confirmWorkShopCar = (param) => {
  return request.post('/api/vehicle/v1.0/office/confirm', param)
}
/**
 *
 *
 * @param {Object} param {vhicleId: number}
 * @returns Promise
 */
export const finishWorkShopCar = (param) => {
  return request.post('/api/vehicle/v1.0/office/finish', param)
}
