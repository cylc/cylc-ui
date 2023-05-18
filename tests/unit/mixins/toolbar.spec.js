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

import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import { createVuetify } from 'vuetify'
import mixin from '@/mixins/toolbar'
import storeOptions from '@/store/options'

describe('Toolbar mixin', () => {
  const store = createStore(storeOptions)
  const vuetify = createVuetify()
  it('should toggle the drawer when clicked', () => {
    store.state.app.drawer = false
    const component = mount({
      mixins: [mixin],
      render () {}
    }, {
      global: {
        plugins: [store, vuetify]
      }
    })
    component.vm.onClickBtn()
    expect(store.state.app.drawer).to.equal(true)
    store.state.app.drawer = null
  })
})
