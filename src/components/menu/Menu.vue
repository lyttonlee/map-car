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
.menus {
  width: 100%;
  // padding: 10px 0;
  text-align: left;
  vertical-align: middle;
  background: rgba(39, 39, 39, 0.5);
  height: 50px;
  .menu {
    padding: 10px 20px;
    display: inline-block;
    height: 30px;
    color: antiquewhite;
    text-decoration: none;
    line-height: 40px;
    font-size: .9rem;
    &:hover {
      background: rgb(89, 92, 87);
      color: azure;
    }
  }
  .router-link-active {
    // margin: 0 10px;
    background: rgb(89, 92, 87);
    color: azure;
    border-bottom: 1px solid #fff;
  }
}
</style>
