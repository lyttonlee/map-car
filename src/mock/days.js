import moment from 'moment'
export function getLastDays (num) {
  let days = []
  for (let index = num; index > 0; index--) {
    days.push(moment().subtract('days', index).format('MM-DD'))
  }
  return days
}

export const getHours = () => {
  let hours = []
  for (let i = 0; i < 24; i++) {
    if (i < 10) {
      hours.push(`0${i}:00`)
    } else {
      hours.push(`${i}:00`)
    }
  }
  return hours
}
// export const sevenDays = []
// console.log(getLastDays(7))
export default {
  getLastDays,
  getHours
}
