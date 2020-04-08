<template>
  <div class="item-box">
    <div :class="isLast ? 'border-end' : 'border'"></div>
    <div class="log">
      <div class="date">
        <div class="date-time">{{$moment(log.time).format('HH:mm')}}</div>
        <div class="date-md">{{$moment(log.time).format('MM-DD')}}</div>
      </div>
      <div :class="isLast ? 'point-end' : 'point'"></div>
      <div class="content">
        <div class="info">{{log.detail}}</div>
        <div class="author">操作员- {{log.nickName}}</div>
      </div>
      <div class="right">
        <div class="date-right">{{$moment.duration(5700 * 1000).asHours().toFixed(2) + 'h'}}</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    log: {
      required: true,
      type: Object
    },
    isLast: {
      default: false
    }
  },
  data () {
    return {}
  }
}
</script>
<style lang="less" scoped>
@import '../assets/less/color.less';
.item-box {
  display: grid;
  grid-template-columns: 0 auto;
  .log {
    display: grid;
    grid-template-columns: 70px 10px 55% 15%;
    // column-gap: 10px;
    // margin-top: 15px;
    padding: 10px 5px;
    // background: @page-background-opacity;
    // border-radius: 10px;
    box-sizing: border-box;
    align-items: center;
    .point {
      // position: absolute;
      background-color: @info;
      border-radius: 50%;
      height: 10px;
      z-index: 2;
      // display: flex;
      // justify-content: center;
      // align-items: center;
    }
    .point-end {
      background-color: @primary-color;
      border-radius: 50%;
      height: 10px;
      z-index: 2;
    }
    .date {
      // border-right: 1px solid #666;
      .date-time {
        font-size: 1rem;
        color: @primary-color;
      }
      .date-md {
        font-size: .8rem;
        color: rgb(187, 187, 187);
      }
    }
    .content {
      padding-top: 8px;
      // border-left: 1px solid @info;
      position: relative;
      // left: -5px;
      // border-right: 1px solid #666;
      .info {
        //..
        font-size: .8rem;
        // margin-bottom: 3px;
      }
      .author {
        color: darkgray;
        font-size: .7rem;
      }
    }
    .right {
      text-align: left;
      .date-right {
        font-size: 1.1rem;
        color: @primary-color;
      }
    }
  }
  .border {
    position: relative;
    left: 79px;
    border: 1px solid @info;
    height: 100%;
    top: 50%;
  }
  .border-end {
    border: none;
  }
}

</style>
