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

export default defineConfig(({ mode }) => ({
  base: '',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      // node_modules:
      '~@lumino': '@lumino'
    }
  },
  plugins: [
    vue(),
    vuetify(),
    eslint({
      /* Note: $NODE_ENV is still `production` even when running
      `vite build --mode development`. We only want eslint to fail the
      `--mode production` build. And we don't want cypress spec file
      transformation to fail either (`mode` seems to be production in this
      case but we set $NODE_ENV to development in cypress.config.js) */
      failOnError: mode === process.env.NODE_ENV && mode === 'production'
    }),
    IstanbulPlugin({
      requireEnv: true // Only instrument code when VITE_COVERAGE=true
    })
  ],
  optimizeDeps: {
    entries: ['./src/**/*.{vue,js,jsx,ts,tsx}'],
    /* Vuetify components are dynamically imported by vite-plugin-vuetify,
    so Vite only knows which components are being used upon navigation, causing
    it to optimize them on the fly instead of pre-bundling. This can cause a
    page reload which breaks some Cypress tests, so we exclude Vuetify from
    optimization in that case. */
    exclude: ['vuetify'],
  },
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
    },
    watch: {
      ignored: [
        path.resolve(__dirname, './coverage')
      ]
    },
  },
  build: {
    sourcemap: mode !== 'production'
  },
  define: {
    // Allow vue devtools to work when runing vite build:
    __VUE_PROD_DEVTOOLS__: mode !== 'production'
  },
  test: {
    include: ['./tests/unit/**/*.spec.{js,ts}'],
    environment: 'jsdom',
    reporter: 'verbose',
    globals: true, // auto-import `describe`, `it`, `beforeEach` etc.
    setupFiles: ['./tests/unit/setup.js'],
    deps: {
      // inline vuetify to prevent 'TypeError: Unknown file extension ".css"
      inline: ['vuetify']
    },
    coverage: {
      provider: 'istanbul'
    }
  }
}))

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
