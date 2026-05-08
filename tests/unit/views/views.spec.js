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

import { TREE, useDefaultView } from '@/views/views.js'
import { nextTick } from 'vue'

describe('useDefaultView composable', () => {
  afterEach(() => {
    // As we are using a singleton for the defaultView, we need to reset
    // its value after each test.
    useDefaultView().value = TREE
  })

  it(`returns the ${TREE} view if not set in localStorage`, () => {
    delete localStorage.defaultView
    expect(useDefaultView().value).to.equal(TREE)
  })

  it('returns the view that has been set in localStorage', () => {
    const defaultView = useDefaultView()
    defaultView.value = 'Table'
    expect(defaultView.value).to.equal('Table')
    defaultView.value = 'Graph'
    expect(defaultView.value).to.equal('Graph')
  })

  it(`returns the ${TREE} view if the view set in localStorage is not available`, async () => {
    const defaultView = useDefaultView()
    defaultView.value = 'NotAView'
    await nextTick()
    expect(defaultView.value).to.equal(TREE)
  })
})
