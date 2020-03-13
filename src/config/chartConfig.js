const textColor = '#ccc'
const backgroundColor = '#6a7985'
export const baseChartOption = {
  color: ['#91c7ae', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
  title: {
    textStyle: {
      color: '#999'
    },
    // textAlign: 'center',
    left: '30%',
    top: 10,
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: backgroundColor
      }
    }
  },
  textStyle: {
    color: textColor
  },
  legend: {
    textStyle: {
      color: textColor
    }
  },
  // toolbox: {
  //   feature: {
  //     saveAsImage: {}
  //   }
  // },
  grid: {
    top: '3%',
    left: '2%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
}
