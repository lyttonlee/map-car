<template>
  <div class="upload">
    <!-- <el-upload
    class="avatar-uploader"
    action="https://jsonplaceholder.typicode.com/posts/"
    :show-file-list="false"
    :on-success="handleAvatarSuccess"
    :before-upload="beforeAvatarUpload">
      <img v-if="imageUrl" :src="imageUrl" class="avatar">
      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload> -->
    <img v-if="imageUrl" :src="imageUrl" class="avatar">
    <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    <input type="file" class="input" @change="upload" >
  </div>
</template>
<script>
import {
  uploadImage
} from '../api/common'
export default {
  props: {
    options: {
      type: Object
    },
    avatar: {
      type: String,
      default: '',
    }
  },
  model: {
    prop: 'avatar',
    event: 'uploadOk'
  },
  data () {
    return {
      imageUrl: ''
    }
  },
  watch: {
    avatar (newValue) {
      if (newValue) {
        this.imageUrl = newValue
      }
    }
  },
  methods: {
    handleAvatarSuccess (res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
    },
    beforeAvatarUpload (file) {
      console.log(file)
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 或者 PNG 格式!')
        return
      }
      this.compressImg(file)
    },
    upload (ev) {
      console.log(ev)
      this.beforeAvatarUpload(ev.target.files[0])
    },
    compressImg (file) {
      // 计算压缩率
      let rate = (file.size / 1024 / 1024).toFixed(2)
      if (rate < 1) {
        rate = 1
      }
      let reader = new FileReader()
      reader.readAsDataURL(file)
      let img = new Image()
      reader.onload = (ev) => {
        // console.log(ev)
        img.src = ev.target.result
      }
      img.onload = () => {
        let canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d')
        console.log(img.width)
        console.log(rate)
        let targetW = img.width / rate
        let targetH = img.height / rate
        let anw = document.createAttribute('width')
        let anh = document.createAttribute('height')
        anw.nodeValue = targetW
        anh.nodeValue = targetH
        canvas.setAttributeNode(anw)
        canvas.setAttributeNode(anh)
        // ctx.clearRect(0, 0, targetW, targetH)
        ctx.drawImage(img, 0, 0, targetW, targetH)
        console.log(targetW)
        console.log(canvas)
        canvas.toBlob((blod) => {
          console.log(blod)
          let fd = new FormData()
          fd.append(file.name, blod, file.name)
          console.log(fd)
          uploadImage(fd).then((res) => {
            console.log(res)
            let { code, result, desc } = res
            if (code === 0) {
              this.imageUrl = result
              this.$emit('uploadOk', this.imageUrl)
            } else {
              this.$notify.error({
                message: desc
              })
            }
          })
        }, file.type || 'image/png', 1 / rate)
      }
    },
  }
}
</script>
<style lang="less">
.upload {
  width: 120px;
  // height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  .input {
    // display: none;
    cursor: pointer;
    position: absolute;
    font-size: 100px;
    right: 0;
    top: 0;
    opacity: 0;
  }
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 120px;
  // height: 120px;
  display: block;
}
</style>
