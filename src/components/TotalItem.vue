<template>
  <div class="sum">
    <div class="left">
      <div class="icon">
        <zx-icon :type="info.icon"></zx-icon>
      </div>
      <div class="title">{{info.name}}</div>
    </div>
    <div class="content">
      <!-- <div class="title">{{'入库'}}</div> -->
      <div class="main">
        <CountTo :className="'font ' + computeStoreClass(info.index, info.today, info.yesterday)" :to="info.today" :uid="id" :decimalPlaces="computedPlace()" :suffix="computedSuffix(info.index)"  />
      </div>
      <div v-if="showSub" class="history">
        <div>昨日: {{type === 'broad' ? info.yesterday.toFixed(2) : info.yesterday}}</div>
        <div>七日: {{type === 'broad' ? info.average.toFixed(2) : info.average}}</div>
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
    },
    type: {
      default: 'store'
    },
    showSub: {
      default: true
    }
  },
  methods: {
    // ..
    computeStoreClass (index, today, yesterday) {
      if (this.type === 'store') { // 库存信息
        if (index === 1 || index === 2) { // 入荷 出荷
          if (today >= yesterday) { // 工作量更大
            return 'success'
          } else {
            return 'warn'
          }
        } else if (index === 3) { // 在库
          if (today >= yesterday) { // 剩余工作更多
            return 'warn'
          } else {
            return 'success'
          }
        } else {
          return ''
        }
      } else {
        // .
        if (index === 3 || index === 2) {
          if (today >= yesterday) {
            return 'warn'
          } else {
            return 'success'
          }
        } else if (index === 1) {
          if (today >= yesterday) {
            return 'success'
          } else {
            return 'warn'
          }
        } else {
          return ''
        }
      }
    },
    computedSuffix (index) {
      if (this.type === 'broad') {
        if (index === 3) {
          return 'h'
        } else {
          return '%'
        }
      } else {
        return ''
      }
    },
    computedPlace () {
      if (this.type === 'broad') {
        return 2
      } else {
        return 0
      }
    }
  }
}
</script>
<style lang="less">
@import '../assets/less/color.less';
.sum {
  display: grid;
  grid-template-columns: 50% auto;
  height: 100%;
  box-sizing: border-box;
  column-gap: 10px;
  padding: 15px 10px;
  background: @base-background;
  box-shadow: @shadow-base;
  border-radius: 10px;
  align-items: center;
  // justify-items: start;
  .left {
    // font-size: 2rem;
    width: 100%;
    display: grid;
    grid-template-columns: 30% auto;
    column-gap: 5px;
    .icon {
      font-size: 2rem;
    }
    .title {
      font-size: 1.1rem;
      font-weight: 600;
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
        // text-shadow: 1px 0 1px red;
      }
    }
    .history {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 10px;
      color: @font-color;
    }
  }
}
</style>
