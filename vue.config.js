const webpack = require('webpack')
module.exports = {
  assetsDir: 'static',
  lintOnSave: true,
  configureWebpack: {
    // externals: {
    //   introJs: ['intro.js', 'introJs']
    // },
    plugins: [
      new webpack.ProvidePlugin({
        // other modules
        introJs: ['intro.js', 'introJs']
      })
    ],
  },
  transpileDependencies: ['vue-socket.io'],
  // css: {
  //   loaderOptions: {
  //     postcss: {
  //       // ..
  //       plugins: [
  //         require('autoprefixer')({
  //           grid: 'autoplace',
  //           // overrideBrowserslist: ['last 15 versions']
  //         })
  //       ]
  //     }
  //   }
  // },
  devServer: {
    overlay: {
      error: false,
      warnings: true
    },
    proxy: {
      '/api': {
        // target: 'http://cdzyyc.xicp.io:7578',
        // target: 'http://192.168.1.205:8089',
        target: 'http://192.168.1.247:8089',
        changeOrigin: true
      },
      '/common': {
        // target: 'http://cdzyyc.xicp.io:7578',
        // target: 'http://192.168.1.205:8089',
        target: 'http://192.168.1.247:8089',
        changeOrigin: true
      },
      '/auth': {
        // target: 'http://192.168.1.205:8089',
        target: 'http://192.168.1.247:8089',
        // target: 'http://cdzyyc.xicp.io:7578',
        changeOrigin: true
      }
    }
  },
}
