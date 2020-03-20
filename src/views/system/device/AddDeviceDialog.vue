<template>
  <el-dialog
    title="添加设备"
    :visible="visible"
    :destroy-on-close="true"
    width="60%"
    :show-close="false"
  >
    <div class="item">
      <el-input placeholder="设备编号"></el-input>
    </div>
    <div class="item">
      <el-input placeholder="类型"></el-input>
    </div>
    <!-- <h3>具体设备的属性进一步讨论</h3>
    <h3>添加设备考虑是否有必要通过文件上传来实现批量添加</h3> -->
    <div slot="footer">
      <el-button @click="addDevice">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  data () {
    return {
      visible: false,
      selectRole: '',
    }
  },
  methods: {
    addDevice () {
      this.visible = false
      this.$notify({
        title: '成功',
        message: `已成功添加设备`,
        type: 'success'
      })
    }
  }
}
</script>
<style lang="less" scoped>
.item {
  margin: 20px;
}
</style>
