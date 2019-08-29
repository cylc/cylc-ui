// optional file, loaded automatically by @vue/cli-service if present next to package.json
var webpack = require('webpack')

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
    if (process.env.NODE_ENV !== 'production') {
      config.module.rule('js')
        .use('istanbul')
        .loader('istanbul-instrumenter-loader')
        .options({ esModules: true })
        .before('babel-loader')

      config.output
        .devtoolModuleFilenameTemplate('[absolute-resource-path]')
        .devtoolFallbackModuleFilenameTemplate('[absolute-resource-path]?[hash]')

      config.devtool('inline-cheap-module-source-map')
    }

    // mocha-webpack appears to be having issues with sass-loader, interpreting .sass files as .scss after
    // the update from vuetify 1.5.x to 2.x (they changed from node-sass to sass). Their example contains
    // a jest configuration file that prevents some transformations, and uses their own plugins for others.
    // Troubleshooting it during the update, it appears that the only way to make our tests to pass was
    // by ignoring sass transformations too in webpack.
    if (process.env.NODE_ENV === 'test') {
      config.module.rule('sass')
        .use('sass')
        .loader('null-loader')
    }

    // set up aliases for mock services, used when the offline mode is used
    const workflowService = process.env.NODE_ENV === 'offline'
      ? '@/services/mock/workflow.service.mock'
      : '@/services/workflow.service'
    config.resolve.alias.set('workflow-service', workflowService)
  }
}
