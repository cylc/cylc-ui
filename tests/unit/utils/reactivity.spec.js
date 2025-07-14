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

import { nextTick, ref, computed } from 'vue'
import { vi } from 'vitest'
import { once, when, until, watchWithControl } from '@/utils/reactivity'

const truthySources = () => [
  ref(true),
  computed(() => true),
  () => true,
]

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
  it.for(truthySources())('works for already-truthy source %s', (source) => {
    let counter = 0
    when(source, () => counter++)
    expect(counter).toEqual(1)
  })
})

describe('once()', () => {
  it('returns a ref that permanently toggles to true when the source becomes truthy', async () => {
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

  it.for(truthySources())('works for already-truthy source %s', (source) => {
    const myRef = once(source)
    expect(myRef.value).toEqual(true)
  })
})

describe('watchWithControl()', () => {
  it('allows pausing and resuming', async () => {
    const source = ref(0)
    const callback = vi.fn()
    const watcher = watchWithControl(source, callback)
    expect(callback).toHaveBeenCalledTimes(0)

    source.value++
    await nextTick()
    expect(callback).toHaveBeenCalledTimes(1)

    watcher.pause()
    source.value++
    await nextTick()
    expect(callback).toHaveBeenCalledTimes(1)

    watcher.resume()
    await nextTick()
    expect(callback).toHaveBeenCalledTimes(1)

    source.value++
    await nextTick()
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('allows manual triggering', async () => {
    const callback = vi.fn()
    const watcher = watchWithControl(ref(null), callback)
    expect(callback).toHaveBeenCalledTimes(0)

    watcher.trigger()
    expect(callback).toHaveBeenCalledTimes(1)

    watcher.pause()
    watcher.trigger()
    expect(callback).toHaveBeenCalledTimes(1)

    watcher.resume()
    watcher.trigger()
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('allows ignoring changes during a callback', async () => {
    const source = ref(0)
    const callback = vi.fn()
    const watcher = watchWithControl(source, callback)

    await watcher.ignore(() => {
      source.value++
    })
    expect(source.value).toEqual(1)
    await nextTick()
    expect(callback).toHaveBeenCalledTimes(0)

    source.value++
    expect(source.value).toEqual(2)
    await nextTick()
    expect(callback).toHaveBeenCalledTimes(1)

    watcher.pause()
    // Check ignore changes while paused does not inadvertently resume the watcher
    await watcher.ignore(() => {
      source.value++
    })
    expect(source.value).toEqual(3)
    await nextTick()
    expect(callback).toHaveBeenCalledTimes(1)
    source.value++
    expect(source.value).toEqual(4)
    await nextTick()
    expect(callback).toHaveBeenCalledTimes(1)
  })
})
