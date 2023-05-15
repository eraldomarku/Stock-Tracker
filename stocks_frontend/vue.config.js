const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '0.0.0.0',
    port: 7858,
    compress: true,
    public: 'store-client-nestroia1.c9users.io' // That solved it
  }
})
