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

/** Default <html> font size in px */
const DEFAULT_FONT_SIZE = window.getComputedStyle(document.documentElement).fontSize
export const INCREMENT = 2 // px

/**
 * Sets the font-size to a value. The default value is the <html> element's
 * computed font size.
 *
 * @param {string} size in px
 */
export function resetFontSize (size = DEFAULT_FONT_SIZE) {
  localStorage.fontSize = size
  document.body.style.fontSize = size
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
 * @returns {number} current font size
 */
export function getCurrentFontSize () {
  const fontSize = localStorage.fontSize ?? window.getComputedStyle(document.body).fontSize
  return parseFloat(fontSize)
}
