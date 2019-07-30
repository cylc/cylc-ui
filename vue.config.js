// optional file, loaded automatically by @vue/cli-service if present next to package.json

module.exports = {
  publicPath: '',
  outputDir: 'dist',
  indexPath: 'index.html',
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

    // set up aliases for mock services, used when the offline mode is used
    const workflowService = process.env.NODE_ENV === 'offline'
      ? '@/services/mock/workflow.service.mock'
      : '@/services/workflow.service'
    config.resolve.alias.set('workflow-service', workflowService)
  }
}
