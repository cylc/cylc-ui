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

import { expect } from 'chai'
import sinon from 'sinon'
import * as fontSize from '@/utils/font-size'

if (!global.localStorage) {
  global.localStorage = {
    getItem() {
      return '{}'
    },
    setItem() {},
  }
}

describe('Font Size', () => {
  // Vuetify won't have initialized the value, as there is no DOM and nothing was loaded
  const TESTING_INITIAL_VALUE = 16
  let stub = null
  beforeEach(() => {
    // Create a dummy HTML html element, as that's not present in JSDOM by default.
    // Also set the initial value (again, Vuetify won't have set this value yet).
    const htmlElement = document.createElement('html')
    htmlElement.style.fontSize = `${TESTING_INITIAL_VALUE}px`
    const htmlCollection = [htmlElement]
    stub = sinon.stub(document, 'getElementsByTagName').returns(htmlCollection)
    // Reset the localStorage value
    delete global.localStorage.fontSize
  })
  afterEach(() => {
    if (stub !== null) {
      // Undo mocking
      stub.restore()
    }
  })
  it('Should calculate expected font size correctly', () => {
    expect(TESTING_INITIAL_VALUE).to.be.equal(
      fontSize.expectedFontSize(true, 0, TESTING_INITIAL_VALUE),
    )
    expect(TESTING_INITIAL_VALUE).to.be.equal(
      fontSize.expectedFontSize(false, 0, TESTING_INITIAL_VALUE),
    )
    expect(TESTING_INITIAL_VALUE * 1.2).to.be.equal(
      fontSize.expectedFontSize(true, 1, TESTING_INITIAL_VALUE),
    )
    expect(TESTING_INITIAL_VALUE * 1.2 * 1.2).to.be.equal(
      fontSize.expectedFontSize(true, 2, TESTING_INITIAL_VALUE),
    )
    expect(TESTING_INITIAL_VALUE * 0.8).to.be.equal(
      fontSize.expectedFontSize(false, 1, TESTING_INITIAL_VALUE),
    )
    expect(TESTING_INITIAL_VALUE * 0.8 * 0.8).to.be.equal(
      fontSize.expectedFontSize(false, 2, TESTING_INITIAL_VALUE),
    )
  })
  it('Should return the correct current font size', () => {
    expect(TESTING_INITIAL_VALUE).to.be.equal(fontSize.getCurrentFontSize())
  })
  it('Should increase the font size correctly', () => {
    expect(TESTING_INITIAL_VALUE).to.be.equal(fontSize.getCurrentFontSize())
    fontSize.increaseFontSize()
    fontSize.increaseFontSize()
    expect(TESTING_INITIAL_VALUE * 1.2 * 1.2).to.be.equal(
      fontSize.expectedFontSize(true, 2, TESTING_INITIAL_VALUE),
    )
  })
  it('Should decrease the font size correctly', () => {
    expect(TESTING_INITIAL_VALUE).to.be.equal(fontSize.getCurrentFontSize())
    fontSize.decreaseFontSize()
    fontSize.decreaseFontSize()
    expect(TESTING_INITIAL_VALUE * 0.8 * 0.8).to.be.equal(
      fontSize.expectedFontSize(false, 2, TESTING_INITIAL_VALUE),
    )
  })
  it('Should reset the font size correctly', () => {
    expect(TESTING_INITIAL_VALUE).to.be.equal(fontSize.getCurrentFontSize())
    fontSize.decreaseFontSize()
    fontSize.decreaseFontSize()
    fontSize.resetFontSize(`${TESTING_INITIAL_VALUE}px`)
    expect(TESTING_INITIAL_VALUE).to.be.equal(fontSize.getCurrentFontSize())
  })
})
