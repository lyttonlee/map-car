<template>
  <div class="page">
    <div class="fixed">
      <div>推荐使用Chrome浏览器，最佳分辨率为 1920 x 1080</div>
    </div>
    <div class="login">
      <!-- <h2>登录系统</h2> -->
      <img src="../assets/img/logo-login.png" alt="">
      <el-form :model="user" ref="loginForm" :rules="userRules" >
        <el-form-item prop="username">
          <el-input class="input" @keyup.enter.native="doLogin" v-model="user.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input class="input" @keyup.enter.native="doLogin" type="password" v-model="user.password" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="isLoading" class="input" type="primary" @click="doLogin">登录</el-button>
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
          { min: 3, max: 15, message: '密码长度必须是3-15字符', trigger: 'blur' },
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
          let param = Object.assign(this.user, { platform: 'WEB' })
          this.login(param).then((res) => {
            // console.log(res)
            // this.isLoading = false
          }).catch((err) => {
            console.log(err)
            // this.isLoading = false
            this.$refs['loginForm'].resetFields()
          })
        }
        this.isLoading = false
      })
      // this.login(user)
    },
    test (ev) {
      console.log(ev)
    }
  },
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
  .fixed {
    width: 100%;
    position: fixed;
    bottom: 15px;
    color: #fffa;
    text-align: center;
    font-size: .9rem;
  }
  .login {
    width: 350px;
    height: 300px;
    border-radius: 20px;
    position: fixed;
    right: 30%;
    top: 40%;
    text-align: center;
    // background: rgba(248, 248, 248, 0.1);
    // box-shadow: 1px 0 2px rgb(34, 33, 33);
    img {
      margin-bottom: 15px;
    }
    .input {
      width: 100%;
      margin: 10px 0;
    }
  }
}
</style>
