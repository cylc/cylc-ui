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
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'
import IstanbulPlugin from 'vite-plugin-istanbul'
import dns from 'dns'
import path from 'path'

// Workaround https://github.com/cypress-io/cypress/issues/25397
dns.setDefaultResultOrder('ipv4first')

export default defineConfig(({ mode }) => {
  const plugins = [
    vue(),
    vuetify(),
    eslint({
      failOnError: mode === 'production'
    }),
    // GraphiQL is a React app:
    react(),
  ]

  if (mode !== 'production' && process.env.COVERAGE) {
    plugins.push(
      IstanbulPlugin({
        forceBuildInstrument: true
      })
    )
  }

  /**
   * When running the Vite dev server to serve the app, set the proxy for the
   * mock JSON server data in offline mode else the Cylc UIServer data.
   */
  const devProxyTarget = `http://localhost:3000${mode === 'offline' ? '/' : '/cylc/'}`

  return {
    base: '',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        $tests: path.resolve(__dirname, './tests'),
        lodash: 'lodash-es',
        // GraphiQL is a React app (use Preact as it's smaller):
        react: 'preact/compat',
        'react-dom': 'preact/compat',
      }
    },
    plugins,
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
        '^/(userprofile|version|graphql)': {
          target: devProxyTarget,
          changeOrigin: true
        },
        '^/subscriptions': {
          target: devProxyTarget,
          changeOrigin: true,
          ws: true
        }
      },
      watch: {
        ignored: [
          path.resolve(__dirname, './coverage')
        ]
      },
      warmup: {
        clientFiles: [
          './src/main.js',
          './src/App.vue',
          './src/views/Dashboard.vue',
          './src/views/Workspace.vue',
        ]
      }
    },
    build: {
      sourcemap: mode !== 'production',
      target: 'baseline-widely-available',
      rollupOptions: {
        // Workaround https://github.com/vitejs/vite/issues/19410:
        maxParallelFileOps: 100,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    define: {
      // Allow vue devtools to work when runing vite build:
      __VUE_PROD_DEVTOOLS__: mode !== 'production'
    },
    // Unit test specific config:
    test: {
      include: ['./tests/unit/**/*.spec.{js,ts}'],
      environment: 'jsdom',
      globals: true, // auto-import `describe`, `it`, `beforeEach` etc.
      setupFiles: ['./tests/unit/setup.js'],
      restoreMocks: true,
      server: {
        deps: {
          // inline vuetify to prevent 'TypeError: Unknown file extension ".css"
          inline: ['vuetify'],
        },
      },
      coverage: {
        provider: 'istanbul',
        include: [
          'src/**'
        ],
        exclude: [
          'src/services/mock/**'
        ],
      }
    }
  }
})
