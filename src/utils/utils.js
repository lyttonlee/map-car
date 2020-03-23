import moment from 'moment'

export const timeToNow = (time) => {
  return moment(time).toNow(true)
}
