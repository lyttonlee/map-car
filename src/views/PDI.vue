<template>
  <div class="page">
    <h1 class="title">PDA操作</h1>
    <div class="con">
      <div class="item">
        <el-autocomplete
          class="inline-input"
          v-model="vin"
          :fetch-suggestions="querySearch"
          placeholder="请输入车辆VIN"
          :trigger-on-focus="false"
          @select="handleSelect"
          popper-class="poper"
          :debounce="500"
        >
        <div slot="prepend" class="prepend">车辆VIN</div></el-autocomplete>
      </div>
      <div class="item">
        <el-input v-model="locator" class="inline-input">
          <div slot="prepend" placeholder="请输入定位器标签" class="prepend">定位器标签</div>
        </el-input>
      </div>
      <div class="item">
        <el-button :disabled="!canSubmit" @click="doBindCar" type="primary" round class="submit-btn">绑定</el-button>
      </div>
    </div>

  </div>
</template>
<script>
import {
  bindCar,
  getDimCars
} from '../api/pdi'
export default {
  data () {
    return {
      vin: '',
      locator: '',
    }
  },
  computed: {
    canSubmit () {
      if (this.vin && this.locator) {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    handleSelect (ev) {
      console.log(ev)
    },
    doBindCar () {
      const param = {
        locatorSn: this.locator,
        vehicleIdentification: this.vin
      }
      bindCar(param).then((res) => {
        console.log(res)
        const { code, desc } = res
        if (code === 0) {
          this.vin = ''
          this.locator = ''
          this.$notify.success({
            message: desc
          })
        } else {
          this.$notify.error({
            message: desc
          })
        }
      })
    },
    querySearch (string, cb) {
      if (!string) return
      const param = {
        dim: string
      }
      getDimCars(param).then((res) => {
        console.log(res)
        const { code, result } = res
        if (code === 0) {
          const cars = result.map((item) => {
            return {
              value: item
            }
          })
          cb(cars)
        } else {
          const r = []
          cb(r)
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.page {
  .title {
    text-align: left;
    padding-left: 40px;
    padding-bottom: 20px;
    border-bottom: .5px solid #666;
  }
  .con {
    display: flex;
    .item {
      width: 400px;
      .submit-btn {
        width: 120px;
      }
      .inline-input {
        width: 350px;
        .prepend {
          color: #ccc;
        }
      }
    }
  }
}
</style>
