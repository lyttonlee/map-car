<template>
  <div class="page">
    <div class="search">
      <el-input placeholder="搜索筛选框"></el-input>
    </div>
    <div class="add">
      <el-button @click="addDevice">添加标签</el-button>
    </div>
    <el-table :data="devices" style="width: 100%;background:#fff0" size="mini">
      <el-table-column label="设备编号" prop="name"></el-table-column>
      <el-table-column label="状态" prop="statu"></el-table-column>
      <el-table-column label="位置(红色为异常)">
        <template slot-scope="scope">
          <div :class="scope.row.pox === '异常' ? 'error' : ''">{{scope.row.addr}}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="small">编辑</el-button>
          <el-button size="small" @click="deleteDevice(scope.row)">删除</el-button>
          <el-button size="small" @click="sendVoice(scope.row.name)">发声</el-button>
          <!-- <el-button v-if="scope.row.pox === '异常'" size="small" type="danger">查看异常位置</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <AddDeviceDialog ref="addDeviceDialog" />
  </div>
</template>
<script>
import AddDeviceDialog from './AddDeviceDialog'
export default {
  components: {
    AddDeviceDialog
  },
  data () {
    return {
      devices: [
        { name: 'sx2123132', statu: '未使用', pox: '正常', addr: '总装车间第二排' },
        { name: 'sa332323', statu: '使用中', pox: '正常', addr: '总装车间第二排' },
        { name: '213424234', statu: '使用中', pox: '异常', addr: '未知地点-超出范围' },
        { name: '4324234234', statu: '使用中', pox: '正常', addr: '总装车间第二排' },
        { name: '643542342', statu: '未使用', pox: '正常', addr: '总装车间第二排' },
        { name: '432432434', statu: '未使用', pox: '异常', addr: '未知地点-超出范围' },
        { name: '654353532', statu: '使用中', pox: '正常', addr: '总装车间第二排' }
      ]
    }
  },
  methods: {
    addDevice () {
      this.$refs['addDeviceDialog'].visible = true
    },
    sendVoice (name) {
      this.$notify({
        title: '成功',
        message: `已成功对标签${name}下发语音命令，请确认设备`,
        type: 'success'
      })
    },
    deleteDevice (device) {
      console.log(device)
      this.$notify({
        title: '成功',
        message: `已删除设备${device.name}`,
        type: 'success'
      })
    }
  }
}
</script>
<style lang="less" scoped>
.page {
  .search {
    margin: 15px 0;
  }
  .add {
    margin:  10px 0;
    text-align: left;
  }
}
</style>
