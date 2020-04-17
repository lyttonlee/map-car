import moment from 'moment'
import store from '../store'

export const timeToNow = (time) => {
  return moment(time).toNow(true)
}

export const computedCarNode = (node) => {
  let carNodes = store.state.carNodes
  let curNode = carNodes.find((item) => item.code === node)
  return curNode ? curNode.name : '未知环节'
}

export const computeAlarmIcon = (code) => {
  // console.log(code)
  let icon
  switch (code) {
    case 5:
      icon = 'zx-jizhangaojing'
      break
    case 1:
      icon = 'zx-didianlianggaojing'
      break
    case 2:
      icon = 'zx-chaoshigaojing1'
      break
    case 3:
      icon = 'zx-tuolijianguan'
      break
    default:
      icon = 'zx-alarm'
      break
  }
  return icon
}

export const computePowerIcon = (power) => {
  let icon
  if (power >= 95) {
    icon = 'zx-5'
  } else if (power > 80) {
    icon = 'zx-4'
  } else if (power > 60) {
    icon = 'zx-3'
  } else if (power > 40) {
    icon = 'zx-2'
  } else {
    icon = 'zx-1'
  }
  return icon
}

// 经纬度转墨卡托投影坐标
// 经纬度转墨卡托投影坐标
export const lnglatTomercator = (lng, lat) => {
  let mercator = { x: 0, y: 0 }
  let x = lng * 20037508.34 / 180
  let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180)
  y = y * 20037508.34 / 180
  mercator.x = x
  mercator.y = y
  return mercator
}

// 墨卡托转经纬度坐标
export const mercatorTolnglat = (mercator = { x: 0, y: 0 }) => {
  let lng = mercator.x / 20037508.34 * 180
  let lat = mercator.y / 20037508.34 * 180
  lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2)
  return {
    lng,
    lat
  }
}
