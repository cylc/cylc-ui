<template>
  <div id="cytoscape" ref="cytoscape">
    <cy-element
      v-for="def in elements"
      :key="`${def.data.id}`"
      :definition="def"
      :debug="debug"
    ></cy-element>
    <slot></slot>
  </div>
</template>
<script>
import cytoscape from 'cytoscape'
import Vue from 'vue'

export const sync = state => {
  console.log('sync state: ', state)
  let elements = [...state.elements]
  // replace the `elements` field with a custom one
  Object.defineProperty(state, 'elements', {
    get () {
      return elements
    },
    set (newElements) {
      // update cytoscape view
      VueCyObj.instance.then(c => {
        // remove all the elements in cytoscape that are not in the newElements
        const selector = newElements.map(el => `#${el.data.id}`).join(', ')
        c.remove(cy.$(selector).absoluteComplement())
        // add new elements if needed
        newElements.forEach(el => {
          if (c.$(`#${el.data.id}`).length === 0) c.add(el)
        })
      })
      elements = newElements
    },
    enumerable: true,
    configurable: true
  })
  // trigger the initialization, will add the elements if needed
  state.elements = elements
  return state
}

let resolver = null
let cy = null

// eslint-disable-next-line no-unused-vars
const promise = new Promise((resolve, reject) => {
  resolver = resolve
})

const VueCyObj = {
  reset () {
    cy = null
  },
  get instance () {
    return promise
  },
  setConfig (config, preConfig, afterCreated) {
    // if a pre-configuration function is passed
    // then call it with the cytoscape constructor
    // this is useful to install/use extensions
    if (preConfig) {
      preConfig(cytoscape)
    }

    cy = cytoscape(config)
    // if a afterCreated function is passed
    // then call it with the cytoscape *instance*
    if (afterCreated) {
      afterCreated(cy)
    }

    // let the cytoscape instance available for the awaiters
    if (resolver) {
      resolver(cy)
    }
  }
}

Vue.prototype.$cytoscape = VueCyObj

export { VueCyObj }

export default {
  props: {
    config: {
      type: Object,
      default: null
    },
    preConfig: {
      type: Function,
      default: null
    },
    afterCreated: {
      type: Function,
      default: null
    },
    elementAdded: {
      type: Function,
      default: null
    },
    elementRemoved: {
      type: Function,
      default: null
    },
    debug: Boolean,
    reflection: Boolean
  },
  data () {
    return {
      elements: []
    }
  },
  created () {
    if (this.debug) console.log('[Cytoscape] created ')
    let els = []
    if (this.config && this.config.elements) {
      if (
        this.config.elements.nodes &&
        Array.isArray(this.config.elements.nodes)
      ) {
        els = [
          ...els,
          ...this.config.elements.nodes.map(n => ({ group: 'nodes', ...n }))
        ]
      }
      if (
        this.config.elements.edges &&
        Array.isArray(this.config.elements.edges)
      ) {
        els = [
          ...els,
          ...this.config.elements.edges.map(n => ({
            ...n,
            group: 'edges',
            data: {
              id: n.data.id ? n.data.id : `${n.data.source}_${n.data.target}`,
              ...n.data
            }
          }))
        ]
      }

      if (Array.isArray(this.config.elements)) {
        els = [...this.config.elements]
      }
    }

    if (this.debug) console.log('[Cytoscape] elements set to', els)
    this.elements = els
  },
  async mounted () {
    // create a cytoscape instance using the referenced div
    const container = this.$refs.cytoscape
    const config = {
      container, // container to render in
      ...this.config // the data passed
    }
    VueCyObj.setConfig(config, this.preConfig, this.afterCreated)
    const cy = await VueCyObj.instance
    if (this.debug) console.log('[Cytoscape] cy', cy)
    // register all the component events as cytoscape ones
    for (const [eventType, callback] of Object.entries(this.$listeners)) {
      cy.on(eventType, event => callback(event))
    }
    if (this.reflection) {
      if (this.debug) console.log('[Cytoscape] dom reflection is on')
      // listen on elements creation/removal, and perform the reflection here
      cy.on('add', event => {
        const element = {
          group: event.target.group(),
          data: event.target.data()
        }
        if (this.debug) console.log('[Cytoscape] adding element', element)
        const { elements } = this
        const addReflection = () => {
          if (this.debug) console.log('[Cytoscape] [+] added element', element)
          elements.push(element)
        }
        // if there is a hook, then pass the data to it
        if (this.elementAdded) this.elementAdded(element, addReflection)
        // otherwise, just reflect the changes here
        else addReflection()
      })
      cy.on('remove', event => {
        const id = event.target.id()
        if (this.debug) console.log('[Cytoscape] removing element', id)
        const { elements } = this
        const removeReflection = () => {
          // console.log('event removing: ', id)
          if (this.debug) console.log('[Cytoscape] [x] removed element', id)
          // remove the element, in place
          elements.splice(elements.findIndex(n => n.data.id === id), 1)
        }
        // if there is a hook, then pass the data to it
        if (this.elementRemoved) this.elementRemoved(id, removeReflection)
        // otherwise, just reflect the changes here
        else removeReflection()
      })
    }
  }
}
</script>
<style scoped>
#cytoscape {
  width: 100%;
  height: 100%;
}
</style>
