<template>
  <el-dialog
    title="编辑用户"
    :visible="visible"
    :destroy-on-close="true"
    width="60%"
    :show-close="false"
  >
    <el-form :model="userModel" :rules="rules" ref="editUser" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="userModel.username"></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="userModel.nickname"></el-input>
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <el-input v-model="userModel.avatar"></el-input>
      </el-form-item>
      <!-- <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="userModel.password"></el-input>
      </el-form-item>
      <el-form-item label="验证密码" prop="confirmPassword">
        <el-input type="password" v-model="userModel.confirmPassword"></el-input>
      </el-form-item> -->
      <!-- <el-form-item label="角色" prop="roles">
        <el-select style="width: 100%" v-model="userModel.roles" placeholder="请选择角色">
          <el-option
            v-for="item in createRoles"
            :key="item.id"
            :label="item.description"
            :value="item.name">
          </el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item v-if="isShowSelectProductLine" label="产线" prop="productLine">
        <el-select style="width: 100%" v-model="userModel.productLine" placeholder="请选择产线">
          <el-option
            v-for="item in lines"
            :key="item.id"
            :label="item.description"
            :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button type="success" :loading="isLoading" @click="doEditUser">确定</el-button>
      <el-button @click="closeDialog">取消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import {
  mapState,
  mapActions,
} from 'vuex'
import {
  editUser
} from '../../../api/user'
export default {
  data () {
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('密码不能为空!'))
      } else if (value.length < 6 || value.length > 15) {
        callback(new Error('密码长度应在6-15位之间'))
      } else {
        callback()
      }
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码!'))
      } else if (value !== this.userModel.password) {
        callback(new Error('两次输入的密码不一致！'))
      } else {
        callback()
      }
    }
    return {
      isLoading: false,
      visible: false,
      selectRole: '',
      user: '',
      userModel: {
        username: '',
        roles: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        avatar: '',
        master: false,
        productLine: ''
      },
      rules: {
        username: [
          { required: true, message: '用户名是必须的', trigger: 'blur' },
          { max: 10, min: 5, message: '长度5-10', trigger: 'blur' },
        ],
        roles: [
          { required: true, message: '必须选择用户角色', trigger: 'blur' },
        ],
        nickname: [
          { required: true, message: '昵称是必须的', trigger: 'blur' },
          { max: 10, min: 5, message: '长度5-10', trigger: 'blur' },
        ],
        productLine: [
          { required: true, message: '必须选择一条产线', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '密码是必须的', trigger: 'blur' },
          { validator: validatePassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '密码是必须的', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      },
      createRoles: [],
      lines: [
        { id: 1, description: '广本产线' },
        { id: 2, description: '其它产线' }
      ],
    }
  },
  computed: {
    ...mapState(['roleList', 'roles']),
    isShowSelectProductLine () {
      if (this.roles === 'VQ') {
        return false
      } else if (this.userModel.roles === 'PC') {
        return false
      } else {
        return true
      }
    }
  },
  methods: {
    ...mapActions(['requestRoles']),
    closeDialog () {
      this.visible = false
    },
    doEditUser () {
      this.isLoading = true
      let user = {
        id: this.userModel.id,
        master: true,
        username: this.userModel.username,
        nickname: this.userModel.nickname,
        imageUrl: this.userModel.imageUrl
      }
      editUser(user).then((res) => {
        console.log(res)
        let { code, desc } = res
        if (code === 0) {
          this.isLoading = false
          this.$notify.success({
            message: desc
          })
          this.visible = false
        } else {
          this.isLoading = false
          this.$notify.error({
            message: desc
          })
        }
      })
    },
    // 根据当前登录角色判断可创建的角色
    computedCanCreatedRoles (currentRole) {
      this.requestRoles().then(() => {
        switch (currentRole) {
          case 'SuperAdmin':
            this.createRoles = this.roleList.filter((role) => role.id > 1)
            break
          case 'PC':
            this.createRoles = this.roleList.filter((role) => role.id > 2)
            break
          case 'VQ':
            this.createRoles = this.roleList.filter((role) => role.id > 3)
            break
          default:
            this.createRoles = []
            break
        }
        console.log(this.createRoles)
      })
    },
    // setFiled
    setFormField (user) {
      console.log(user)
      this.userModel = user
    }
  },
  created () {
    this.computedCanCreatedRoles(this.roles)
  }
}
</script>
<style lang="less" scoped>
.item {
  margin: 20px;
}
</style>
