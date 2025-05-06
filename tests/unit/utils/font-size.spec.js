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

import {
  decreaseFontSize, getCurrentFontSize, increaseFontSize, INCREMENT, resetFontSize,
} from '@/utils/font-size'

describe('Font Size', () => {
  // Won't have initialized the value, as there is no DOM and nothing was loaded
  const initialFontSize = 16

  beforeEach(() => {
    delete localStorage.fontSize
    document.documentElement.style.fontSize = `${initialFontSize}px`
  })

  it('gets the current font size', () => {
    expect(getCurrentFontSize()).to.equal(initialFontSize)
  })

  it('sets and gets a new font size', () => {
    const newVal = 31
    const newValPx = `${newVal}px`
    expect(localStorage.fontSize).to.not.equal(newValPx)
    expect(document.documentElement.style.fontSize).to.not.equal(newValPx)
    expect(getCurrentFontSize()).to.not.equal(newVal)
    resetFontSize(newValPx)
    expect(localStorage.fontSize).to.equal(newValPx)
    expect(document.documentElement.style.fontSize).to.equal(newValPx)
    expect(getCurrentFontSize()).to.equal(newVal)
  })

  it('increases the font size', () => {
    increaseFontSize()
    expect(getCurrentFontSize()).to.equal(initialFontSize + INCREMENT)
  })

  it('decreases the font size', () => {
    decreaseFontSize()
    expect(getCurrentFontSize()).to.equal(initialFontSize - INCREMENT)
  })
})
