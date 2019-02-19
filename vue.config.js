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
  }
}
