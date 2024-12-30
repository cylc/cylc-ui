/*
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

import { nextTick, ref } from 'vue'
import { once, when, until } from '@/utils/index'

describe.each([
  { func: when, description: 'watches source until true and then stops watching' },
  { func: until, description: 'returns a promise that resolves when source becomes true' },
])('$func', ({ func, description }) => {
  it(description, async () => {
    const source = ref(false)
    let counter = 0
    switch (func) {
      case when:
        when(source, () => counter++); break
      case until:
        until(source).then(() => counter++); break
    }
    expect(counter).toEqual(0)
    source.value = true
    await nextTick()
    expect(counter).toEqual(1)
    source.value = false
    await nextTick()
    source.value = true
    await nextTick()
    expect(counter).toEqual(1)
  })
})

describe('when()', () => {
  it('works for a source that is already truthy', () => {
    const source = ref(true)
    let counter = 0
    when(source, () => counter++)
    expect(counter).toEqual(1)
  })
})

describe('once()', () => {
  it('returns a ref that permanently toggles to true when the source bevomes truthy', async () => {
    const source = ref(false)
    const myRef = once(source)
    expect(myRef.value).toEqual(false)
    source.value = true
    await nextTick()
    expect(myRef.value).toEqual(true)
    source.value = false
    await nextTick()
    expect(myRef.value).toEqual(true)
  })

  it('works for a source that is already truthy', () => {
    const source = ref(true)
    const myRef = once(source)
    expect(myRef.value).toEqual(true)
  })
})
