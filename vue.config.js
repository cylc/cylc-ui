// optional file, loaded automatically by @vue/cli-service if present next to package.json
const webpack = require('webpack')
const path = require('path')

/**
 * GraphQL URL used to rewrite requests when running a devServer. This will be used by a proxy in the devServer.
 * @type {string}
 */
const user = process.env.CYLC_USER || process.env.USER
const GRAPHQL_REWRITE = `/user/${user}/graphql`

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

    if (process.env.NODE_ENV !== 'production') {
      config.devtool('inline-cheap-module-source-map')
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
  },
  devServer: {
    proxy:
    {
      // will match even if there is text before, like /user/name/graphql
      '/graphql': {
        target: 'http://localhost:8000',
        pathRewrite: {
          '.*': GRAPHQL_REWRITE
        }
      }
    }
  }
}
