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

const webpack = require('@cypress/webpack-preprocessor')

module.exports = (on, config) => {
  // For test coverage
  require('@cypress/code-coverage/task')(on, config)
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
    e2e: {
      // We've imported your old cypress plugins here.
      // You may want to clean this up later by importing these.
      setupNodeEvents (on, config) {
        return require('./tests/e2e/plugins/index.js')(on, config)
      },
      specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
      supportFile: 'tests/e2e/support/index.js'
    },
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    supportFile: 'tests/e2e/support/index.js'
  })
}
