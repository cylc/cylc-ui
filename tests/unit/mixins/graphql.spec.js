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

import { shallowMount } from '@vue/test-utils'
import { createStore } from 'vuex'
import User from '@/model/User.model'
import storeOptions from '@/store/options'
import graphqlMixin from '@/mixins/graphql'

describe('GraphQL mixin', () => {
  const store = createStore(storeOptions)
  it('should create the GraphQL Query variables', () => {
    const user = new User({ username: 'cylc', permissions: [], owner: 'owner' })
    store.commit('user/SET_USER', user)
    const workflowName = 'test'
    const Component = {
      mixins: [graphqlMixin],
      render () {},
    }
    const component = shallowMount(Component, {
      global: {
        plugins: [store],
      },
      props: {
        workflowName,
      },
    })
    const variables = component.vm.variables
    const expected = {
      workflowId: `~${user.owner}/${workflowName}`,
    }
    expect(variables).to.deep.equal(expected)
  })
})
