// optional file, loaded automatically by @vue/cli-service if present next to package.json
const webpack = require('webpack')
const path = require('path')

module.exports = {
  publicPath: '',
  outputDir: 'dist',
  indexPath: 'index.html',
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

    // mocha-webpack appears to be having issues with sass-loader, interpreting .sass files as .scss after
    // the update from vuetify 1.5.x to 2.x (they changed from node-sass to sass). Their example contains
    // a jest configuration file that prevents some transformations, and uses their own plugins for others.
    // Troubleshooting it during the update, it appears that the only way to make our tests to pass was
    // by ignoring sass transformations too in webpack.
    if (process.env.NODE_ENV === 'test') {
      config.module.rules.delete('scss')
      config.module.rule('scss')
        .test(/\.scss$/)
        .use(['null-loader'])
        .loader('null-loader')

      config.module.rules.delete('sass')
      config.module.rule('sass')
        .test(/\.sass$/)
        .use('null-loader')
        .loader('null-loader')
        .options({
          indentedSyntax: true
        })
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
