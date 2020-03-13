<template>
  <el-dialog
    :visible="visible"
    :destroy-on-close="true"
    width="60%"
    title="车辆详情"
    :show-close="false"
  >
    <div class="track">
      <!-- <div class="map-track">
        <h2>地图和轨迹</h2>
      </div> -->
      <div class="info">
        <el-tabs>
          <el-tab-pane label="基本信息" name="online">
            基本信息
          </el-tab-pane>
          <el-tab-pane label="告警信息" name="his">
            告警信息列表
          </el-tab-pane>
          <el-tab-pane label="维修流转" name="no">
            维修流转
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <div slot="footer">
      <el-button @click="closeDialog">Close</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  data () {
    return {
      visible: false
    }
  },
  methods: {
    closeDialog () {
      this.visible = false
    }
  }
}
</script>
<style lang="less" scoped>
.track {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
</style>
