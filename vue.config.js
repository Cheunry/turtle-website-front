const { defineConfig } = require('@vue/cli-service')
const webpack = require("webpack");
const CompressionWebpackPlugin = require('compression-webpack-plugin');

module.exports = defineConfig({
  // 生产环境关闭 SourceMap，显著减小包体积
  productionSourceMap: false,
  
  // 生产环境使用相对路径，确保资源能正确加载
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  devServer:{
    // 端口号的配置
		port:1024  
	},
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: config => {
    const plugins = [
        new webpack.ProvidePlugin({
            $:"jquery",
            jQuery:"jquery",
            "windows.jQuery":"jquery"
        })
    ];

    // 生产环境添加 Gzip 压缩
    if (process.env.NODE_ENV === 'production') {
      plugins.push(
        new CompressionWebpackPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i,
          threshold: 10240, // 大于 10kb 的文件才压缩
          minRatio: 0.8
        })
      );
    }
    config.plugins = [...config.plugins, ...plugins];
  }
})
