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

import { createStore } from 'vuex'
import { vi, expect } from 'vitest'
import sinon from 'sinon'
import { print } from 'graphql/language'
import gql from 'graphql-tag'
// need the polyfill as otherwise ApolloClient fails to be imported as it checks for a global fetch object on import...
import 'cross-fetch/polyfill'
import storeOptions from '@/store/options'
import { store } from '@/store/index.js'
import { Subscription } from '@/model/Subscription.model'
import { SubscriptionQuery } from '@/model/SubscriptionQuery.model'
import { WorkflowService } from '@/services/workflow.service'
import ViewState from '@/model/ViewState.model'

const sandbox = sinon.createSandbox()

const url = '/graphql'

describe('WorkflowService', () => {
  store.replaceState(createStore(storeOptions).state)

  /**
   * @type {WorkflowService}
   */
  let workflowService
  /**
   * @type {DocumentNode}
   */
  let query
  /**
   * @type {SubscriptionQuery}
   */
  let subscriptionQuery
  /**
   * @type {View}
   */
  let view
  /**
   * @type {Subscription}
   */
  let subscription

  beforeEach(() => {
    sandbox.stub(console, 'debug')
    // TODO: really load some mutations
    sandbox.stub(WorkflowService.prototype, 'loadTypes').returns(
      Promise.resolve({
        mutations: [],
        types: [],
      })
    )
    workflowService = new WorkflowService(url)
    workflowService.apolloClient = {
      query: vi.fn(),
      subscribe: () => ({
        subscribe: vi.fn(),
      }),
    }
    // subscription query
    query = gql`
        query {
          workflows {
            id
          }
        }`
    subscriptionQuery = new SubscriptionQuery(
      query,
      {
        workflowID: '~cylc/test',
      },
      'root',
    )
    // Subscription
    subscription = new Subscription(subscriptionQuery)
    // Add one View as subscriber to Subscription
    /**
     * @type {View}
     */
    view = {
      _uid: 'view',
      query: subscriptionQuery,
      viewState: ViewState.NO_STATE,
      setAlert: () => {},
    }
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('getOrCreateSubscription', () => {
    it('should return existing subscriptions', () => {
      const existingSubscription = workflowService.getOrCreateSubscription(view.query)
      expect(existingSubscription).to.deep.equal(subscription)
    })

    it('should create new subscriptions and add to local cache', () => {
      delete workflowService.subscriptions[view.query.name]
      expect(Object.keys(workflowService.subscriptions).length).to.equal(0)
      const newSubscription = workflowService.getOrCreateSubscription(view.query)
      expect(Object.keys(workflowService.subscriptions).length).to.equal(1)
      expect(workflowService.subscriptions[view.query.name]).to.deep.equal(newSubscription)
    })
  })

  describe('startSubscriptions', () => {
    it('should start pending subscriptions', () => {
      const spy = sandbox.spy(workflowService, 'startSubscription')
      workflowService.subscriptions[subscriptionQuery.name] = subscription
      workflowService.startSubscriptions()
      expect(spy.calledOnce).to.equal(true)
    })
  })

  describe('startSubscription', () => {
    it('should stop the subscription if already started, before starting again', () => {
      const observable = { unsubscribe: vi.fn() }
      subscription.observable = observable
      workflowService.startSubscription(subscription)
      expect(observable.unsubscribe).toHaveBeenCalledTimes(1)
    })

    it('should call the subscription callback', () => {
      vi.spyOn(workflowService, 'startCylcSubscription').mockImplementation(() => ({
        subscribe () {},
      }))
      subscription.reload = true
      workflowService.startSubscription(subscription)
      // after a subscription has been started, the reload flag must be set to false
      expect(subscription.reload).to.equal(false)
    })

    describe('ViewState', () => {
      beforeEach(() => {
        workflowService.subscriptions[subscriptionQuery.name] = subscription
        workflowService.subscribe(view)
      })

      it('is set to COMPLETE when it successfully starts a subscription', () => {
        expect(subscription.subscribers.get(view._uid).viewState).to.equal(ViewState.NO_STATE)
        workflowService.startSubscription(subscription)
        expect(subscription.subscribers.get(view._uid).viewState).to.equal(ViewState.COMPLETE)
      })

      it('is set to ERROR if it fails to start the deltas subscription', () => {
        expect(subscription.subscribers.get(view._uid).viewState).to.equal(ViewState.NO_STATE)
        sandbox.stub(console, 'error')
        sandbox.stub(workflowService, 'startCylcSubscription').throws()
        workflowService.startSubscription(subscription)
        expect(subscription.subscribers.get(view._uid).viewState).to.equal(ViewState.ERROR)
      })

      it('goes through states', () => {
        expect(subscription.subscribers.get(view._uid).viewState).to.equal(ViewState.NO_STATE)
        vi.spyOn(workflowService, 'startCylcSubscription').mockImplementation(() => ({
          subscribe ({ next, error }) {
            error('test')
          },
        }))
        const spy = vi.spyOn(subscription, 'handleViewState')
        sandbox.stub(console, 'error')
        workflowService.startSubscription(subscription)
        // The error happens, but immediately, so the view state is set to COMPLETE. In
        // real-life, there will be a few milliseconds delay between the JS creation of
        // the object, and the first WebSockets message with an error, so we will use
        // a spy here instead.
        // Called first time to set as LOADING. Then as ERROR. Finally COMPLETE.
        expect(spy.mock.calls.map(x => x[0].enumKey)).toEqual([
          'LOADING',
          'ERROR',
          'COMPLETE',
        ])
        // TODO: Finishing as COMPLETE when there was an error doesn't seem right
      })
    })
  })

  describe('startCylcSubscription', () => {
    // the bulk of tests for startCylcSubscription are e2e tests, here we only test
    // a few simple scenarios
    it('should throw an error if no query provided', () => {
      expect(() => { workflowService.startCylcSubscription({}) }).to.throw()
    })
  })

  describe('merge', () => {
    it('should merge two queries correctly', () => {
      const query1 = new SubscriptionQuery(
        gql`
        query {
          workflows {
            id
          }
        }`,
        subscriptionQuery.variables,
        'root',
      )
      /**
       * @type {View}
       */
      const view1 = {
        _uid: 'view1',
        query: query1,
      }
      workflowService.subscribe(view1)
      // at this point we have only 1 query, so the computed query must have the exact value we provided
      const expectedQuery1 = print(query1.query)
      const initialQuery = print(workflowService.subscriptions.root.query.query)
      expect(expectedQuery1).to.equal(initialQuery)

      const query2 = new SubscriptionQuery(
        gql`
        query {
        workflows {
          name
        }
      }`,
        subscriptionQuery.variables,
        'root',
      )
      /**
       * @type {View}
       */
      const view2 = {
        _uid: 'view2',
        query: query2,
      }
      workflowService.subscribe(view2)
      // now the queries must have been merged
      const finalQuery = print(workflowService.subscriptions.root.query.query)
      expect(finalQuery).to.contain('name')
    })
  })

  describe('recompute', () => {
    beforeEach(() => {
      workflowService.subscriptions[subscriptionQuery.name] = subscription
      workflowService.subscribe(view)
    })

    it('should not change query if no views were added', () => {
      // at this point we have only 1 query, so the computed query must have the exact value we provided
      const expectedQuery1 = print(subscriptionQuery.query)
      const initialQuery = print(workflowService.subscriptions.root.query.query)
      expect(expectedQuery1).to.equal(initialQuery)
      // calling recompute with the same query shouldn't change the original query
      workflowService.recompute(workflowService.subscriptions.root)
      const finalQuery = print(workflowService.subscriptions.root.query.query)
      expect(expectedQuery1).to.equal(finalQuery)
    })

    it('should throw an error if there are no subscribers', () => {
      subscription.subscribers.delete(view._uid)
      expect(() => { workflowService.recompute(subscription) }).to.throw()
    })

    it('should throw an error if the subscribers have different variables', () => {
      const anotherQuery = new SubscriptionQuery(
        gql`query { workflow { id } }`,
        {
          differentVariable: true,
        },
        'test',
      )
      subscription.subscribers.set(anotherQuery.name, anotherQuery)
      expect(() => { workflowService.recompute(subscription) }).to.throw()
    })
  })

  describe('unsubscribe', () => {
    beforeEach(() => {
      // workflowService.subscriptions[subscriptionQuery.name] = subscription
      workflowService.subscribe(view)
    })

    it('should warn about queries that do not exist', () => {
      const stub = sandbox.stub(console, 'warn')
      workflowService.unsubscribe({ name: 'missing' }, 'irrelevant_uid')
      expect(stub.calledOnce).to.equal(true)
    })

    it('should call unsubscribe if last subscriber is unsubscribed', () => {
      const stub = sandbox.stub(workflowService, 'stopSubscription')
      workflowService.unsubscribe(view.query, view._uid)
      expect(stub.calledOnce).to.equal(true)
    })

    it('should NOT call unsubscribe if there are still subscribers left', () => {
      const anotherView = {
        _uid: 'test',
        query: subscriptionQuery,
      }
      workflowService.subscribe(anotherView)
      const stub = sandbox.stub(workflowService, 'stopSubscription')
      workflowService.unsubscribe(view.query, view._uid)
      expect(stub.calledOnce).to.equal(false)
    })
  })

  describe('stopSubscription', () => {
    it('should remove the subscription', () => {
      subscription.observable = {
        unsubscribe: () => {},
      }
      expect(workflowService.subscriptions[subscription.query.name]).to.not.equal(null)
      workflowService.stopSubscription(subscription)
      expect(workflowService.subscriptions[subscription.query.name]).to.equal(undefined)
    })
  })

  describe('Global data store', () => {
    let $index, next
    beforeEach(() => {
      store.replaceState(createStore(storeOptions).state)
      $index = store.state.workflows.cylcTree.$index
      // Mock the client
      workflowService.apolloClient.subscribe = () => ({
        subscribe (observable) {
          next = observable.next
        },
      })
    })

    it('wipes workflow children on reloaded deltas', () => {
      // the callback should wipe workflow children when a "reloaded" delta is
      // received - see https://github.com/cylc/cylc-ui/pull/1479

      workflowService.subscribe(view)
      workflowService.startSubscriptions()
      // send an added delta which adds a workflow with one task
      next({
        data: {
          deltas: {
            id: 123,
            added: {
              id: 123,
              workflow: { id: '~user/foo' },
              taskProxies: { id: '~user/foo//1/a' },
            },
          },
        },
      })

      // the user/workflow//cycle/task should now be in the store
      expect(Object.keys($index)).toEqual([
        '~user',
        '~user/foo',
        '~user/foo//1',
        '~user/foo//1/a',
      ])

      // send a reloaded delta which adds a new task
      next({
        data: {
          deltas: {
            id: 234,
            added: {
              id: 234,
              workflow: { id: '~user/foo', reloaded: true },
              taskProxies: { id: '~user/foo//2/b' },
            },
          },
        },
      })

      // the cycle "1" and task "1/a" should be gone from the store
      // without the need for an explicit "pruned" delta
      expect(Object.keys($index)).toEqual([
        '~user',
        '~user/foo',
        '~user/foo//2',
        '~user/foo//2/b',
      ])
    })

    it('runs hooks defined in the subscription', () => {
      const onBeforeDelta = vi.fn(() => {
        // Store will be empty before the delta is applied
        expect($index).toEqual({})
      })
      const onDelta = vi.fn(() => {
        // Store should have the new workflow after the delta is applied
        expect($index['~user/foo']).toBeDefined()
      })
      const subscriptionQuery = new SubscriptionQuery(
        query,
        {},
        'root',
        { onBeforeDelta, onDelta }
      )
      view.query = subscriptionQuery
      workflowService.subscribe(view)
      workflowService.startSubscriptions()

      const deltas = {
        added: {
          workflow: { id: '~user/foo' },
        },
      }
      next({
        data: { deltas },
      })
      expect(onBeforeDelta).toHaveBeenCalledWith(deltas)
      expect(onDelta).toHaveBeenCalledWith(deltas)
    })
  })
})
