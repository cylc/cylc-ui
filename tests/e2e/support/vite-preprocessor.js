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

const path = require('path')
const vite = require('vite')
const chokidar = require('chokidar')

/**
 * Cache watchers for each spec file to avoid creating more than 1 per file.
 *
 * @type {Record<string, chokidar.FSWatcher>}
 */
const watchers = {}

/**
 * Cypress preprocessor for transforming e2e spec & support files using Vite.
 *
 * Cypress cannot actually run source spec files directly. Normally it runs
 * a built-in webpack preprocessor but it makes more sense to use Vite using
 * the project config.
 *
 * @param {string} userConfigPath
 */
function vitePreprocessor (userConfigPath) {
  // console.debug('[preprocessor] User config path:', userConfigPath)
  return async (file) => {
    const { filePath, outputPath, shouldWatch } = file
    const fileName = path.basename(outputPath)
    const filenameWithoutExtension = path.basename(
      outputPath,
      path.extname(outputPath)
    )

    // console.debug('[preprocessor] Running:', filePath)

    if (shouldWatch && !watchers[filePath]) {
      // Watch this spec file if we are not already doing so (and Cypress is
      // not in headless mode)
      let initial = true
      watchers[filePath] = chokidar.watch(filePath)

      file.on('close', async () => {
        // TODO: never happens?
        // console.debug('[preprocessor] File closed:', filePath)
        await watchers[filePath].close()
        delete watchers[filePath]
      })

      watchers[filePath].on('all', () => {
        // Re-run the preprocessor if the file changes
        if (!initial) {
          // console.debug('[preprocessor] File changed:', filePath)
          file.emit('rerun')
        }
        initial = false
      })
    }

    const defaultConfig = vite.defineConfig({
      mode: 'development',
      logLevel: 'warn',
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
      build: {
        emptyOutDir: false,
        minify: false,
        outDir: path.dirname(outputPath),
        sourcemap: true,
        write: true,
        // Note: not using Vite's file watch mode as it is too complicated
        // to play nicely with Cypress
        watch: null,
        lib: {
          entry: filePath,
          fileName: () => fileName,
          formats: ['umd'],
          name: filenameWithoutExtension
        }
      }
    })

    await vite.build({
      configFile: userConfigPath,
      ...defaultConfig
    })

    return outputPath
  }
}

module.exports = vitePreprocessor
