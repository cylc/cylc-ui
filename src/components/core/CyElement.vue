<template>
  <div></div>
</template>
<script>
import VueCyObj from '@/components/core/Cytoscape'

export default {
  props: {
    definition: {
      type: String,
      default: ''
    },
    debug: {
      type: Boolean,
      default: false
    }
  },
  created () {
    if (this.debug) console.log('[CyElement] [+] created ', this.definition)
    this.add(this.definition)
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    definition (newVal, oldVal) {
      // this.remove(oldVal)
      // this.add(newVal)
      return newVal
    }
  },
  destroyed () {
    if (this.debug) console.log('[CyElement] [x] deleted ', this.definition)
    this.remove(this.definition)
  },
  methods: {
    async add (element) {
      const cy = await VueCyObj.instance
      // add it only if it doesn't exist
      if (cy.$id(element.data.id).length === 0) cy.add({ ...element })
    },
    async remove (element) {
      const cy = await VueCyObj.instance
      // remove it only if it exist
      if (cy.$id(element.data.id).length > 0) cy.remove(`#${element.data.id}`)
    }
  }
}
</script>
