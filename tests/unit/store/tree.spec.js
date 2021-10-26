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
import Vue from 'vue'
import Vuex from 'vuex'
import storeOptions from '@/store/options'

Vue.use(Vuex)

/**
 * Tests for the store/tree module.
 */
describe('tree', () => {
  const store = new Vuex.Store(storeOptions)
  if (!global.localStorage) {
    global.localStorage = {}
  }
  const resetState = () => {
    store.state.tree.lookup = {}
    store.state.tree.workflow = {
      tree: {},
      lookup: {}
    }
  }
  beforeEach(resetState)
  afterEach(resetState)
  describe('Mutations', () => {
    it('should set tree workflow', () => {
      const tree = {
        tree: [
          {
            test: 1
          }
        ],
        lookup: {
          test: 1
        }
      }
      store.commit('tree/SET_WORKFLOW', tree)
      expect(store.state.tree.workflow).to.deep.equal(tree)
    })
  })
})
