// import {
//   isInPolygon
// } from './utils'

// import store from '../store'
// import {
//   getBindList
// } from '../api/vq'

export const tansMapValToArray = (map = new Map()) => {
  const arr = []
  // console.log(map.values())
  map.forEach((val) => {
    arr.push(val)
  })
  return arr
}

export const createBindCarMap = (bindCars = []) => {
  const map = new Map()
  bindCars.forEach((car) => {
    map.set(car.locator.id, car)
  })
  return map
}

export const updateCarInfo = (cars = [], newPos) => {
  if (cars.length <= 0) return null
  const curCarInfo = cars.find((car) => car.locator.id === locatorId)
  if (curCarInfo.locator.x === newPos.x && curCarInfo.locator.y === newPos.y) return
  curCarInfo.locator.x = newPos.x
  curCarInfo.locator.y = newPos.y
}

export const updateMarker = (currentMarker, newPos) => {
  // 。。
}

export const updateUnbindMarker = () => {
  // ..
}

export const deleteExtraUnbindMarker = (noBindMarkers, posList) => {
  noBindMarkers.forEach((item) => {
    if (item && item.locatorId) {
    }
  })
}
