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
import Vue from 'vue'
import Vuex from 'vuex'
import storeOptions from '@/store/options'
import Alert from '@/model/Alert.model'

Vue.use(Vuex)

/**
 * Tests for the store/index module.
 */
describe('index', () => {
  const store = new Vuex.Store(storeOptions)
  // using sinon to capture console.log
  beforeEach(() => {
    sinon.stub(console, 'log')
  })
  afterEach(() => {
    sinon.restore()
  })
  /**
   * Tests for store.alert.
   */
  describe('alert', () => {
    const resetState = () => {
      store.state.alert = null
    }
    beforeEach(resetState)
    afterEach(resetState)
    it('should start with no alert', () => {
      expect(store.state.alert).to.equal(null)
    })
    it('should set alert', () => {
      const text = 'my-alert'
      store.dispatch('setAlert', new Alert(text, '', ''))
      expect(store.state.alert.text).to.equal(text)
      // repeating an alert with same text does not change anything
      store.dispatch('setAlert', new Alert(text, '', ''))
      expect(store.state.alert.text).to.equal(text)
      // but if the text is different, it will use the new value
      store.dispatch('setAlert', new Alert('my-alert-2', '', ''))
      expect(store.state.alert.text).to.equal('my-alert-2')
      // and we can reset the state
      store.dispatch('setAlert', null)
      expect(store.state.alert).to.equal(null)
    })
  })
  /**
   * Tests for store.offline.
   */
  describe('offline', () => {
    const resetState = () => {
      store.state.offline = false
    }
    beforeEach(resetState)
    afterEach(resetState)
    it('should start online', () => {
      // so that the component is not rendered for a few seconds
      expect(store.state.offline).to.equal(false)
    })
    it('should update offline flag correctly', () => {
      expect(store.state.offline).to.equal(false)
      store.commit('SET_OFFLINE', true)
      expect(store.state.offline).to.equal(true)
      store.commit('SET_OFFLINE', false)
      expect(store.state.offline).to.equal(false)
    })
  })
})
