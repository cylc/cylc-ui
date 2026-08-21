/*
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

import path from 'path'
import { build, defineConfig } from 'vite'

/**
 * Mapping of currently open spec file paths to their build promises, for when running in watch mode.
 * This allows us to only build each spec file once, and then just re-run it when it changes.
 * @type {Record<string, ResettableDeferred>}
 */
const openFiles = {}

class ResettableDeferred {
  constructor () {
    this.reset()
  }

  reset () {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
    // If the promise rejects before being awaited, it can crash the Cypress process.
    // This seems to be a quirk of Node.js unhandled promise rejections.
    // To prevent this, catch rejection immediately; the error will still be thrown (safely) when the promise is awaited:
    this.promise.catch(() => {})
  }
}

/**
 * Use Vite to transform spec files before Cypress runs them.
 * @see https://docs.cypress.io/api/node-events/preprocessors-api
 *
 * @param {Cypress.FileObject} file
 */
export async function vitePreprocessor (file) {
  // Unset COVERAGE to prevent vite istanbul plugin instrumenting spec code
  // (This is separate to the instrumenting of the served source code loaded by the Cypress browser)
  delete process.env.COVERAGE

  const { filePath, outputPath, shouldWatch } = file

  /** This is automatically combined with the project Vite config */
  const viteConfig = defineConfig({
    mode: 'development',
    define: {
      // This has to be set otherwise we get "process is not defined" error for some reason:
      'process.env.NODE_ENV': JSON.stringify('development'),
    },
    // Suppress Vite's logging as any thrown errors are logged anyway and would be duplicated otherwise:
    logLevel: 'silent',

    build: {
      watch: shouldWatch ? {} : null,
      sourcemap: 'inline',
      outDir: path.dirname(outputPath),
      lib: {
        entry: filePath,
        formats: ['es'],
        fileName: () => path.basename(outputPath),
      },
      // Reduce possibility of Cypress running stale spec files from previous builds, which can cause confusing test results:
      emptyOutDir: true,

      // Turn off unnecessary features to speed up the build as much as possible:
      minify: false,
      emitAssets: false,
      copyPublicDir: false,
      reportCompressedSize: false,
    },
  })

  async function watchAndBuildSpec () {
    const deferred = openFiles[filePath] = new ResettableDeferred()

    /** @type {import('rolldown').RolldownWatcher} */
    const watcher = await build(viteConfig)

    watcher.on('event', (e) => {
      switch (e.code) {
        case 'BUNDLE_START':
          deferred.reset()
          file.emit('rerun')
          break
        case 'BUNDLE_END':
          deferred.resolve()
          break
        case 'ERROR':
          deferred.reject(e.error)
          break
      }
    })

    file.on('close', async () => {
      await watcher.close()
      delete openFiles[filePath]
    })

    return deferred
  }

  if (shouldWatch) {
    // Watch the spec file if not in headless mode and not already watching:
    const { promise } = openFiles[filePath] ?? await watchAndBuildSpec()
    await promise
  } else {
    // Just build the file once in headless mode:
    await build(viteConfig)
  }
  return outputPath
}
