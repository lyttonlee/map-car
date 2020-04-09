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
