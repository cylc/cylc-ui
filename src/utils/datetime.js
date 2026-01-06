/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
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

/* Datetime functionalities.
 *
 * Hey, let's not build a datetime library this time!
 */

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function humanDuration (date) {
  let duration = (date - new Date()) / 1000
  for (const [name, number] of [
    ['seconds', 60],
    ['minutes', 60],
    ['hours', 24],
    ['days', 7],
    ['weeks', 4.34524],
    ['months', 12],
    ['years', Infinity],
  ]) {
    if (Math.abs(duration) < number) {
      return rtf.format(Math.round(duration), name)
    }
    duration = duration / number
  }
}

/**
 * Format a datetime as an ISO 8601 string in UTC, without milliseconds.
 *
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
export function formatDatetime (date) {
  return `${date.toISOString().slice(0, -5)}Z`
}
