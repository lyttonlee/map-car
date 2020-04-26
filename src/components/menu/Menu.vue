<template>
  <div class="menus">
    <template v-for="(menu, index) in menus">
      <router-link class="menu" :to="menu.path" :key="index">
        <zx-icon v-if="menu.meta.icon" :type="menu.meta.icon" />
        {{menu.name}}
      </router-link>
    </template>
  </div>
</template>
<script>
export default {
  props: {
    menus: {
      required: true,
      type: Array
    },
    mode: {
      default: 'horizontal'
    }
  }
}
</script>
<style lang="less" scoped>
@import '../../assets/less/color.less';
.menus {
  // width: 100%;
  padding-left: 20px;
  margin: 0 10px;
  box-sizing: border-box;
  text-align: left;
  vertical-align: middle;
  background: @base-background;
  box-shadow: @shadow-base;
  border-radius: 10px;
  height: 50px;
  box-sizing: border-box;
  // z-index: 10;
  margin-bottom: 10px;
  .menu {
    padding: 10px 20px;
    display: inline-block;
    height: 30px;
    color: @font-color;
    text-decoration: none;
    line-height: 40px;
    font-size: .8rem;
    &:hover {
      background: @page-background;
      color: @font-color;
    }
  }
  .router-link-active {
    // margin: 0 10px;
    background: @page-background;
    color: @primary-color;
    border-bottom: 1px solid @primary-color;
  }
}
</style>
