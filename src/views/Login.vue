<template>
  <div class="page">
    <div class="login">
      <!-- <h2>登录系统</h2> -->
      <el-form :model="user" ref="loginForm" :rules="userRules" >
        <el-form-item prop="username">
          <el-input class="input" v-model="user.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input class="input"  type="password" v-model="user.password" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="isLoading" class="input" type="success" @click="doLogin">登录</el-button>
        </el-form-item>
      </el-form>
      <SelectLine ref="selectLine" />
    </div>
  </div>
</template>

<script>
import SelectLine from '../components/SelectLine'
import {
  mapActions
} from 'vuex'
export default {
  components: {
    SelectLine
  },
  data () {
    return {
      visible: false,
      isLoading: false,
      user: {
        username: '',
        password: ''
      },
      userRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 10, message: '用户名长度必须是5-10字符', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度必须是6-15字符', trigger: 'blur' },
        ]
      },
    }
  },
  methods: {
    ...mapActions(['login']),
    doLogin () {
      this.isLoading = true
      // this.$refs['selectLine'].visible = true
      this.$refs['loginForm'].validate((valid) => {
        if (valid) {
          // console.log(this.user)
          this.login(this.user).then((res) => {
            // console.log(res)
            this.isLoading = false
          }).catch((err) => {
            console.log(err)
            this.isLoading = false
            this.$refs['loginForm'].resetFields()
          })
        }
      })
      // this.login(user)
    },
  }
}
</script>
<style lang="less" scoped>
.page {
  width: 100vw;
  height: 100vh;
  background: url('../assets/img/login-bg.png') no-repeat;
  background-size: cover;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  .login {
    width: 400px;
    height: 300px;
    border-radius: 20px;
    position: fixed;
    right: 30%;
    top: 50%;
    // background: rgba(248, 248, 248, 0.1);
    // box-shadow: 1px 0 2px rgb(34, 33, 33);
    .input {
      width: 80%;
      margin: 10px 0;
    }
  }
}
</style>
