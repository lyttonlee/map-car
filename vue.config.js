const webpack = require('webpack')
const CompressPlugin = require('compression-webpack-plugin')
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
      }),
      new CompressPlugin({
        test: /\.js$|\.html$|\.css/,
        threshold: 10240,
        deleteOriginalAssets: false
      })
    ],
  },
  transpileDependencies: ['vue-socket.io'],
  css: {
    loaderOptions: {
      postcss: {
        // ..
        plugins: [
          require('autoprefixer')({
            grid: 'autoplace',
            // overrideBrowserslist: ['last 15 versions']
          })
        ]
      }
    }
  },
  devServer: {
    overlay: {
      error: false,
      warnings: true
    },
    proxy: {
      '/api': {
        // target: 'http://cdzyyc.xicp.io:7578',
        // target: 'http://10.110.73.208:8089',
        target: 'http://192.168.1.50:8089',
        // target: 'http://192.168.1.247:8089',
        changeOrigin: true
      },
      '/common': {
        // target: 'http://cdzyyc.xicp.io:7578',
        // target: 'http://10.110.73.208:8089',
        target: 'http://192.168.1.50:8089',
        // target: 'http://192.168.1.247:8089',
        changeOrigin: true
      },
      '/auth': {
        // target: 'http://10.110.73.208:8089',
        // target: 'http://192.168.1.247:8089',
        target: 'http://192.168.1.50:8089',
        // target: 'http://cdzyyc.xicp.io:7578',
        changeOrigin: true
      },
      '/mobile': {
        // target: 'http://10.110.73.208:8089',
        // target: 'http://192.168.1.247:8089',
        target: 'http://192.168.1.50:8089',
        // target: 'http://cdzyyc.xicp.io:7578',
        changeOrigin: true
      },
    }
  },
}
