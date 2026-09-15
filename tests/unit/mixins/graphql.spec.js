/**
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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

import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import User from '@/model/User.model'
import storeOptions from '@/store/options'
import { useGraphQL } from '@/mixins/graphql'
import { defineComponent } from 'vue'
import { mockRoute } from '$tests/util'

describe('GraphQL composables', () => {
  const store = createStore(storeOptions)
  const workflowName = 'test'
  mockRoute({ params: { workflowName } })

  it('creates the GraphQL Query variables and computed properties', () => {
    const user = new User({ username: 'cylc', permissions: [], owner: 'owner' })
    store.commit('user/SET_USER', user)
    const Component = defineComponent({
      setup () {
        return useGraphQL()
      },
      render: () => null,
    })
    const component = shallowMount(Component, {
      global: {
        plugins: [store],
      },
    })
    const expectedID = `~${user.owner}/${workflowName}`

    expect(component.vm.workflowID).to.equal(expectedID)
    expect(component.vm.workflowIDs).to.deep.equal([expectedID])
    expect(component.vm.variables).to.deep.equal({
      workflowID: expectedID,
    })
  })
})
