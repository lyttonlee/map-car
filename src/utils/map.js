import store from '../store'
import {
  initPointScale as pointScale,
  initMapZoom,
  fenceStyles
} from '../config/config'
import {
  Notification
} from 'element-ui'
export const initMap = async (opts) => {
  try {
    const mapInfo = await store.dispatch('getMapInfo')
    const centerx = mapInfo.coordinateDown / pointScale + mapInfo.coordinateUpper / pointScale
    const centery = mapInfo.coordinateLeft / pointScale + mapInfo.coordinateRight / pointScale
    const center = [centerx / 2, centery / 2]
    // eslint-disable-next-line no-undef
    const map = L.map('map', {
      // center: [0, 0],
      center,
      zoom: initMapZoom,
      minZoom: opts.minZoom || initMapZoom,
      maxZoom: opts.maxZoom || initMapZoom,
      doubleClickZoom: false,
      zoomControl: false, // 默认不显示缩放按钮
      attributionControl: false // 不显示leaflet 图标logo
    })
    // console.log(mapInfo)
    const imgUrl = mapInfo.twoDFilePath
    const imgBounds = [[mapInfo.coordinateDown / pointScale, mapInfo.coordinateLeft / pointScale], [mapInfo.coordinateUpper / pointScale, mapInfo.coordinateRight / pointScale]]
    const mapPoints = [
      [mapInfo.coordinateDown / pointScale, mapInfo.coordinateLeft / pointScale],
      [mapInfo.coordinateUpper / pointScale, mapInfo.coordinateLeft / pointScale],
      [mapInfo.coordinateUpper / pointScale, mapInfo.coordinateRight / pointScale],
      [mapInfo.coordinateDown / pointScale, mapInfo.coordinateRight / pointScale],
    ]
    const imageOverlay = L.imageOverlay(imgUrl, imgBounds)
    imageOverlay.addTo(map)
    return {
      map,
      mapPoints,
      mapInfo
    }
  } catch (error) {
    Notification.error({
      message: '获取地图数据失败[失望脸]'
    })
  }
}

let points = []
let fenceType = ''
let polygon = null

function computePolygonPath (p1, p2) {
  const points = [
    p1,
    [p1[0], p2[1]],
    p2,
    [p2[0], p1[1]]
  ]
  return points
}

function clickMap (ev) {
  // console.log(ev)
  const { lng, lat } = ev.latlng
  points.push([lat, lng])
  if (points.length === 2) {
    this.off('click', clickMap)
    this.off('mousemove', mousemoveMap)
    const grab = document.querySelector('.leaflet-grab')
    // console.log(grab)
    grab.style.cursor = 'grab'
    this.customPolygon = polygon
  }
}

function mousemoveMap (ev) {
  // console.log(ev)
  if (points.length === 1) {
    const { lng, lat } = ev.latlng
    let temPoints = computePolygonPath(points[0], [lat, lng])
    if (polygon === null) {
      console.log(fenceType)
      polygon = L.polygon(temPoints, {
        fillColor: fenceStyles[fenceType],
        fillOpacity: 0.4,
        stroke: false
      })
      polygon.addTo(this)
    } else {
      // console.log(polygon)
      polygon.setLatLngs(temPoints)
    }
  }
}

export const createFence = (map, type) => {
  // console.log(map)
  // map.style.cursor = 'pointer'
  const grab = document.querySelector('.leaflet-grab')
  // console.log(grab)
  grab.style.cursor = 'pointer'
  // console.log(type)
  points = []
  if (polygon) {
    polygon.remove()
    polygon = null
  }
  map.customPolygon = null
  if (!type) {
    return
  }
  fenceType = type
  map.on('click', clickMap)
  map.on('mousemove', mousemoveMap)
}

export const renderFence = (map, fences) => {
  console.log(fences)
  fences.forEach((fence) => {
    const name = fence.name
    const mapPoints = [
      [fence.coordinateDown / pointScale, fence.coordinateLeft / pointScale],
      [fence.coordinateUpper / pointScale, fence.coordinateLeft / pointScale],
      [fence.coordinateUpper / pointScale, fence.coordinateRight / pointScale],
      [fence.coordinateDown / pointScale, fence.coordinateRight / pointScale],
    ]
    const fencePolygon = L.polygon(mapPoints, {
      fillColor: fenceStyles[name],
      fillOpacity: 0.4,
      stroke: false
    })
    fencePolygon.addTo(map)
  })
}
