<template>
  <div class="sum">
    <div class="left">
      <div class="icon">
        <zx-icon :type="icon"></zx-icon>
      </div>
      <div class="title">{{'入库'}}</div>
    </div>
    <div class="content">
      <!-- <div class="title">{{'入库'}}</div> -->
      <div class="main">
        <CountTo className="font" :to="250" :uid="id"  />
      </div>
      <div class="history">
        <div>昨日: {{234}}</div>
        <div>七日: {{312}}</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  components: {
    CountTo: () => import('./CountTo'),
  },
  props: {
    info: {
      required: true
    },
    icon: {
      default: 'zx-ruku'
    },
    id: {
      required: true,
      default: 'car'
    }
  }
}
</script>
<style lang="less">
.sum {
  display: grid;
  grid-template-columns: 45% auto;
  height: 100%;
  box-sizing: border-box;
  column-gap: 10px;
  padding: 15px 10px;
  background: rgba(51, 47, 47, 0.61);
  border-radius: 10px;
  align-items: center;
  // justify-items: start;
  .left {
    // font-size: 2rem;
    width: 100%;
    display: grid;
    grid-template-columns: 30% auto;
    .icon {
      font-size: 2rem;
    }
    .title {
      font-size: 1.3rem;
      text-align: left;
      // line-height: 100%;
      align-self: center;
    }
  }
  .content {
    // color: darkgreen;
    .main {
      .font {
        font-size: 3rem;
      }
    }
    .history {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 10px;
      color: darkgrey;
    }
  }
}
</style>
