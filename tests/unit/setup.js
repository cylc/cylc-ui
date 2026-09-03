import { config } from '@vue/test-utils'
import { User } from '@/model/User.model'

config.global.provide = {
  user: new User({ username: 'cylc', permissions: [], owner: 'owner' }),
  versionInfo: { },
}

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
