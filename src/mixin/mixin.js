export const mixin = {
  mrthods: {
    guide () {
      this.$intro().setOptions({
        prevLabel: '上一步',
        nextLabel: '下一步',
        skipLabel: '跳过',
        doneLabel: '结束',
        showStepNumbers: false,
        tooltipClass: 'custom-bg',
        highlightClass: 'custom-bg',
      }).start().onComplete((ev) => {
        console.log('over')
        // todo
      })
    }
  }
}
