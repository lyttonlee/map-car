<template>
  <div class="set">
    <div class="list">
      <div class="item">
        <el-card>
          <div class="title">科室自动确认时间</div>
          <div class="content">
            {{$moment.duration(confirmOption.param * 1, 'ms').humanize()}}
          </div>
          <div class="action">
            <el-button @click="editOption(confirmOption)" style="width: 100%" size="mini" round type="info">修改</el-button>
          </div>
        </el-card>
      </div>
    </div>
    <!-- <div v-if="showModal" class="modal"></div> -->
    <Modal v-if="showModal" width="30%" @quit="quit" @ok="handleOk">
      <!-- {{showingOption}} -->
      <h3>修改科室自动确认时间</h3>
     <el-input size="small"  placeholder="请输入科室自动确认时间" v-model="confirmTime">
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
export default {
  components: {
    Modal: () => import('../../../components/Modal')
  },
  data () {
    return {
      showModal: false,
      systemOptions: [],
      confirmOption: '',
      showingOption: '',
      confirmTime: '',
    }
  },
  methods: {
    getInitOption () {
      getSystemOption().then((res) => {
        let { code, result } = res
        if (code === 0) {
          // console.log(result)
          this.systemOptions = result
          this.confirmOption = this.systemOptions.find((option) => option.type === 2)
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
      const isTime = (time) => {
        if (time * 1 > 0 && time * 1 <= 60) {
          return true
        } else {
          return false
        }
      }
      if (this.confirmTime && isTime(this.confirmTime)) {
        let time = this.confirmTime * 60 * 1000
        updateConfirmTime(time).then((res) => {
          let { code, desc } = res
          if (code === 0) {
            this.$notify.success({
              message: desc
            })
            this.quit()
            this.getInitOption()
          } else {
            this.$notify.error({
              message: desc
            })
          }
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
