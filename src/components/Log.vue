<template>
  <div class="item-box">
    <!-- <div :class="isLast ? 'border-end' : 'border'"></div> -->
    <div :class="computeBoderCss()"></div>
    <div class="log">
      <div class="date">
        <div class="date-time">{{$moment(log.time).format('HH:mm')}}</div>
        <div class="date-md">{{$moment(log.time).format('MM-DD')}}</div>
      </div>
      <div :class="isLast ? 'point-end' : 'point'"></div>
      <div class="content">
        <div class="info">{{log.detail}}</div>
        <div v-if="log.subLogs" >
          <template v-for="(subLog, index) in log.subLogs">
            <div class="sublog" :key="index">
              <div @mouseenter="changeShowInfobox(1, index)" @mouseleave="changeShowInfobox(2, index)">
                <zx-icon customClass="process-icon" :type="computeIcon(subLog.name)"></zx-icon>
                <span class="log-time">{{parseData(subLog.param).duration + 'h'}}</span>
                <div v-if="showInfobox && showIndex === index" class="infobox">
                  <div class="box-info">
                    <div class="start">开始时间: {{parseData(subLog.param).start}}</div>
                    <div class="end">结束时间: {{parseData(subLog.param).end}}</div>
                    <div v-if="parseData(subLog.param).note">确认信息: {{parseData(subLog.param).note}}</div>
                  </div>
                  <div class="box-arrow"></div>
                </div>
              </div>
            </div>
          </template>
        </div>
        <div v-else class="author">
          <div style="margin-bottom: 5px" v-if="log.param">问题- {{JSON.parse(log.param).note}}</div>
          <div>操作员- {{log.nickName}}</div>
        </div>
      </div>
      <!-- <div class="right">
        <div class="date-right">{{log.param && JSON.parse(log.param).stay ? $moment.duration(JSON.parse(log.param).stay / 1000, 's').asHours().toFixed(2) + 'h' : ''}}</div>
      </div> -->
    </div>
  </div>
</template>
<script>
// import {
//   com
// } from '../utils/utils'
export default {
  props: {
    log: {
      required: true,
      type: Object
    },
    isLast: {
      default: false
    },
    uniqueItem: {
      default: false
    },
    isStart: {
      default: false
    }
  },
  data () {
    return {
      showInfobox: false,
      icons: [{ name: 'pa', icon: 'zx-PA' }, { name: 'we', icon: 'zx-WE' }, { name: 'af', icon: 'zx-AF' }, { name: 'pq', icon: 'zx-PQ' }, { name: 'dhec', icon: 'zx-DHEC' }],
      showIndex: ''
    }
  },
  methods: {
    computeBoderCss () {
      if (this.uniqueItem && this.isLast) {
        return 'border-unique'
      } else if (this.isLast) {
        return 'border-end'
      } else if (this.isStart) {
        return 'border-start'
      } else {
        return 'border'
      }
    },
    computeIcon (type) {
      let curType = type.toLowerCase()
      let icon = this.icons.find((item) => item.name === curType).icon
      return icon
    },
    changeShowInfobox (type, index) {
      if (type === 1) {
        this.showInfobox = true
        this.showIndex = index
      }
      if (type === 2) {
        this.showInfobox = false
        this.showIndex = ''
      }
    },
    parseData (data) {
      let curData = JSON.parse(data)
      // console.log(curData)
      let start = this.$moment(curData.in.time).format('YYYY-MM-DD HH:mm')
      let end = curData.out ? this.$moment(curData.out.time).format('YYYY-MM-DD HH:mm') : '维修中···'
      let duration = curData.out ? this.$moment.duration(curData.out.time - curData.in.time, 'ms').asHours().toFixed(2) : this.$moment.duration(this.$moment().valueOf() - curData.in.time, 'ms').asHours().toFixed(2)
      let note = curData.out && curData.out.param ? JSON.parse(curData.out.param).note : ''
      // console.log(duration)
      return {
        start,
        end,
        duration,
        note
      }
    }
  }
}
</script>
<style lang="less" scoped>
@import '../assets/less/color.less';
.item-box {
  display: grid;
  grid-template-columns: 0 auto;
  grid-template-rows: auto;
  text-align: left;
  .log {
    display: grid;
    grid-template-columns: 70px 10px 55%;
    grid-template-rows: auto;
    // column-gap: 10px;
    // margin-top: 15px;
    padding: 10px 5px;
    // background: @page-background-opacity;
    // border-radius: 10px;
    box-sizing: border-box;
    // align-items: center;
    .point {
      // position: absolute;
      align-self: center;
      background-color: @info;
      border-radius: 50%;
      height: 10px;
      z-index: 2;
      // display: flex;
      // justify-content: center;
      // align-items: center;
    }
    .point-end {
      align-self: center;
      background-color: @primary-color;
      border-radius: 50%;
      height: 10px;
      z-index: 2;
    }
    .date {
      // border-right: 1px solid #666;
      align-self: center;
      text-align: center;
      .date-time {
        font-size: 1rem;
        font-weight: bold;
        color: @primary-color;
      }
      .date-md {
        font-size: .8rem;
        color: rgb(187, 187, 187);
      }
    }
    .content {
      align-self: center;
      padding-top: 8px;
      padding-left: 10px;
      // border-left: 1px solid @info;
      position: relative;
      // left: -5px;
      // border-right: 1px solid #666;
      .info {
        //..
        font-size: .8rem;
        // margin-bottom: 3px;
      }
      .sublog {
        position: relative;
        padding-left: 20px;
        box-sizing: border-box;
        // margin-top: 10px;
        .log-time {
          padding-left: 15px;
          font-size: 1.3rem;
          font-weight: bold;
          color: @primary-color;
          cursor: pointer;
        }
        .infobox {
          position: absolute;
          // position: relative;
          left: -65px;
          top: -70px;
          z-index: 3;
          .box-info {
            width: 180px;
            height: 50px;
            background: @info;
            border-radius: 8px;
            padding: 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .box-arrow {
            width: 10px;
            height: 10px;
            background: @info;
            margin: 0 auto;
            transform: rotate(45deg);
            position: relative;
            top: -5px;
          }
        }
      }
      .author {
        color: rgb(212, 212, 212);
        font-size: .7rem;
        padding-top: 10px;
      }
      .process-icon {
        font-size: 1.3rem;
        color: rgb(29, 211, 29);
        cursor: pointer;
        // vertical-align: middle;
      }
    }
    .right {
      text-align: left;
      .date-right {
        font-size: 1.1rem;
        color: @primary-color;
      }
    }
  }
  .border {
    position: relative;
    left: 79px;
    border: 1px solid @info;
    height: 100%;
    // top: 50%;
  }
  .border-start {
    position: relative;
    left: 79px;
    border: 1px solid @info;
    height: 100%;
    top: 50%;
  }
  .border-end {
    // border: none;
    position: relative;
    left: 79px;
    border: 1px solid @info;
    height: 50%;
    top: 0;
  }
  .boder-unique {
    border: none;
  }
}

</style>
