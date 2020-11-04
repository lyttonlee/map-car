<template>
  <div class="item">
    <template v-for="(attr, index) in attrs">
      <div :class="big ? 'cell big' : 'cell'" :key="attr + index + Math.random()">
        {{attr}}
      </div>
    </template>
  </div>
</template>
<script>
export default {
  props: ['attrs', 'big'],
  data () {
    return {}
  }
}
</script>
<style lang="less" scoped>
.item {
  // display: flex;
  display: grid;
  grid-template-columns: 1fr 3fr 1fr auto;
  grid-template-rows: auto;
  // justify-content: center;
  // align-items: center;
  flex-wrap: nowrap;
  border-radius: 8px;
  // width: 60vw;
  .cell {
    border: .5px solid rgb(212, 212, 212);
    border-right: none;
    overflow: hidden;
    padding: 15px;
    min-width: 150px;
    font-weight: bold;
    font-size: 1.5rem;
    &:last-child {
      border-right: .5px solid rgb(218, 214, 214);
    }
    &:nth-child(2) {
      min-width: 350px;
    }
  }
  .big {
    // color: rgb(199, 137, 21);
    font-size: 3.5rem;
    background: rgba(223, 112, 8, 0.836);
  }
}
</style>
