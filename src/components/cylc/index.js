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

/**
 * Compute percent progress.
 *
 * @see https://github.com/cylc/cylc-flow/blob/de7d938496e82dbdfb165938145670dd8e801efd/lib/cylc/gui/updater_tree.py#L248-L263
 * @param {number} startedTime in milliseconds since 1970-01-01 00:00:00 UTC, e.g. 1568353099874
 * @param {number} meanElapsedTime mean elapsed time in seconds
 * @returns {number} the percent progress, e.g. 25 (meaning 25% progress)
 * @private
 */
function computePercentProgress (startedTime, meanElapsedTime) {
  const now = Date.now() // milliseconds since 1970-01-01
  // startedTime > now reportedly possible via interaction with `cylc reset`
  if (startedTime > now || meanElapsedTime === 0) {
    return 0
  }

  if (now > startedTime + meanElapsedTime * 1000) {
    return 100
  }
  return 100 * (now - startedTime) / (meanElapsedTime * 1000)
}

export {
  computePercentProgress
}
