<template>
  <div class="time">
    <!-- {{moment().format('YYYY-MM-DD HH:mm:ss')}} -->
    <span style="">{{now}}</span>
  </div>
</template>
<script>
import moment from 'moment'
export default {
  data () {
    return {
      now: ''
    }
  },
  methods: {
    moment
  },
  mounted () {
    this.time = setInterval(() => {
      this.now = moment().format('YYYY-MM-DD HH:mm:ss')
    }, 1000)
  },
  beforeDestroy () {
    this.time && clearInterval(this.time)
    this.time = null
  }
}
</script>
