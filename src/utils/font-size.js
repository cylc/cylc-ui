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

// Module for font size functions and constants.

/** Font size increment in px */
export const INCREMENT = 2

/**
 * Sets the font-size to a value.
 *
 * @param {?string} size - Value with units given (doesn't matter which unit).
 * If null then reset to default.
 */
export function resetFontSize (size = null) {
  localStorage.fontSize = size
  document.documentElement.style.fontSize = size
}

export function decreaseFontSize () {
  resetFontSize(`${getCurrentFontSize() - INCREMENT}px`)
}

export function increaseFontSize () {
  resetFontSize(`${getCurrentFontSize() + INCREMENT}px`)
}

/**
 * Get HTML element (computed) font size.
 *
 * @returns {number} current font size in px
 */
export function getCurrentFontSize () {
  const fontSize = window.getComputedStyle(document.documentElement).fontSize // px
  return parseFloat(fontSize)
}
