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
