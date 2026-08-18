import { defineConfig } from 'cypress'
import registerCodeCoverageTasks from '@cypress/code-coverage/task'
import { vitePreprocessor } from './tests/e2e/support/preprocessor.js'

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
      registerCodeCoverageTasks(on, config)

      on('file:preprocessor', vitePreprocessor)
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
      registerCodeCoverageTasks(on, config)
      return config
    },
    specPattern: 'tests/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/component/support/index.js',
    indexHtmlFile: 'tests/component/support/component-index.html'
  },

  allowCypressEnv: false,

  expose: {
    // Cypress uses this to detect whether to collect coverage
    coverage: Boolean(process.env.COVERAGE)
  },

  morgan: false, // Disable XHR logging as it's very noisy
})
