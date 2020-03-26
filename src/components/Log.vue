<template>
  <div class="log">
    <div class="date">
      <div class="date-time">{{$moment(log.time).format('HH:mm')}}</div>
      <div class="date-md">{{$moment(log.time).format('YYYY-MM-DD')}}</div>
    </div>
    <div class="content">
      <div class="info">{{log.detail}}</div>
      <div class="author">操作员: {{log.nickName}}</div>
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
<style lang="less">
.log {
  display: grid;
  grid-template-columns: 40% 50%;
  column-gap: 10px;
  margin-top: 15px;
  padding: 5px;
  background: rgba(46, 46, 46, 0.534);
  border-radius: 10px;
  .date {
    border-right: 1px solid #666;
    .date-time {
      font-size: 1.5rem;
      color: darkcyan;
    }
    .date-md {
      font-size: 1.1rem;
      color: rgb(187, 187, 187);
    }
  }
  .content {
    padding-top: 8px;
    .info {
      //..
      font-size: 1rem;
      margin-bottom: 3px;
    }
    .author {
      color: darkgray;
      font-size: .9rem;
    }
  }
}
</style>
