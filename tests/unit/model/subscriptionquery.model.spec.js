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

import gql from 'graphql-tag'
import { SubscriptionQuery } from '@/model/SubscriptionQuery.model'

describe('SubscriptionQuery model', () => {
  const query = gql`query { workflow { id } }`
  const variables = {
    workflowID: '~cylc/cylc',
  }
  const name = 'root'
  it('should be created', () => {
    const subscriptionQuery = new SubscriptionQuery(query, variables, name)
    expect(subscriptionQuery.query).toBe(query)
    expect(subscriptionQuery.variables).toEqual(variables)
    expect(subscriptionQuery.name).toBe(name)
    expect(subscriptionQuery.hooks).toBeUndefined()
    expect(subscriptionQuery.next).toBeUndefined()
  })

  it('accepts hooks', () => {
    const hooks = {
      onBeforeDelta () {},
      onDelta () {},
      tearDown () {},
    }
    const subscriptionQuery = new SubscriptionQuery(query, variables, name, hooks)
    expect(subscriptionQuery.hooks).toBe(hooks)
    expect(subscriptionQuery.next).toBeUndefined()
  })

  it('accepts a custom next function instead of hooks', () => {
    const next = () => {}
    const subscriptionQuery = new SubscriptionQuery(query, variables, name, next)
    expect(subscriptionQuery.hooks).toBeUndefined()
    expect(subscriptionQuery.next).toBe(next)
  })
})
