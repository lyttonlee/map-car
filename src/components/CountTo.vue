<template>
  <div class="count" :id="`count-${uid}`"></div>
</template>
<script>
import { CountUp } from 'countup.js'
export default {
  props: {
    to: {
      required: true
    },
    suffix: {
      default: ''
    },
    uid: {
      required: true,
      type: String
    },
    decimalPlaces: {
      default: 0
    }
  },
  data () {
    return {
      count: 0,
      counter: ''
    }
  },
  watch: {
    to: {
      handler (newValue) {
        console.log('newValue')
        if (newValue) {
          // todo
          // this.countTo()
          this.update(newValue)
        }
      },
    }
  },
  methods: {
    init () {
      this.counter = new CountUp(`count-${this.uid}`, this.to, {
        startVal: 0,
        duration: 2,
        decimalPlaces: this.decimalPlaces,
        suffix: this.suffix
      })
      this.counter.start()
    },
    update (num) {
      this.counter.update(num)
    },
  },
  mounted () {
    this.init()
  },
  beforeDestroy () {
    this.time && clearInterval(this.time)
  }
}
</script>
<style lang="less">
.count {
  font-size: 2rem;
}
</style>
