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

import { createUrl } from '@/utils/urls'

describe('urls', () => {
  const PROTOCOL = 'https:'
  const HOST = 'localhost:8088'
  const PATHNAME = 'research/users/cylc/'
  const DEFAULT_LOCATION = {
    protocol: PROTOCOL,
    host: HOST,
    pathname: PATHNAME
  }
  it.each([
    {
      path: '',
      opts: { websockets: false },
      expected: `${PROTOCOL}//${HOST}/${PATHNAME}`,
    },
    {
      path: '',
      opts: { websockets: false, baseOnly: true },
      expected: `${PROTOCOL}//${HOST}/`,
    },
    {
      path: 'subscriptions',
      opts: { websockets: false },
      expected: `${PROTOCOL}//${HOST}/${PATHNAME}subscriptions`,
    },
    {
      path: 'subscriptions',
      opts: { websockets: true },
      expected: `wss://${HOST}/${PATHNAME}subscriptions`,
    },
    {
      path: 'subscriptions',
      opts: { websockets: true },
      expected: `ws://${HOST}/${PATHNAME}subscriptions`,
      location: {
        protocol: 'http:',
        host: HOST,
        pathname: PATHNAME
      }
    },
    {
      path: '//subscriptions',
      opts: { websockets: false },
      expected: `${PROTOCOL}//${HOST}/${PATHNAME}subscriptions`,
    },
    {
      path: '//graphql/endpoint//subscriptions',
      opts: { websockets: false },
      expected: `${PROTOCOL}//${HOST}/${PATHNAME}graphql/endpoint/subscriptions`,
    },
    {
      path: '//graphql/endpoint//subscriptions///',
      opts: { websockets: false },
      expected: `${PROTOCOL}//${HOST}/${PATHNAME}graphql/endpoint/subscriptions/`,
    },
    {
      path: '     ',
      opts: { websockets: false },
      expected: `${PROTOCOL}//${HOST}/${PATHNAME}`,
    },
    {
      path: ' graphql/endpoint//  ',
      opts: { websockets: false },
      expected: `${PROTOCOL}//${HOST}/${PATHNAME}graphql/endpoint/`,
    }
  ])('%# createURL($path, ...)', ({ path, location = DEFAULT_LOCATION, opts, expected }) => {
    const originalWindow = global.window
    try {
      global.window = {
        location
      }
      expect(createUrl(path, opts)).to.equal(expected)
    } finally {
      global.window = originalWindow
    }
  })
})
