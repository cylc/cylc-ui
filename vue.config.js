// optional file, loaded automatically by @vue/cli-service if present next to package.json
const webpack = require('webpack')
const path = require('path')

module.exports = {
  publicPath: '',
  outputDir: 'dist',
  indexPath: 'index.html',
  transpileDependencies: ['vuetify'],
  runtimeCompiler: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          PACKAGE_JSON: '"' + escape(JSON.stringify(require('./package.json'))) + '"'
        }
      })
    ]
  },
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'test') {
      config.module.rule('istanbul')
        .test(/\.js$/)
        .include.add(path.resolve('src')).end()
        .use('istanbul-instrumenter-loader')
        .loader('istanbul-instrumenter-loader')
        .options({ esModules: true })
        .before('babel-loader')

      config.output
        .devtoolModuleFilenameTemplate('[absolute-resource-path]')
        .devtoolFallbackModuleFilenameTemplate('[absolute-resource-path]?[hash]')
    }

    // https://webpack.js.org/configuration/devtool/
    if (process.env.NODE_ENV !== 'production') {
      if (process.env.NODE_ENV === 'test') {
        config.devtool('eval')
      } else {
        config.devtool('inline-cheap-module-source-map')
      }
    }

    // set up aliases for mock services, used when the offline mode is used
    const isOffline = process.env.NODE_ENV === 'offline'
    const workflowService = isOffline
      ? '@/services/mock/workflow.service.mock'
      : '@/services/workflow.service'
    config.resolve.alias.set('workflow-service', workflowService)

    const userService = isOffline
      ? '@/services/mock/user.service.mock'
      : '@/services/user.service'
    config.resolve.alias.set('user-service', userService)
  }
}
