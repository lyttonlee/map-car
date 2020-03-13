<template>
  <div @click="toggleMenu" class="change">
    <zx-icon :type="isShowMenu ? 'zx-guanbi' : 'zx-caidan'"></zx-icon>
  </div>
</template>
<script>
export default {
  data () {
    return {
      isShowMenu: true
    }
  },
  methods: {
    toggleMenu () {
      this.isShowMenu = !this.isShowMenu
      // console.log(this.isShowMenu)
      this.$emit('toggleMenu', this.isShowMenu)
    }
  }
}
</script>
<style lang="less" scoped>
.change {
    position: fixed;
    top: 10px;
    left: 10px;
    cursor: pointer;
    z-index: 100;
  }
</style>
