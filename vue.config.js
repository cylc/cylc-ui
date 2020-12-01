/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// optional file, loaded automatically by @vue/cli-service if present next to package.json
const webpack = require('webpack')
const path = require('path')

module.exports = {
  publicPath: '',
  outputDir: 'dist',
  indexPath: 'index.html',
  transpileDependencies: ['vuetify'],
  runtimeCompiler: true,
  productionSourceMap: process.env.NODE_ENV !== 'production',
  pluginOptions: {
    apollo: {
      lintGQL: false
    }
  },
  chainWebpack: config => {
    const isOffline = ((process.env.VUE_APP_OFFLINE_MODE || 'false').trim().toLowerCase() === 'true')
    if (isOffline || process.env.NODE_ENV === 'test') {
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
        // NOTE: if you need to debug the project with WebStorm (or another IDE) and it fails, try
        //       change this value for config.devtool('eval-source-map')
        config.devtool('eval')
      } else {
        config.devtool('eval-source-map')
      }
    }

    // set up aliases for mock services, used when the offline mode is used
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
