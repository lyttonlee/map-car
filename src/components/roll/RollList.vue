<template>
  <div class="roll" :style="`margin-top: ${marginTop}px`">
    <template v-for="(item, index) in 20">
      <div :key="index">{{index}}</div>
    </template>
  </div>
</template>
<script>
export default {
  data () {
    return {
      marginTop: 0
    }
  },
  mounted () {
    setInterval(() => {
      this.marginTop -= 10
    }, 1000)
  },
}
</script>
<style lang="less" scoped>
.roll {
  height: 100px;
  overflow: hidden;
}
</style>
