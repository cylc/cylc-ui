const webpack = require('@cypress/webpack-preprocessor')

module.exports = (on, config) => {
  // For test coverage
  on('task', require('@cypress/code-coverage/task'))
  const webpackOptions = require('@vue/cli-service/webpack.config')
  // NOTE: if we do not remove the webpack optimizations, Cypress seems
  //       to get confused when our JS code imports scss, failing
  //       silently, and reporting no tests found in Cypress GUI.
  webpackOptions.optimization = {}
  on('file:preprocessor', webpack({
    webpackOptions,
    watchOptions: {}
  }))
  return Object.assign({}, config, {
    fixturesFolder: 'tests/e2e/fixtures',
    integrationFolder: 'tests/e2e/specs',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    supportFile: 'tests/e2e/support/index.js'
  })
}
