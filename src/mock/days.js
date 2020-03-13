import moment from 'moment'
function getLastDays (num) {
  let days = []
  for (let index = num; index > 0; index--) {
    days.push(moment().subtract('days', index).format('MM-DD'))
  }
  return days
}
// export const sevenDays = []
// console.log(getLastDays(7))
export default getLastDays
