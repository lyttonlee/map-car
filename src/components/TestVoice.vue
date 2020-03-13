<template>
  <div>
    <audio ref="audio" style="display: none" src="mp3/alarm.mp3" control></audio>
  </div>
</template>
<script>
export default {
  mounted () {
    this.$refs['audio'].play().then(() => {
      console.log('可以自动播放')
    }).catch(() => {
      console.log('不能自动播放')
      this.$alert('该系统需要获取播放声音的权限', '声音授权', {
        center: true,
        confirmButtonText: '授权播放语音',
        callback: (action) => {
          if (action === 'confirm') {
            this.$refs['audio'].play()
          }
        },
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false
      })
    })
  }
}
</script>
