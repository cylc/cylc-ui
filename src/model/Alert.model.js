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

/** Alert model */
export class Alert {
  /**
   * @param {Error|string} err - original thrown error to log if possible, or an error message.
   * @param {string} color - color of the displayed alert.
   * @param {?string} msg - a custom message to display in the alert instead of err.
   */
  constructor (err, color, msg = null, timeout = 10000) {
    this.err = err
    this.text = msg || err
    this.color = color
    this.timeout = timeout
  }
}
