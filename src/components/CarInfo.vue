<template>
  <div class="info">
    <div @click="closeInfo" class="close">
      <zx-icon type="zx-guanbi1" />
    </div>
    <div class="car-info">
      <div class="item">车辆型号: 本田飞度</div>
      <div class="item">车架号码: 3213下23123</div>
      <div class="item">维修时间: 2020-3-17 12：41</div>
      <div class="item">维修时长: 3.5小时</div>
      <div class="item">当前状态: 正常</div>
      <div class="item">当前位置: XXXxxxx处</div>
    </div>
    <div class="process">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.timestamp">
          {{activity.content}}
        </el-timeline-item>
      </el-timeline>
    </div>
    <div>{{car}}</div>
  </div>
</template>
<script>
export default {
  props: {
    car: {
      required: true,
      type: Object
    }
  },
  data () {
    return {
      activities: [{
        content: '车辆绑定',
        timestamp: '2020-03-17 12：23'
      }, {
        content: '到达PA',
        timestamp: '2020-03-17 14：13'
      }, {
        content: '产生xx告警',
        timestamp: '2020-03-17 15：35'
      }]
    }
  },
  methods: {
    closeInfo () {
      this.$emit('close')
    }
  }
}
</script>
<style lang="less" scoped>
.info {
  width: 300px;
  height: 70vh;
  border-radius: 10px;
  background: rgba(56, 56, 56, 0.75);
  box-shadow: 2px 2px 5px #666;
  padding: 10px 5px;
  z-index: 1001;
  position: fixed;
  right: 400px;
  top: 80px;
  .car-info {
    margin: 10px;
    text-align: left;
    .item {
      margin-top: 8px;
    }
  }
  .close {
    font-size: .8rem;
    width: 40px;
    text-align: left;
    cursor: pointer;
  }
}
</style>
