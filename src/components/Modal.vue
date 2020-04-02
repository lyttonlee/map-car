<template>
  <div class="modal">
    <div class="box">
      <div class="content">
        <slot />
      </div>
      <div class="footer">
        <slot name="ok">
          <el-button type="primary" size="mini" round @click="ok">确定</el-button>
        </slot>
        <el-button type="info" size="mini" round @click="quit">退出</el-button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  // ..
  methods: {
    quit () {
      this.$emit('quit')
    },
    ok () {
      console.log('ok')
      this.$emit('ok')
    }
  }
}
</script>
<style lang="less" scoped>
@import '../assets/less/color.less';
.modal {
  width: 100%;
  height: 100vh;
  position: fixed;
  background: @page-background-opacity;
  top: 0;
  left: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  .box {
    width: 60%;
    min-height: 300px;
    background: @base-background;
    border-radius: 20px;
    padding: 15px;
    box-shadow: @shadow-base;
    .content {
      min-height: 300px;
    }
    .footer {
      text-align: right;
    }
  }
}
</style>
