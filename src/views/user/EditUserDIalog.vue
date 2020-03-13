<template>
  <el-dialog
    title="编辑用户"
    :visible="visible"
    :destroy-on-close="true"
    width="60%"
    :show-close="false"
  >
     <div class="item">
      <el-input placeholder="姓名"></el-input>
    </div>
    <div class="item">
      <el-input placeholder="密码"></el-input>
    </div>
    <div class="item">
      <el-select v-model="selectRole" placeholder="选择角色">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </div>
    <div slot="footer">
      <el-button @click="closeDialog">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  data () {
    return {
      visible: false,
      selectRole: '',
      options: [
        { value: 'PC', label: 'PC' },
        { value: 'VQ操作员', label: 'VQ操作员' },
        { value: 'PA', label: 'PA' },
      ]
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
.item {
  margin: 20px;
}
</style>
