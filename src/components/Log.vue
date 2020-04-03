<template>
  <div class="log">
    <div class="date">
      <div class="date-time">{{$moment(log.time).format('HH:mm')}}</div>
      <div class="date-md">{{$moment(log.time).format('MM-DD')}}</div>
    </div>
    <div class="content">
      <div class="info">{{log.detail}}</div>
      <div class="author">操作员: {{log.nickName}}</div>
    </div>
    <div class="right">
      <div class="date-right">{{$moment(log.time).format('MM-DD')}}</div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    log: {
      required: true,
      type: Object
    }
  },
  data () {
    return {}
  }
}
</script>
<style lang="less" scoped>
@import '../assets/less/color.less';
.log {
  display: grid;
  grid-template-columns: 20% 55% 15%;
  column-gap: 10px;
  margin-top: 15px;
  padding: 5px;
  background: @page-background-opacity;
  border-radius: 10px;
  box-sizing: border-box;
  align-items: center;
  .date {
    border-right: 1px solid #666;
    .date-time {
      font-size: 1.1rem;
      color: @primary-color;
    }
    .date-md {
      font-size: .8rem;
      color: rgb(187, 187, 187);
    }
  }
  .content {
    padding-top: 8px;
    border-right: 1px solid #666;
    .info {
      //..
      font-size: .8rem;
      margin-bottom: 3px;
    }
    .author {
      color: darkgray;
      font-size: .7rem;
    }
  }
  .right {
    text-align: left;
  }
}
</style>
