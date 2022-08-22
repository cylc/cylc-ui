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
const path = require('path')
const CircularDependencyPlugin = require('circular-dependency-plugin')

module.exports = {
  publicPath: '',
  outputDir: 'dist',
  indexPath: 'index.html',
  transpileDependencies: [
    'graphql-language-service-interface',
    'graphql-language-service-parser',
    'vuetify'
  ],
  runtimeCompiler: true,
  productionSourceMap: process.env.NODE_ENV !== 'production',
  pluginOptions: {
    apollo: {
      lintGQL: false
    }
  },
  devServer: {
    proxy: {
      '(^/userprofile|^/graphql)': {
        target: 'http://localhost:3000/',
        changeOrigin: true
      },
      '^/subscriptions': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
        ws: true
      }
    }
  },
  configureWebpack: {
    plugins: [
      new CircularDependencyPlugin({
        exclude: /node_modules|public|tests|docs|dist|src\/components\/graphqlFormGenerator/,
        include: /src/,
        failOnError: true,
        allowAsyncCycles: false,
        cwd: process.cwd(),
        onDetected ({ module: webpackModuleRecord, paths, compilation }) {
          compilation.errors.push(new Error(`Cyclic dependency: ${paths.join(' -> ')}`))
        }
      })
    ]
  },
  chainWebpack: config => {
    config.module
      .rule('wasm')
      .test(/.wasm$/)
      .use('wasm-loader')
      .loader('wasm-loader')
    config
      .resolve
      .alias
      .set('react', 'preact/compat')
    config
      .resolve
      .alias
      .set('react-dom', 'preact/compat')
    if (process.env.NODE_ENV !== 'production') {
      // devtool for test and other modes
      // https://webpack.js.org/configuration/devtool/
      if (process.env.NODE_ENV === 'test') {
        // NOTE: if you need to debug the project with WebStorm (or another IDE) and it fails, try
        //       change this value for config.devtool('eval-source-map')
        config.devtool('eval')
      } else {
        config.devtool('eval-source-map')
      }

      // coverage
      if (process.env.coverage === 'true') {
        config.module.rule('istanbul')
          .test(/\.js$/)
          .include.add(path.resolve('src')).end()
          .use('istanbul-instrumenter-loader')
          .loader('istanbul-instrumenter-loader')
          .options({ esModules: true })
          .after('cache-loader')
      }

      // resolve modules in devtool
      config.output
        .devtoolModuleFilenameTemplate('[absolute-resource-path]')
        .devtoolFallbackModuleFilenameTemplate('[absolute-resource-path]?[hash]')
    }
  }
}
