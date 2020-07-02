<template>
  <div class="set">
    <div class="list">
      <template v-for="(option, index) in systemOptions">
        <div :key="index" class="item">
          <el-card>
            <div class="title">{{map[option.type]}}</div>
            <div class="content">
              <!-- {{$moment.duration(confirmOption.param * 1, 'ms').humanize()}} -->
              {{formatTime(option.param * 1 / 1000)}}
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
    <Modal ref="modal" v-if="showModal" :loading="loading" width="30%" @quit="quit" @ok="handleOk">
      <!-- {{showingOption}} -->
      <h3>{{map[showingOption.type]}}</h3>
      <el-input size="small"  :placeholder="map[showingOption.type]" v-model="confirmTime">
        <template slot="append">{{'分钟'}}</template>
      </el-input>
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
      // loading: false
      map: {
        2: '自动确认开始维修',
        3: '自动确认结束维修'
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
            return option.type === 2 || option.type === 3
          })
          this.systemOptions.sort((a, b) => a.type - b.type)
          // this.confirmOption = this.systemOptions.find((option) => option.type === 2)
        }
      })
    },
    editOption (option) {
      // console.log(option)
      this.showingOption = option
      this.confirmTime = this.$moment.duration(this.showingOption.param * 1, 'ms').asMinutes()
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
      if (this.confirmTime && isTime(this.confirmTime)) {
        let time = this.confirmTime * 60 * 1000
        let param = {
          param: time,
          type: this.showingOption.type
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
      } else {
        this.$notify.error({
          message: '自动确认时间应在1-60分钟之内'
        })
      }
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
