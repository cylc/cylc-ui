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

import sinon from 'sinon'
import axios from 'axios'
import { createStore } from 'vuex'
import { getUserProfile } from '@/services/user.service'
import storeOptions from '@/store/options'
import { Alert } from '@/model/Alert.model'

describe('getUserProfile', () => {
  const store = createStore(storeOptions)
  let sandbox
  beforeEach(() => {
    sandbox = sinon.createSandbox()
    sandbox.stub(console, 'log')
    store.commit('SET_ALERT', null)
  })
  afterEach(() => sandbox.restore())

  describe('returns the logged-in user profile information', () => {
    it('returns user profile object', async () => {
      const expected = {
        username: 'cylc-user-01',
        mode: 'single user',
        permissions: ['read'],
        owner: 'cylc-user-02',
      }
      const response = Promise.resolve({
        data: {
          ...expected,
          name: expected.username,
          other_stuff: null,
        },
      })
      sandbox.stub(axios, 'get').returns(response)
      const user = await getUserProfile()
      expect(user).toMatchObject(expected)
    })

    it('should add an alert on error', () => {
      expect(store.state.alert).to.equal(null)
      const e = new Error('mock error')
      e.response = {
        statusText: 'Test Status',
      }
      sandbox.stub(axios, 'get').rejects(e)
      return getUserProfile()
        .catch((error) => {
          const alert = new Alert(error.response.statusText, 'error')
          return store.dispatch('setAlert', alert)
        })
        .finally(() => {
          expect(store.state.alert.text).to.equal('Test Status')
        })
    })
  })
})
