<template>
  <div class="page">
    <div class="head">
      <el-button type="success" @click="addUser">添加用户</el-button>
    </div>
    <div class="list">
      <el-table :data="users" style="width: 100%;background:#fff0" size="mini">
        <el-table-column label="姓名" prop="name"></el-table-column>
        <el-table-column label="角色" prop="role"></el-table-column>
        <el-table-column label="头像" prop="avatar">
          <template slot-scope="scope">
            <img style="width: 30px" :src="scope.row.avatar" alt="">
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="danger" size="small" @click="editUser(scope.row)">编辑</el-button>
            <el-button  size="small" @click="deleteUser(scope.row.name)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <AddUser ref="addUserDialog" />
    <EditUser ref="editUserDialog" />
  </div>
</template>
<script>
import avatar from '../../assets/img/avatar.jpg'
import AddUser from './AddUserDialog'
import EditUser from './EditUserDIalog'
import {
  mapActions
} from 'vuex'
import {
  queryUsers,
  deleteUser
} from '../../api/user'
export default {
  components: {
    AddUser,
    EditUser
  },
  data () {
    return {
      showAddUser: false,
      showEditUser: false,
      activeName: 'first',
      users: [
        {
          name: 'lee',
          role: 'PC',
          avatar
        },
        {
          name: 'wang',
          role: '分线管理员',
          avatar
        },
        {
          name: 'aLi',
          role: 'VQ操作员',
          avatar
        },
        {
          name: 'doudou',
          role: 'PA操作员',
          avatar
        },
      ]
    }
  },
  methods: {
    ...mapActions(['requestRoles']),
    addUser () {
      console.log('add')
      // this.showAddUser = true
      this.$refs['addUserDialog'].visible = true
    },
    editUser () {
      console.log('edit')
      // this.showEditUser = true
      this.$refs['editUserDialog'].visible = true
    },
    queryAllUser () {
      queryUsers().then((res) => {
        let { code, result } = res
        console.log(result)
        if (code === 0) {
          this.users = result
        }
      })
    },
    deleteUserById (name) {
      let index = this.users.findIndex((user) => user.name === name)
      this.users.splice(index, 1)
      deleteUser(name).then((res) => {
        console.log(res)
      })
    }
  },
  created () {
    this.requestRoles()
    this.queryAllUser()
  },
}
</script>
<style lang="less" scoped>
.page {
  .head {
    margin: 20px 0;
    text-align: left;
  }
}
</style>
