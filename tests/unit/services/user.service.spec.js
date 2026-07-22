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

import { afterEach, describe, expect, it, vi } from 'vitest'
import { getUserProfile } from '@/services/user.service'

describe('getUserProfile', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })
  it('returns user profile object', async () => {
    const expected = {
      username: 'cylc-user-01',
      mode: 'single user',
      permissions: ['read'],
      owner: 'cylc-user-02',
    }
    const response = Promise.resolve({
      ...expected,
      name: expected.username,
      other_stuff: null,
    })
    vi.stubGlobal('fetch', () => ({ ok: true, json: () => response }))
    const user = await getUserProfile()
    expect(user).toMatchObject(expected)
  })

  it('rejects on HTTP error', async () => {
    vi.stubGlobal('fetch', () => ({ ok: false, status: 500, statusText: 'Test Status' }))
    await expect(getUserProfile()).rejects.toThrow('Failed to fetch userprofile: 500 (Test Status)')
  })
})
