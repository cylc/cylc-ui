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

// mean elapsed time for the task in seconds
export const MEAN_ELAPSED_TIME = 10000

export function getStartTime (percent) {
  return String(
    new Date(
      // the current time in ms
      Date.now() -
      // minus the elapsed time in ms
      (
        (MEAN_ELAPSED_TIME * 1000) *
        (percent / 100)
      )
    ).toISOString()
  )
}
