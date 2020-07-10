<template>
  <div class="set">
    <div class="list">
      <template v-for="(option, index) in systemOptions">
        <div :key="index" class="item">
          <el-card>
            <div class="title">{{map[option.type]}}</div>
            <div v-if="typeof option.param === 'number'" class="content">
              <!-- {{$moment.duration(confirmOption.param * 1, 'ms').humanize()}} -->
              {{formatTime(option.param * 1 / 1000)}}
            </div>
            <div v-if="typeof option.param === 'boolean'" class="content">
              <!-- {{$moment.duration(confirmOption.param * 1, 'ms').humanize()}} -->
              {{option.param ? '开启' : '关闭'}}
            </div>
            <div class="action">
              <el-button @click="editOption(option)" style="width: 100%" size="mini" round type="info">修改</el-button>
            </div>
          </el-card>
        </div>
      </template>
      <!-- <div class="item">
        <el-card>
          <div class="title">科室自动确认时间</div>
          <div class="content">
            {{formatTime(confirmOption.param * 1 / 1000)}}
          </div>
          <div class="action">
            <el-button @click="editOption(confirmOption)" style="width: 100%" size="mini" round type="info">修改</el-button>
          </div>
        </el-card>
      </div> -->
    </div>
    <!-- <div v-if="showModal" class="modal"></div> -->
    <Modal ref="modal" v-if="showModal"  width="30%" @quit="quit" @ok="handleOk">
      <!-- {{showingOption}} -->
      <h3>{{map[showingOption.type]}}</h3>
      <el-input v-if="showingOption.type === 2 || showingOption.type === 3" size="small"  :placeholder="map[showingOption.type]" v-model="confirmTime">
        <template slot="append">{{'分钟'}}</template>
      </el-input>
      <div v-if="showingOption.type === 5">
        <el-switch v-model="switchValue" active-text="当处于特定区域时车辆自动解绑" inactive-text="车辆只能手动解绑" ></el-switch>
      </div>
      <div></div>
    </Modal>
  </div>
</template>
<script>
import {
  getSystemOption,
  updateConfirmTime,
} from '../../../api/option'
import Modal from '@/components/Modal'
import {
  formatTime,
} from '../../../utils/utils'
export default {
  components: {
    // Modal: () => import('../../../components/Modal')
    Modal
  },
  data () {
    return {
      showModal: false,
      systemOptions: [],
      confirmOption: '',
      showingOption: '',
      confirmTime: '',
      switchValue: false,
      // loading: false
      map: {
        2: '自动确认开始维修',
        3: '自动确认结束维修',
        5: '自动解绑',
      }
    }
  },
  methods: {
    formatTime,
    getInitOption () {
      getSystemOption().then((res) => {
        let { code, result } = res
        if (code === 0) {
          // console.log(result)
          this.systemOptions = result.filter((option) => {
            return option.type === 2 || option.type === 3 || option.type === 5
          })
          this.systemOptions.sort((a, b) => a.type - b.type)
          // this.confirmOption = this.systemOptions.find((option) => option.type === 2)
        }
      })
    },
    editOption (option) {
      // console.log(option)
      this.showingOption = option
      if (option.type === 2 || option.type === 3) {
        this.confirmTime = this.$moment.duration(this.showingOption.param * 1, 'ms').asMinutes()
      }
      if (option.type === 5) {
        this.switchValue = option.param
      }
      this.showModal = true
    },
    quit () {
      this.confirmTime = ''
      this.showingOption = ''
      this.showModal = false
    },
    handleOk () {
      // console.log('todo')
      // this.loading = true
      const isTime = (time) => {
        if (time * 1 >= 1 && time * 1 <= 60) {
          return true
        } else {
          // this.loading = false
          this.$refs['modal'].isLoading = false
          return false
        }
      }
      let time = this.confirmTime * 60 * 1000
      let param
      if (this.showingOption.type === 5) {
        param = {
          param: this.switchValue,
          type: this.showingOption.type
        }
      }
      if (this.showingOption.type === 2 || this.showingOption.type === 3) {
        if (this.confirmTime && isTime(this.confirmTime)) {
          param = {
            param: time,
            type: this.showingOption.type
          }
        } else {
          this.$notify.error({
            message: '自动确认时间应在1-60分钟之内'
          })
          return
        }
      }
      updateConfirmTime(param).then((res) => {
        let { code, desc } = res
        if (code === 0) {
          this.$notify.success({
            message: desc
          })
          this.showingOption = ''
          this.quit()
          this.getInitOption()
        } else {
          this.$notify.error({
            message: desc
          })
          this.$refs['modal'].isLoading = false
        }
      }).catch((err) => {
        console.log(err)
        this.$refs['modal'].isLoading = false
      })
    }
  },
  created () {
    this.getInitOption()
  }
}
</script>
<style lang="less" scoped>
@import '../../../assets/less/color.less';
.page {
  .list {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto;
    column-gap: 15px;
    row-gap: 15px;
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
    .item {
      box-sizing: border-box;
      .title {
        padding-bottom: 10px;
        // border-bottom: 1px solid #fefefe;
      }
      .content {
        font-size: 2rem;
        color: @primary-color;
        padding-bottom: 10px;
      }
      .action {
        text-align: right;
      }
    }
  }
}
</style>
