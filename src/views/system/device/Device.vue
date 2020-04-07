<template>
  <div class="page">
    <div class="search">
      <el-input v-model="search" @blur="doSearch" placeholder="请输入要查找的设备编号！"></el-input>
    </div>
    <div class="add">
      <!-- <el-button @click="addDevice">添加标签</el-button> -->
    </div>
    <el-table :data="devices" style="width: 100%;background:#fff0" size="mini">
      <el-table-column label="设备编号" prop="sn"></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <div :class="scope.row.bind === true ? 'success' : ''">{{scope.row.bind === true ? '已绑定' : '未绑定'}}</div>
        </template>
      </el-table-column>
      <el-table-column label="电量">
        <template slot-scope="scope">
          <div :class="scope.row.power && scope.row.power > 20 ? '' : 'error'">{{scope.row.power ? scope.row.power + '%' : '未知(已离线)'}}</div>
        </template>
      </el-table-column>
      <el-table-column label="位置">
        <template slot-scope="scope">
          <div :class="scope.row.address ? '' : 'error'">{{scope.row.address ? scope.row.address : '未知区域'}}</div>
        </template>
      </el-table-column>
      <el-table-column label="记录时间">
        <template slot-scope="scope">
          <div>{{$moment(scope.row.position_time).format('YYYY-MM-DD HH:mm:ss')}}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button-group>
            <el-button round type="primary" size="mini" @click="sendVoice(scope.row.name)">发声</el-button>
            <!-- <el-button round type="danger" size="mini" @click="deleteDevice(scope.row)">删除</el-button> -->
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pagination"
      :hide-on-single-page="true"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.current"
      @current-change="pageChanged"
      layout="total, prev, pager, next">
    </el-pagination>
    <AddDeviceDialog ref="addDeviceDialog" />
  </div>
</template>
<script>
import AddDeviceDialog from './AddDeviceDialog'
import {
  queryUWB
} from '../../../api/car'
import {
  mapState
} from 'vuex'
export default {
  components: {
    AddDeviceDialog
  },
  data () {
    return {
      devices: [],
      pagination: {
        pageSize: 15,
        total: 0,
        current: 1,
      },
      search: '',
    }
  },
  computed: {
    ...mapState(['productLineId'])
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
    },
    // 获取标签列表
    getDeviceList (param) {
      console.log('query')
      let queryParam
      if (param) {
        queryParam = param
      } else {
        queryParam = {
          productLineId: this.productLineId,
          pageSize: this.pagination.pageSize,
        }
      }
      queryUWB(queryParam).then((res) => {
        console.log(res)
        let { code, result } = res
        if (code === 0) {
          this.devices = result.resultList
          this.pagination.total = result.pageObject.totalSize
          this.pagination.current = result.pageObject.currentPage
        }
      })
    },
    pageChanged (ev) {
      console.log(ev)
      let param = {
        productLineId: this.productLineId,
        pageSize: this.pagination.pageSize,
        currentPage: ev
      }
      if (this.search) {
        param.dimMatch = this.search
      }
      this.getDeviceList(param)
    },
    doSearch () {
      console.log('do')
      if (this.search) {
        let param = {
          productLineId: this.productLineId,
          pageSize: this.pagination.pageSize,
          currentPage: 1,
          dimMatch: this.search
        }
        this.getDeviceList(param)
      } else {
        this.getDeviceList()
      }
    },
  },
  created () {
    this.getDeviceList()
  }
}
</script>
<style lang="less" scoped>
@import '../../../assets/less/color.less';
.page {
  .search {
    margin: 15px 0;
  }
  .pagination {
    width: 100%;
    background: @base-background;
    padding: 5px 0;
    margin-top: 15px;
    border-radius: 10px;
  }
  .add {
    margin:  10px 0;
    text-align: left;
  }
}
</style>
