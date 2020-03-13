<template>
  <div class="page stat">
    <div
      class="item item-2-2"
      id="stat"
    >1</div>
    <div class="item">2</div>
    <div class="item item-3">3</div>
    <div class="item">4</div>
    <div class="item">5</div>
    <div class="item">6</div>
    <div class="item">7</div>

  </div>
</template>
<script>
// import echarts from 'echarts'
export default {
  methods: {
    createChart () {
      // ..
    }
  },
  mounted () {
  }
}

</script>
<style
  lang="less"
  scoped
>
  .stat {
    // margin: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: repeat(3, 1fr);
    grid-gap: 20px;
    grid-auto-flow: row dense;

    .item {
      background: rgba(53, 51, 51, 0.322);
      border-radius: 20px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      // height: 200px;
    }

    .item-2-2 {
      // grid-row: 1/3;
      // grid-column: 1;
      grid-row-start: 1;
      grid-row-end: 3;
    }

    .item-3 {
      grid-column-start: 2;
      grid-column-end: 4;
    }
  }

</style>
