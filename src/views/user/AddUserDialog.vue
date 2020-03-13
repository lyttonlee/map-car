<template>
  <el-dialog
    title="添加用户"
    :visible="visible"
    :destroy-on-close="true"
    width="60%"
    :show-close="false"
  >
    <el-form :model="addUserModel" :rules="rules" ref="addUser" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="addUserModel.username"></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="addUserModel.nickname"></el-input>
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <el-input v-model="addUserModel.avatar"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="addUserModel.password"></el-input>
      </el-form-item>
      <el-form-item label="验证密码" prop="confirmPassword">
        <el-input type="password" v-model="addUserModel.confirmPassword"></el-input>
      </el-form-item>
      <el-form-item label="角色" prop="roles">
        <el-select style="width: 100%" v-model="addUserModel.roles" placeholder="请选择角色">
          <el-option
            v-for="item in createRoles"
            :key="item.id"
            :label="item.description"
            :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="isShowSelectProductLine" label="产线" prop="productLine">
        <el-select style="width: 100%" v-model="addUserModel.productLine" placeholder="请选择产线">
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
      <el-button type="success" :loading="isLoading" @click="doCreateUser">确定</el-button>
      <el-button  @click="exit">取消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import {
  mapState,
  mapActions,
} from 'vuex'
import {
  createUser
} from '../../api/user'
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
      } else if (value !== this.addUserModel.password) {
        callback(new Error('两次输入的密码不一致！'))
      } else {
        callback()
      }
    }
    return {
      visible: false,
      isLoading: false,
      lines: [
        { id: 1, description: '广本产线' },
        { id: 2, description: '其它产线' }
      ],
      createRoles: [],
      addUserModel: {
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
      selectRole: '',
      // options: [
      //   { value: 'PC', label: 'PC' },
      //   { value: 'VQ操作员', label: 'VQ操作员' },
      //   { value: 'PA', label: 'PA' },
      // ]
    }
  },
  computed: {
    ...mapState(['roleList', 'roles']),
    // 判断是否显示选择产线
    isShowSelectProductLine () {
      if (this.roles === 'VQ') {
        return false
      } else if (this.addUserModel.roles === 'PC') {
        return false
      } else {
        return true
      }
    }
  },
  methods: {
    ...mapActions(['requestRoles']),
    // 取消
    exit () {
      this.visible = false
    },
    // 创建用户
    doCreateUser () {
      this.isLoading = true
      this.$refs['addUser'].validate((valid) => {
        if (valid) {
          let user = {
            imageUrl: this.addUserModel.avatar,
            master: true,
            nickname: this.addUserModel.nickname,
            password: this.addUserModel.password,
            roles: [{
              name: this.addUserModel.roles
            }],
            username: this.addUserModel.username,
            productLineId: this.addUserModel.productLine
          }
          if (!this.isShowSelectProductLine) {
            delete user.productLineId
          }
          console.log(user)
          createUser(user).then((res) => {
            let { code, result, desc } = res
            console.log(result)
            if (code === 0) {
              this.$notify.success({
                message: desc
              })
              this.visible = false
            } else {
              this.$notify.error({
                message: desc
              })
              this.isLoading = false
            }
          }).catch((err) => {
            console.log(err)
            this.$notify.error({
              message: '网络超时或服务器异常！请稍后再试'
            })
            this.isLoading = false
          })
        } else {
          this.isLoading = false
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
  },
  // mounted () {
  //   this.computedCanCreatedRoles(this.roles)
  // },
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
