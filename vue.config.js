const { defineConfig } = require('@vue/cli-service')
const webpack = require("webpack");
module.exports = defineConfig({
  // 生产环境使用相对路径，确保资源能正确加载
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  devServer:{
    // 端口号的配置
		port:1024  
	},
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: {
    plugins: [
        new webpack.ProvidePlugin({
            $:"jquery",
            jQuery:"jquery",
            "windows.jQuery":"jquery"
        })
    ]
}
})

