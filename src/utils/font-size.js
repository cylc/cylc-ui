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

import styles from '@/styles/index.scss'

// Module for font size functions and constants.

/**
 * Initial font size, set in the Vuetify framework style.
 */
const INITIAL_FONT_SIZE = styles.fontRootSize

/**
 * Sets the font-size back to its default value. The default value is imported
 * from Vuetify's scss style variables (at the time of writing, variable
 * $font-root-size, set by default to 16px).
 *
 * @param {string} [initialFontSize] initial font size, defaults to the Vuetify
 * - value
 */
function resetFontSize(initialFontSize = INITIAL_FONT_SIZE) {
  localStorage.fontSize = initialFontSize
  document.getElementsByTagName('html')[0].style.fontSize = initialFontSize
}

/**
 * Decrease the HTML element font size by 20%.
 */
function decreaseFontSize() {
  const currentFontSize = this.getCurrentFontSize()
  const newFontSize = `${currentFontSize * 0.8}px`
  localStorage.fontSize = newFontSize
  document.getElementsByTagName('html')[0].style.fontSize = newFontSize
}

/**
 * Increase the HTML element font size by 20%.
 */
function increaseFontSize() {
  const currentFontSize = this.getCurrentFontSize()
  const newFontSize = `${currentFontSize * 1.2}px`
  localStorage.fontSize = newFontSize
  document.getElementsByTagName('html')[0].style.fontSize = newFontSize
}

/**
 * Get HTML element (computed) font size.
 *
 * @returns {number} current font size
 */
function getCurrentFontSize() {
  if (localStorage.fontSize) {
    return parseFloat(localStorage.fontSize)
  }
  const html = document.getElementsByTagName('html')[0]
  const htmlStyle = window.getComputedStyle(html)
  return parseFloat(htmlStyle.fontSize)
}

/**
 * Computes the expected font size, for a given number of clicks on the
 * increase or decrease button. The increase flag tells whether it was on
 * the increase, or decrease button. Returns the exponential function
 * initial_value * ratio ^ n, where n is the number of clicks. Intended
 * for testing.
 *
 * @param {boolean} increase true means increase, false decrease
 * @param {number} clicks number of times a button was clicked
 * @param {number} [initialFontSize] initial font size, defaults to the Vuetify
 * - value
 * @returns {number}
 */
function expectedFontSize(
  increase,
  clicks,
  initialFontSize = parseFloat(INITIAL_FONT_SIZE),
) {
  const ratio = increase ? 1.2 : 0.8
  return initialFontSize * Math.pow(ratio, clicks)
}

export {
  resetFontSize,
  decreaseFontSize,
  increaseFontSize,
  getCurrentFontSize,
  expectedFontSize,
  INITIAL_FONT_SIZE,
}
