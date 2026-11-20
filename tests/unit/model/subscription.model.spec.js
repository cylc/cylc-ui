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
import { Subscription } from '@/model/Subscription.model'
import { SubscriptionQuery } from '@/model/SubscriptionQuery.model'
import ViewState from '@/model/ViewState.model'

describe('Subscription model', () => {
  const query = gql`query { workflow { id } }`
  const variables = {
    workflowID: '~cylc/cylc',
  }
  const name = 'root'
  let subscriptionQuery
  beforeEach(() => {
    subscriptionQuery = new SubscriptionQuery(
      query,
      variables,
      name,
    )
  })

  describe('constructor', () => {
    it('should be created', () => {
      const subscription = new Subscription(subscriptionQuery)
      expect(subscription.query).to.equal(subscriptionQuery)
      expect(subscription.observable).to.equal(null)
      expect(subscription.subscribers.size).to.equal(0)
      expect(subscription.reload).to.equal(false)
    })
  })

  describe('handleViewState', () => {
    it.each([
      {
        viewState: ViewState.ERROR,
        context: {
          message: 'test',
        },
      },
      {
        viewState: ViewState.NO_STATE,
        context: {
          message: 'test',
        },
      },
      {
        viewState: ViewState.LOADING,
        context: {
          message: 'test',
        },
      },
      {
        viewState: ViewState.COMPLETE,
        context: {
          message: 'test',
        },
      },
    ])('sets the subscribers viewStates: $viewState', ({ viewState, context }) => {
      const subscription = new Subscription(subscriptionQuery)
      subscription.subscribers.set('1', {
        viewState: null,
        setAlert: () => {},
      })
      subscription.handleViewState(viewState, context)
      for (const subscriber of subscription.subscribers.values()) {
        expect(subscriber.viewState).to.equal(viewState)
      }
    })
  })
})
