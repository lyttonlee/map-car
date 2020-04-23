<template>
  <div class="map-list">
    <!-- <h2>map-list</h2> -->
    <div class="list">
      <template v-for="(map, index) in maps">
        <div :class="activeId === map.id ? 'item active' : 'item'" :key="index" @click="changeMap(map.id)">{{map.name + ' ' + `(${carMapNum.get(map.id)})`}}</div>
      </template>
      <!-- {{carMapNum}} -->
    </div>
    <div class="map-pic"></div>
  </div>
</template>
<script>
export default {
  props: {
    maps: {
      required: true,
      type: Array
    },
    activeId: {
      default: 0
    },
    carMapNum: {
      required: true
    }
  },
  model: {
    prop: 'activeId',
    event: 'changeShownMap'
  },
  methods: {
    changeMap (id) {
      console.log(id)
      this.$emit('changeShownMap', id)
    }
  }
}
</script>
<style lang="less" scoped>
@import '../assets/less/color.less';
.map-list {
  position: absolute;
  top: 25px;
  left: 25px;
  // width: 150px;
  height: 80vh;
  // background: @base-background-opacity;
  border-radius: 10px;
  overflow-y: auto;
  z-index: 2500;
  .list {
    margin: 10px 0;
    .item {
      margin-top: 10px;
      padding: 10px;
      border-radius: 5px;
      background: @page-background;
      border: .5px solid #222;
      box-sizing: border-box;
      // box-shadow: @shadow-base;
      box-shadow: 1px 3px 3px #000;
      cursor: pointer;
    }
    .active {
      color: @primary-color;
      background: @base-background-opacity;
    }
  }
}
</style>
