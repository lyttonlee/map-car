// import {
//   getBindSpeCars
// } from '../api/special'
import successCar from '../assets/img/car-blue.png'
import errorCar from '../assets/img/car-red.png'
import warnCar from '../assets/img/car-yellow.png'
import offlineCar from '../assets/img/car-offline.png'
import speCar from '../assets/img/car-spe.png'
import {
  initCarSize
} from '../config/config'
import store from '../store'
const pointScale = store.state.pointScale

const getvmPos = (index = 0) => {
  return [29 / pointScale, (95 + index * 4) / pointScale]
}

const vmLinePoints = [
  [26 / pointScale, 92 / pointScale],
  [32 / pointScale, 92 / pointScale]
]

const createPointMarker = (statu, carScale) => {
  let carImg
  switch (statu) {
    case 'alarm':
      carImg = errorCar
      break
    case 'overtime':
      carImg = warnCar
      break
    case 'normal':
      carImg = successCar
      break
    case 'offline':
      carImg = offlineCar
      break
    case 'spe':
      carImg = speCar
      break
    default:
      carImg = successCar
      break
  }
  const icon = L.icon({
    iconUrl: carImg,
    iconAnchor: [initCarSize[0] * carScale / 2, initCarSize[1] * carScale / 2],
    iconSize: [initCarSize[0] * carScale, initCarSize[1] * carScale]
  })
  return icon
}

export const createCar = (car, carScale, index) => {
  const carPos = [car.locator.y / pointScale, car.locator.x / pointScale]
  let icon = createPointMarker(index === 0 ? 'spe' : car.vehicle.status, carScale)
  const marker = L.Marker.movingMarker([carPos], [], {
    rotate: true,
    icon,
    initialRotationAngle: 0,
  })
  return marker
}

export const updatePosition = (marker, car, index, carScale, isBind = false) => {
  if (index === 0) {
    const speIcon = createPointMarker('spe', carScale)
    marker.setIcon(speIcon)
  }
  const target = [car.locator.y / pointScale, car.locator.x / pointScale]
  marker.moveTo(target, 500)
  marker.setRotation(isBind ? 270 : 90)
}

export const createVMCar = (vin, carScale, index) => {
  // console.log(vin)
  const carPos = getvmPos(index)
  let icon = createPointMarker('offline', carScale)
  const marker = L.Marker.movingMarker([carPos], [], {
    rotate: true,
    icon,
    initialRotationAngle: 0,
  })
  return marker
}

export const createNumTooltip = (index = null) => {
  let styleName = 'tooltip-circle'
  if (index === 0) {
    styleName = 'tooltip-circle-first'
  }
  const content = `<div class="${styleName}">${index + 1}</div>`
  const option = {
    // Anchor: [10, 10],
    // tooltipAnchor: [20, 20],
    offset: [0, 35],
    direction: 'bottom',
    permanent: true,
    // sticky: true,
    className: 'custom-tooltip',
    opacity: 0.8
  }
  return [content, option]
}

export const createTooltip = (vin, power, big = false) => {
  let styleName = 'tooltip-power'
  if (big) {
    styleName = 'tooltip-power big'
  }
  const content = power ? `<div class="${styleName}">VIN: ${vin}</div><div class="${styleName}">电量: ${power}%</div>` : `<div class="${styleName}">VIN: ${vin}</div>`
  const option = {
    // Anchor: [10, 10],
    // tooltipAnchor: [20, 20],
    offset: [0, 0],
    direction: 'center',
    permanent: true,
    // sticky: true,
    className: 'custom-tooltip',
    opacity: 0.8
  }
  return [content, option]
}

export const drawLine = () => {
  const line = L.polyline(vmLinePoints, {
    color: '#578'
  })
  return line
}

export const getInitPagePath = (officeName) => {
  if (officeName) {
    let path = ''
    switch (officeName) {
      case 'SPECIAL_bind':
        path = '/spebind'
        break
      case 'SPECIAL_unbind':
        path = '/speunbind'
        break
      default:
        path = '/workshop'
        break
    }
    return path
  } else {
    return '/unauth'
  }
}
