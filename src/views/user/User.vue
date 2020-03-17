<template>
  <div class="page">
    <div class="head">
      <el-button type="success" @click="addUser">添加用户</el-button>
    </div>
    <div class="list">
      <el-table :data="users" style="width: 100%;background:#fff0" size="mini">
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="角色">
          <template slot-scope="scope">
            {{formatRole(scope.row.roles)}}
          </template>
        </el-table-column>
        <el-table-column label="头像">
          <template>
            <!-- <img style="width: 30px" :src="scope.row.imageUrl" alt=""> -->
            <img style="width: 30px" :src="avatar" alt="">
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="danger" size="small" @click="editUser(scope.row)">编辑</el-button>
            <el-button  size="small" @click="deleteUserById(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <AddUser @addedUser="refreshQuery" ref="addUserDialog" />
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
      users: [],
      avatar
    }
  },
  methods: {
    ...mapActions(['requestRoles']),
    formatRole (roles) {
      let roleText = ''
      roles.forEach((role) => {
        roleText += role.description
      })
      return roleText
    },
    addUser () {
      console.log('add')
      // this.showAddUser = true
      this.$refs['addUserDialog'].visible = true
    },
    editUser (user) {
      console.log(user)
      // this.showEditUser = true
      this.$refs['editUserDialog'].visible = true
      this.$refs['editUserDialog'].setFormField(user)
    },
    refreshQuery () {
      this.queryAllUser()
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
    deleteUserById (id) {
      deleteUser(id).then((res) => {
        console.log(res)
        let { code, desc } = res
        if (code === 0) {
          this.queryAllUser()
          this.$notify.success({
            message: desc
          })
        } else {
          this.$notify.error({
            message: desc
          })
        }
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
