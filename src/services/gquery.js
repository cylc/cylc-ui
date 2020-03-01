import { parse } from 'graphql/language/parser'
import { print } from 'graphql/language/printer'

function gClone (query) {
  /** Clone a GraphQL query.
   * Why oh why isn't there a better way of doing this in JS!
   * @param {Object} query - Parsed GraphQL query.
   * @return {Object} Deep clone of the provided query.
   */
  // TODO - consider serialising via parse(print(query));
  return JSON.parse(JSON.stringify(query))
}

function getSelections (a) {
  /**
   * Return map of selections present on a node.
   * @param {Object} a - Node of GraphQL query.
   * @return {Object} All selections present on this node.
   */
  if (!a.selectionSet || !a.selectionSet.selections) {
    return {}
  }
  const selections = {}
  for (const selection of a.selectionSet.selections) {
    if (selection.kind === 'Field') {
      let key = selection.name.value
      if (Object.hasOwnProperty.call(selection, 'alias') && selection.alias) {
        key = selection.alias.value
      }
      selections[key] = selection
    }
  }
  return selections
}

function mergeSelection (a, b) {
  /**
   * Merge node b into node a (modifies a in-place).
   * @param {Object} a - Node of a GraphQL query.
   * @param {Object} b - Node of a GraphQL query.
   */
  const aSel = getSelections(a)
  const bSel = getSelections(b)
  for (const selection in bSel) {
    if (!(selection in aSel)) {
      a.selectionSet.selections.push(gClone(bSel[selection]))
    } else {
      mergeSelection(aSel[selection], bSel[selection])
    }
  }
}

function merge (a, b) {
  /**
   * Merge two graphql schema (modifies a in-place).
   * @param {Object} a - Parsed GraphQL query.
   * @param {Object} b - Parsed GraphQL query.
   */
  mergeSelection(a.definitions[0], b.definitions[0])
}

function prefixLines (str, pref) {
  /**
   * Prefixes each line of a multi-line string.
   * @param {string} str - Multi-line string.
   * @param {string} prefix - Line prefix.
   * @return {string}
   */
  return pref + str.replace(/\n/g, `\n${pref}`)
}

class GQuery {
  /**
   * GraphQL proxy, designed to serve as a single point of access to a
   * GraphQL endpoint for a collection of views with potentially overlapping
   * queries.
   */
  constructor () {
    this.query = null
    this.subscriptions = []
    this.views = []
  }

  recompute () {
    /**
     * Compute the combined query from all registered subscriptions.
     */
    if (this.subscriptions.length < 1) {
      this.query = null
      return
    }
    // merge together active subscriptions
    const root = gClone(this.subscriptions[0].query)
    for (const subscription of this.subscriptions.slice(1)) {
      merge(root, subscription.query)
    }
    this.query = root

    // TODO - remove
    this.print()
  }

  register (view, callbacks) {
    /**
     * Register a view to this instance.
     * @param {Object} view - The view to register.
     * @param {Object} callbacks - A map of the form {name: fcn}.
     */
    this.views.push({
      id: view.viewID,
      view,
      ...callbacks
    })
  }

  unregister (view) {
    /**
     * Unregister a view (all subscriptions will be dropped.
     * @param {Object} view - The view to unregister.
     */
    this.views = this.views.filter(
      v => v.view !== view
    )
    this.subscriptions = this.subscriptions.filter(
      s => s.view !== view
    )
    this.recompute()
  }

  subscribe (view, query) {
    /**
     * Subscribe a new query.
     * @param {Object} view - The view to subscribe the query to.
     * @param {string} query - The query to subscribe.
     * @return {number} The subscription ID (used for un-subscribing).
     */
    const id = Math.random()
    this.subscriptions.push({
      id,
      view,
      query: parse(query),
      active: false
    })
    this.recompute()
    return id
  }

  unsubscribe (id) {
    /**
     * Un-subscribe from a query.
     * @param {number} id - The subscription ID to un-subscribe.
     */
    this.subscriptions = this.subscriptions.filter(
      s => s.id !== id
    )
    this.recompute()
  }

  request () {
  }

  callbackActive () {
    /**
     * Run callback functions registered by views.
     */
    // activeCallback - called when all subscriptions are active
    this.views
      .filter(v => v.activeCallback)
      .forEach(view => {
        if (
          this.subscriptions
            .filter(s => s.view === view.view)
            .every(s => s.active === true)
        ) {
          view.activeCallback(true)
        }
      })
  }

  print () {
    /**
     * Dump a human-readable representation of all subscriptions.
     */
    if (process.env.NODE_ENV === 'production') {
      return
    }
    let ret = 'Combined Query:'
    if (this.query) {
      ret += '\n' + prefixLines(print(this.query), '    ')
    } else {
      ret += `\n    ${this.query}`
    }

    this.views.forEach(view => {
      ret += `\n${view.id}`
      this.subscriptions
        .filter(s => s.view === view.view)
        .forEach(subscription => {
          ret += `\n    Subscription ${subscription.id}`
          ret += '\n' + prefixLines(print(subscription.query), '    ')
        })
    })

    // eslint-disable-next-line no-console
    console.debug(ret)
  }
}

export { GQuery }
