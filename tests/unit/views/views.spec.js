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
  ANALYSIS,
  GANTT,
  GRAPH,
  LOG,
  TABLE,
  TREE,
  useDefaultView
} from '@/views/views.js'

describe('useDefaultView composable', () => {
  it(`returns the ${TREE} view if not set in localStorage`, () => {
    localStorage.removeItem('defaultView')
    expect(useDefaultView().value).to.equal(TREE)
  })

  it('returns the view that has been set in localStorage', () => {
    localStorage.defaultView = TABLE
    expect(useDefaultView().value).to.equal(TABLE)
    localStorage.defaultView = GRAPH
    expect(useDefaultView().value).to.equal(GRAPH)
    localStorage.defaultView = GANTT
    expect(useDefaultView().value).to.equal(GANTT)
    localStorage.defaultView = ANALYSIS
    expect(useDefaultView().value).to.equal(ANALYSIS)
    localStorage.defaultView = LOG
    expect(useDefaultView().value).to.equal(LOG)
  })

  it(`returns the ${TREE} view if the view set in localStorage is not available`, () => {
    localStorage.defaultView = 'NotAView'
    expect(useDefaultView().value).to.equal(TREE)
  })
})
