<template>
  <div class="tags">
    <template v-for="(value, key, index) in fenceStyles">
      <div class="item" :key="index">
        <span>{{key.toUpperCase() + ' : '}}</span>
        <span class="bolck" :style="{ background: value }"></span>
      </div>
    </template>
  </div>
</template>
<script>
import {
  fenceStyles
} from '../config/config'
export default {
  data () {
    return {
      fenceStyles
    }
  }
}
</script>
<style lang="less" scoped>
.tags {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 10px;
  box-sizing: border-box;
  .item {
    display: flex;
    margin: 0 10px;
    .bolck {
      display: inline-block;
      width: 60px;
      margin-left: 10px;
      border-radius: 3px;
    }
  }
}
</style>
