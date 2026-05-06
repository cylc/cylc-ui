import { config } from '@vue/test-utils'
import { VEmptyState, VCardActions } from 'vuetify/components'

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

config.global.components = {
  VFilterEmptyState: VEmptyState,
  VSelectActions: VCardActions
}

window.ResizeObserver ??= ResizeObserverStub
window.DragEvent ??= function () { }

// Mock localStorage for tests
const localStorageMock = (function () {
  let store = {}
  return {
    getItem: function (key) {
      return store[key] || null
    },
    setItem: function (key, value) {
      store[key] = value.toString()
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

// Mock canvas for echarts
HTMLCanvasElement.prototype.getContext = function () {
  return {
    // Add a 'dpr' property to fix the error
    dpr: 1,
    fillRect: function () {},
    clearRect: function () {},
    getImageData: function (x, y, w, h) {
      return {
        data: new Array(w * h * 4)
      }
    },
    putImageData: function () {},
    createImageData: function () {
      return []
    },
    // Add a mock for createLinearGradient
    createLinearGradient: function () {
      return {
        addColorStop: function () {}
      }
    },
    setTransform: function () {},
    drawImage: function () {},
    save: function () {},
    fillText: function () {},
    restore: function () {},
    beginPath: function () {},
    moveTo: function () {},
    lineTo: function () {},
    closePath: function () {},
    stroke: function () {},
    translate: function () {},
    scale: function () {},
    rotate: function () {},
    arc: function () {},
    fill: function () {},
    measureText: function () {
      return { width: 0 }
    },
    transform: function () {},
    rect: function () {},
    clip: function () {},
    bezierCurveTo: function () {}
  }
}

// Mock element scroll API as not currently included in jsdom:
// https://github.com/jsdom/jsdom/issues/1422
Element.prototype.scrollBy ??= function () { }
Element.prototype.scrollIntoView ??= function () { }
Element.prototype.scroll ??= function () { }
Element.prototype.scrollTo ??= function () { }
