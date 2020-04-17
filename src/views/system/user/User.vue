<template>
  <div class="page">
    <div class="head">
      <el-button type="primary" size="mini" round @click="addUser">添加用户</el-button>
    </div>
    <!-- <div class="list">
      <el-table :data="users" style="width: 100%;background:#fff0" size="mini">
        <el-table-column label="用户名" prop="username"></el-table-column>
        <el-table-column label="昵称" prop="nickname"></el-table-column>
        <el-table-column label="角色">
          <template slot-scope="scope">
            {{formatRole(scope.row.roles)}}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <div :class="isOnline(scope.row.lastOnlineTime) ? 'success' : ''">
              <zx-icon type="zx-denglu"></zx-icon>
              <span>{{isOnline(scope.row.lastOnlineTime) ? '在线' : '离线'}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="最后在线时间">
          <template slot-scope="scope">
            <div v-if="!isOnline(scope.row.lastOnlineTime)" >
              <span>{{scope.row.lastOnlineTime ? $moment(scope.row.lastOnlineTime).format('YYYY-MM-DD HH:mm:ss') : '无记录'}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上次登录平台" prop="lastOnlinePlatform">
        </el-table-column>
        <el-table-column label="创建时间">
          <template slot-scope="scope">
            <div>{{$moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button-group>
              <el-button type="primary" round size="mini" @click="editUser(scope.row)">编辑</el-button>
              <el-button type="danger" round size="mini" @click="deleteUserById(scope.row.id)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div> -->
    <div class="list">
      <h3 class="title">PC</h3>
      <el-table :data="pc" style="width: 100%;background:#fff0" size="mini">
        <el-table-column label="用户名" prop="username"></el-table-column>
        <el-table-column label="昵称" prop="nickname"></el-table-column>
        <el-table-column label="角色">
          <template slot-scope="scope">
            {{formatRole(scope.row.roles)}}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <div :class="isOnline(scope.row.lastOnlineTime) ? 'success' : ''">
              <zx-icon type="zx-denglu"></zx-icon>
              <span>{{isOnline(scope.row.lastOnlineTime) ? '活跃' : '不活跃'}}</span>
              <!-- <span>{{$moment(scope.row.lastOnlineTime).format('YYYY-MM-DD HH:mm:ss')}}</span> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column label="后操作时间">
          <template slot-scope="scope">
            <div v-if="!isOnline(scope.row.lastOnlineTime)" >
              <span>{{scope.row.lastOnlineTime ? $moment(scope.row.lastOnlineTime).format('YYYY-MM-DD HH:mm:ss') : '无记录'}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上次登录平台" prop="lastOnlinePlatform">
        </el-table-column>
        <!-- <el-table-column label="头像">
          <template slot-scope="scope">
            <img style="width: 30px" :src="scope.row.imageUrl" alt="">
          </template>
        </el-table-column> -->
        <el-table-column label="创建时间">
          <template slot-scope="scope">
            <div>{{$moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button-group>
              <el-button type="primary" round size="mini" @click="editUser(scope.row)">编辑</el-button>
              <el-button type="danger" round size="mini" @click="deleteUserById(scope.row.id)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="list">
      <h3 class="title">VQ</h3>
      <el-table :data="vq" style="width: 100%;background:#fff0" size="mini">
        <el-table-column label="用户名" prop="username"></el-table-column>
        <el-table-column label="昵称" prop="nickname"></el-table-column>
        <el-table-column label="角色">
          <template slot-scope="scope">
            {{formatRole(scope.row.roles)}}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <div :class="isOnline(scope.row.lastOnlineTime) ? 'success' : ''">
              <zx-icon type="zx-denglu"></zx-icon>
              <span>{{isOnline(scope.row.lastOnlineTime) ? '活跃' : '不活跃'}}</span>
              <!-- <span>{{$moment(scope.row.lastOnlineTime).format('YYYY-MM-DD HH:mm:ss')}}</span> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column label="最后操作时间">
          <template slot-scope="scope">
            <div v-if="!isOnline(scope.row.lastOnlineTime)" >
              <span>{{scope.row.lastOnlineTime ? $moment(scope.row.lastOnlineTime).format('YYYY-MM-DD HH:mm:ss') : '无记录'}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上次登录平台" prop="lastOnlinePlatform">
        </el-table-column>
        <!-- <el-table-column label="头像">
          <template slot-scope="scope">
            <img style="width: 30px" :src="scope.row.imageUrl" alt="">
          </template>
        </el-table-column> -->
        <el-table-column label="创建时间">
          <template slot-scope="scope">
            <div>{{$moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button-group>
              <el-button type="primary" round size="mini" @click="editUser(scope.row)">编辑</el-button>
              <el-button type="danger" round size="mini" @click="deleteUserById(scope.row.id)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="list">
      <h3 class="title">科室</h3>
      <el-table :data="section" style="width: 100%;background:#fff0" size="mini">
        <el-table-column label="用户名" prop="username"></el-table-column>
        <el-table-column label="昵称" prop="nickname"></el-table-column>
        <el-table-column label="角色">
          <template slot-scope="scope">
            {{formatRole(scope.row.roles)}}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <div :class="isOnline(scope.row.lastOnlineTime) ? 'success' : ''">
              <zx-icon type="zx-denglu"></zx-icon>
              <span>{{isOnline(scope.row.lastOnlineTime) ? '活跃' : '不活跃'}}</span>
              <!-- <span>{{$moment(scope.row.lastOnlineTime).format('YYYY-MM-DD HH:mm:ss')}}</span> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column label="后操作时间">
          <template slot-scope="scope">
            <div v-if="!isOnline(scope.row.lastOnlineTime)" >
              <span>{{scope.row.lastOnlineTime ? $moment(scope.row.lastOnlineTime).format('YYYY-MM-DD HH:mm:ss') : '无记录'}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="上次登录平台" prop="lastOnlinePlatform">
        </el-table-column>
        <!-- <el-table-column label="头像">
          <template slot-scope="scope">
            <img style="width: 30px" :src="scope.row.imageUrl" alt="">
          </template>
        </el-table-column> -->
        <el-table-column label="创建时间">
          <template slot-scope="scope">
            <div>{{$moment(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button-group>
              <el-button type="primary" round size="mini" @click="editUser(scope.row)">编辑</el-button>
              <el-button type="danger" round size="mini" @click="deleteUserById(scope.row.id)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <AddUser @addedUser="refreshQuery" ref="addUserDialog" />
    <EditUser ref="editUserDialog" />
  </div>
</template>
<script>
import avatar from '@/assets/img/avatar.jpg'
import AddUser from './AddUserDialog'
import EditUser from './EditUserDIalog'
import {
  mapActions
} from 'vuex'
import {
  queryUsers,
  deleteUser
} from '../../../api/user'
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
      avatar,
      pc: [],
      vq: [],
      section: [],
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
    isOnline (onlineTime) {
      let now = new Date()
      let duration = now.valueOf() - onlineTime
      // console.log(duration)
      if (duration > 5 * 60 * 1000) {
        return false
      } else {
        return true
      }
    },
    addUser () {
      console.log('add')
      // this.showAddUser = true
      this.$refs['addUserDialog'].visible = true
    },
    editUser (user) {
      // console.log(user)
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
          this.pc = this.users.filter((user) => user.roles[0].id === 2)
          this.vq = this.users.filter((user) => user.roles[0].id === 3 || user.roles[0].id === 4)
          this.section = this.users.filter((user) => user.roles[0].id >= 5 && user.roles[0].id <= 8)
        }
      })
    },
    deleteUserById (id) {
      deleteUser(id).then((res) => {
        // console.log(res)
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
@import '../../../assets/less/color.less';
.page {
  .head {
    margin: 20px 0;
    text-align: left;
  }
  .list {
    margin-bottom: 20px;
    background: @base-background;
    border-radius: 10px;
    .title {
      color: @primary-color;
      padding-top: 15px;
    }
  }
}
</style>
