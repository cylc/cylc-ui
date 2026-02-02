import { defineConfig } from 'cypress'
import vitePreprocessor from 'cypress-vite'
import path from 'path'

export default defineConfig({
  video: false,
  defaultCommandTimeout: 10000,
  execTimeout: 60000,
  taskTimeout: 60000,
  pageLoadTimeout: 60000,
  requestTimeout: 30000,
  responseTimeout: 30000,
  fixturesFolder: 'tests/e2e/fixtures',
  screenshotsFolder: 'tests/e2e/screenshots',
  videosFolder: 'tests/e2e/videos',

  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents (on, config) {
      // For test coverage
      require('@cypress/code-coverage/task')(on, config)

      /* By default, Cypress uses webpack to transform spec files before
      running them. But it makes more sense to use vite instead, using the
      same config as the project.
      Note: Set NODE_ENV to prevent vite eslint plugin linting errors failing
      the transform (e.g. no-only-tests rule) */
      process.env.NODE_ENV = 'development'
      on(
        'file:preprocessor',
        vitePreprocessor({
          configFile: path.resolve(__dirname, './vite.config.js'),
          mode: 'development',
        })
      )
      return config
    },
    specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/e2e/support/index.js'
  },

  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite'
    },
    setupNodeEvents (on, config) {
      // For test coverage
      require('@cypress/code-coverage/task')(on, config)
      return config
    },
    specPattern: 'tests/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/component/support/index.js',
    indexHtmlFile: 'tests/component/support/component-index.html'
  },

  env: {
    // eslint-disable-next-line no-unneeded-ternary
    coverage: process.env.COVERAGE ? true : false
  },

  morgan: false, // Disable XHR logging as it's very noisy
})
