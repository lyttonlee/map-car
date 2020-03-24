<template>
  <div>
    <router-view></router-view>
  </div>
</template>
<script>
import {
  mapActions
} from 'vuex'
export default {
  methods: {
    ...mapActions(['queryStatus']),
    getAllStatus () {
      this.queryStatus()
    }
  },
  created () {
    this.getAllStatus()
  }
}
</script>
