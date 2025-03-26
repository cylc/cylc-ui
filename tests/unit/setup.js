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

// Mock element scroll API as not currently included in jsdom:
// https://github.com/jsdom/jsdom/issues/1422
Element.prototype.scrollBy ??= function () { }
Element.prototype.scrollIntoView ??= function () { }
