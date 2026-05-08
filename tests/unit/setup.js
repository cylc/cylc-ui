// Register global components for tests
import { config } from '@vue/test-utils'
import { VEmptyState, VCardActions } from 'vuetify/components'
import { vi } from 'vitest'

/** Mock the browser ResizeObserver API as it is not currently included
 * in jsdom.
 *
 * @see https://github.com/jsdom/jsdom/issues/3368
 */
class ResizeObserverStub {
  observe () { }
  unobserve () { }
  disconnect () { }
}

window.ResizeObserver ??= ResizeObserverStub
window.DragEvent ??= function () { }

// Mock element scroll API as not currently included in jsdom:
// https://github.com/jsdom/jsdom/issues/1422
Element.prototype.scrollBy ??= function () { }
Element.prototype.scrollIntoView ??= function () { }
Element.prototype.scroll ??= function () { }
Element.prototype.scrollTo ??= function () { }

// Mock localStorage for tests
const localStorageMock = (function () {
  let store = {}
  return {
    getItem: function (key) {
      return store[key] || null
    },
    setItem: function (key, value) {
      // Prevent crash on undefined/null values
      store[key] = value?.toString() ?? null
    },
    removeItem: function (key) {
      delete store[key]
    },
    clear: function () {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

vi.mock('echarts/core', async () => {
  const actual = await vi.importActual('echarts/core')
  return {
    ...actual,
    init: () => ({
      setOption: () => {},
      resize: () => {},
      on: () => {},
      dispose: () => {}
    })
  }
})

// Mock canvas for echarts
HTMLCanvasElement.prototype.getContext = () => {}

config.global.components = {
  VFilterEmptyState: VEmptyState,
  VSelectActions: VCardActions
}
