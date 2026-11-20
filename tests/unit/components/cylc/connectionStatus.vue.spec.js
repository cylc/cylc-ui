/*
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

import { nextTick } from 'vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import sinon from 'sinon'
import { vuetifyOptions } from '@/plugins/vuetify'
import { store } from '@/store/index'
import storeOptions from '@/store/options'
import ConnectionStatus from '@/components/cylc/ConnectionStatus.vue'
import { createClient } from 'graphql-ws'
import { createSubscriptionClient, maxSocketRetryAttempts } from '@/graphql/index'

vi.mock('graphql-ws', () => ({ createClient: vi.fn() }))

describe('Connection Status component', () => {
  let hooks, wrapper

  function getSnackbar () {
    const { vm } = wrapper.getComponent({ name: 'VSnackbar' })
    return vm.modelValue ? vm.text : null
  }

  beforeEach(() => {
    store.replaceState(storeOptions.state())
    createSubscriptionClient('ws://test')
    hooks = vi.mocked(createClient).mock.lastCall[0].on

    wrapper = mount(ConnectionStatus, {
      global: {
        plugins: [createVuetify(vuetifyOptions), store],
      },
    })
  })

  it('shows "connecting" until connected', async () => {
    // Initially, the snackbar should not be visible
    expect(getSnackbar()).toBeNull()

    // First connection attempt...
    hooks.connecting(false)
    await nextTick()
    expect(getSnackbar()).toEqual('Connecting...')

    // ... unsuccessful - still say connecting until next attempt
    hooks.closed()
    await nextTick()
    expect(getSnackbar()).toEqual('Connecting...')

    // Second connection attempt...
    hooks.connecting(true)
    await nextTick()
    expect(getSnackbar()).toEqual('Connecting...')

    // Success:
    hooks.connected()
    await nextTick()
    expect(getSnackbar()).toBeNull()
  })

  it('shows "connection lost" when socket closed by server', async () => {
    hooks.connected()
    await nextTick()
    expect(getSnackbar()).toBeNull()

    // Disconnection occurs
    hooks.closed()
    await nextTick()
    expect(getSnackbar()).toEqual('Connecting...')

    // Reconnection attempt unsuccessful due to server being unavailable
    hooks.connecting(false)
    sinon.stub(console, 'error')
    hooks.error()
    sinon.restore()
    await nextTick()
    expect(getSnackbar()).toEqual('Connection lost')
  })

  it('shows "connecting" until retries are exhausted', async () => {
    for (let i = 1; i < maxSocketRetryAttempts; i++) {
      hooks.connecting(true)
      hooks.closed()
      await nextTick()
      expect(getSnackbar()).toEqual('Connecting...')
    }

    hooks.connecting(true)
    hooks.closed()
    await nextTick()
    expect(getSnackbar()).toEqual('Connection lost')
  })
})
