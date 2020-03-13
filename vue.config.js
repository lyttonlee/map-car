module.exports = {
  lintOnSave: true,
  devServer: {
    overlay: {
      error: false,
      warnings: true
    },
    proxy: {
      '/api': {
        // target: 'http://cdzyyc.xicp.io:7578',
        target: 'http://192.168.1.205:8089',
        changeOrigin: true
      },
      'common': {
        // target: 'http://cdzyyc.xicp.io:7578',
        target: 'http://192.168.1.205:8089',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://cdzyyc.xicp.io:7578',
        changeOrigin: true
      }
    }
  },
}
