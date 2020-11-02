// import {
//   getBindSpeCars
// } from '../api/special'
import successCar from '../assets/img/car-blue.png'
import errorCar from '../assets/img/car-red.png'
import warnCar from '../assets/img/car-yellow.png'
import offlineCar from '../assets/img/car-offline.png'
import {
  initCarSize
} from '../config/config'
import store from '../store'
const pointScale = store.state.pointScale

const getvmPos = (index = 0) => {
  return [26.68 / pointScale, (87.77 + index * 4) / pointScale]
}

const vmLinePoints = [
  [16 / pointScale, 83.77 / pointScale],
  [37 / pointScale, 83.77 / pointScale]
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

export const createCar = (car, carScale) => {
  const carPos = [car.locator.y / pointScale, car.locator.x / pointScale]
  let icon = createPointMarker('normal', carScale)
  const marker = L.Marker.movingMarker([carPos], [], {
    rotate: true,
    icon,
    initialRotationAngle: 0,
  })
  return marker
}

export const updatePosition = (marker, car) => {
  const target = [car.locator.y / pointScale, car.locator.x / pointScale]
  marker.moveTo(target, 500)
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
