import store from '../store'
import {
  initPointScale as pointScale,
  initMapZoom,
  fenceStyles,
  initCarSize
} from '../config/config'
import {
  Notification
} from 'element-ui'
import {
  transRequest
} from '../api/fence'
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

// 渲染一个车位
/**
 *
 *
 * @export
 * @param {object} item
 * @return {object} park L.polygon
 */
export function renderPark (item) {
  // console.log(item)
  const name = getOfficeNameById(item.bindMapId)
  // console.log(name)
  const points = item.points.split(';').map((pointStr) => {
    const [x, y] = pointStr.split('_')
    return [y / store.state.pointScale, x / store.state.pointScale]
  })
  // console.log(points)
  const park = L.polygon(points, {
    fillColor: fenceStyles[name] || '#689',
    fillOpacity: 0.4,
    stroke: false
  })
  return park
}

function getBindId (type) {
  if (type && type !== 'VQ') {
    return store.state.childMapInfos.find((map) => map.name === type).id
  } else {
    return null
  }
}

export function getOfficeNameById (id) {
  // console.log(id)
  if (id) {
    return store.state.childMapInfos.find((map) => map.id === id).name
  } else {
    return 'VQ'
  }
}

let points = []
let fenceType = ''
let polygon = null
let bindType = ''
let isOrigin = false

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
  if (lat * store.state.pointScale < 75) {
    return
  }
  points.push([lat, lng])
  if (points.length === 2) {
    this.off('click', clickMap)
    this.off('mousemove', mousemoveMap)
    const grab = document.querySelector('.leaflet-grab')
    // console.log(grab)
    grab.style.cursor = 'grab'
    this.customPolygon = polygon
    // console.log(points)
    const param = {
      leftPoint: {
        x: points[0][1] * store.state.pointScale,
        y: points[0][0] * store.state.pointScale
      },
      rightPoint: {
        x: points[1][1] * store.state.pointScale,
        y: points[1][0] * store.state.pointScale
      },
      bindId: getBindId(bindType),
      // bindMapId: getBindId(bindType),
      mapInfoId: store.state.mapInfo.id,
      origin: isOrigin
    }
    const url = '/fenceDate/v1.0/bind/type4'
    transRequest(param, url).then((res) => {
      // console.log(res)
      this.customPolygon.remove()
      const { code, result } = res
      if (code === 0) {
        if (result.code === 0) {
          this.$resolve(result.result)
        }
      }
    })
  }
}

function mousemoveMap (ev) {
  // console.log(ev)
  if (ev.latlng.lat * store.state.pointScale < 75) return
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

export const createFence = (map, type, origin) => {
  return new Promise((resolve) => {
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
      bindType = ''
      isOrigin = false
      return
    }
    fenceType = type
    bindType = type
    isOrigin = origin
    map.$resolve = resolve
    map.on('click', clickMap)
    map.on('mousemove', mousemoveMap)
  })
}

export const renderFence = (map, fences) => {
  // console.log(fences)
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

export const changeMarkerScale = (marker, curScale) => {
  let icon = marker.getIcon()
  let size = initCarSize.map((pixe) => {
    return pixe * curScale
  })
  let anchor = initCarSize.map((pixe) => {
    return pixe * curScale / 2
  })
  let newIcon = L.icon({
    iconUrl: icon.options.iconUrl,
    iconAnchor: anchor,
    iconSize: size
  })
  // console.log(newIcon)
  marker.setIcon(newIcon)
  marker.setRotation(marker.angle || 180)
}
