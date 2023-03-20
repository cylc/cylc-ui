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

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import eslint from 'vite-plugin-eslint'
import IstanbulPlugin from 'vite-plugin-istanbul'
const path = require('path')

export default defineConfig({
  base: '',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      vue: '@vue/compat',
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      // node_modules:
      '~@lumino': '@lumino'
    }
  },
  plugins: [
    vue(),
    vuetify(),
    eslint(),
    IstanbulPlugin({
      requireEnv: true // Only instrument code when VITE_COVERAGE=true
    })
  ],
  server: {
    proxy: {
      '^/(userprofile|graphql)': {
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
  build: {
    sourcemap: mode !== 'production'
  }
})

// module.exports = {
//   transpileDependencies: [
//     'graphql-language-service-interface',
//     'graphql-language-service-parser',
//     'vuetify'
//   ],
//   runtimeCompiler: true,
//   productionSourceMap: process.env.NODE_ENV !== 'production',
//   pluginOptions: {
//     apollo: {
//       lintGQL: false
//     }
//   },
//   chainWebpack: config => {
//     if (process.env.NODE_ENV !== 'production') {
//       // devtool for test and other modes
//       // https://webpack.js.org/configuration/devtool/
//       if (process.env.NODE_ENV === 'test') {
//         // NOTE: if you need to debug the project with WebStorm (or another IDE) and it fails, try
//         //       change this value for config.devtool('eval-source-map')
//         config.devtool('eval')
//       } else {
//         config.devtool('eval-source-map')
//       }

//       // resolve modules in devtool
//       config.output
//         .devtoolModuleFilenameTemplate('[absolute-resource-path]')
//         .devtoolFallbackModuleFilenameTemplate('[absolute-resource-path]?[hash]')
//     }
//   }
// }
