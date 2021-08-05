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
import { createUrl, getUserNameFromUrl } from '@/utils/urls'

describe('urls', () => {
  const PROTOCOL = 'https:'
  const HOST = 'localhost:8088'
  const PATHNAME = 'research/users/cylc/'
  const DEFAULT_LOCATION = {
    protocol: PROTOCOL,
    host: HOST,
    pathname: PATHNAME
  }
  let originalWindow
  before(() => {
    originalWindow = global.window
    Object.defineProperty(window, 'location', {
      value: {
        pathname: ''
      },
      writable: true
    })
  })
  afterEach(() => {
    global.window = originalWindow
  })
  it('should create new URLs', () => {
    const tests = [
      {
        path: '',
        websockets: false,
        expected: `${PROTOCOL}//${HOST}/${PATHNAME}`,
        location: DEFAULT_LOCATION
      },
      {
        path: '',
        websockets: false,
        baseOnly: true,
        expected: `${PROTOCOL}//${HOST}/`,
        location: DEFAULT_LOCATION
      },
      {
        path: 'subscriptions',
        websockets: false,
        expected: `${PROTOCOL}//${HOST}/${PATHNAME}subscriptions`,
        location: DEFAULT_LOCATION
      },
      {
        path: 'subscriptions',
        websockets: true,
        expected: `wss://${HOST}/${PATHNAME}subscriptions`,
        location: DEFAULT_LOCATION
      },
      {
        path: 'subscriptions',
        websockets: true,
        expected: `ws://${HOST}/${PATHNAME}subscriptions`,
        location: {
          protocol: 'http:',
          host: HOST,
          pathname: PATHNAME
        }
      },
      {
        path: '//subscriptions',
        websockets: false,
        expected: `${PROTOCOL}//${HOST}/${PATHNAME}subscriptions`,
        location: DEFAULT_LOCATION
      },
      {
        path: '//graphql/endpoint//subscriptions',
        websockets: false,
        expected: `${PROTOCOL}//${HOST}/${PATHNAME}graphql/endpoint/subscriptions`,
        location: DEFAULT_LOCATION
      },
      {
        path: '//graphql/endpoint//subscriptions///',
        websockets: false,
        expected: `${PROTOCOL}//${HOST}/${PATHNAME}graphql/endpoint/subscriptions/`,
        location: DEFAULT_LOCATION
      },
      {
        path: '     ',
        websockets: false,
        expected: `${PROTOCOL}//${HOST}/${PATHNAME}`,
        location: DEFAULT_LOCATION
      },
      {
        path: ' graphql/endpoint//  ',
        websockets: false,
        expected: `${PROTOCOL}//${HOST}/${PATHNAME}graphql/endpoint/`,
        location: DEFAULT_LOCATION
      }
    ]
    tests.forEach((test) => {
      const originalWindow = global.window
      try {
        global.window = {
          location: test.location
        }
        // || false just to prevent accidental undefined values
        const url = createUrl(
          test.path,
          test.websockets || false,
          test.baseOnly || false)
        expect(url).to.equal(test.expected)
      } finally {
        global.window = originalWindow
      }
    })
  })
  it('should get username from URL', () => {
    const tests = [
      {
        fallbackUsername: 'cylc',
        pathname: '/',
        expected: 'cylc'
      },
      {
        fallbackUsername: 'cylc',
        pathname: '',
        expected: 'cylc'
      },
      {
        fallbackUsername: 'cylc',
        pathname: null,
        expected: 'cylc'
      },
      {
        fallbackUsername: 'cylc',
        pathname: undefined,
        expected: 'cylc'
      },
      {
        fallbackUsername: 'cylc',
        pathname: '/user/research/',
        expected: 'research'
      }
    ]
    tests.forEach(test => {
      window.location.pathname = test.pathname
      const username = getUserNameFromUrl(test.fallbackUsername)
      expect(username).to.equal(test.expected)
    })
  })
})
