// karma.conf.js

var webpackConfig = require('./node_modules/@vue/cli-service/webpack.config.js')

module.exports = function (config) {
  config.set({
    basePath: '',

    frameworks: ['jasmine'],

    files: ['test/**/*.test.js'],

    preprocessors: {
      'test/**/*.js': ['webpack']
    },

    webpack: Object.assign({
      mode: 'development'
    }, webpackConfig),
    webpackMiddleware: {
      noInfo: true
    },

    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-webpack'
    ],

    reporters: ['progress'],

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    singleRun: true,

    concurrency: Infinity,

    browsers: ['Chrome']
  })
}
