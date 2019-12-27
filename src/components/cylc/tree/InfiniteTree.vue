<template>
  <!-- NB: we are setting the itemSize to null to use the "Variable size mode" of the vue-virtual-scroller -->
  <RecycleScroller
    page-mode
    key-field="id"
    :class="className"
    :items="tree.nodes"
    :item-size="null"
  >
    <!-- eslint-disable-next-line vue/no-unused-vars -->
    <div slot-scope="{ item, index }">
      <slot
        name="default"
        v-bind="{
          node: item,
          tree: tree
        }"
      />
    </div>
  </RecycleScroller>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller'
// TODO: import InifiniteTree from 'infinite-tree' is not working with dependency installed from git commit. Replace once there is a new release of infinite-tree
import InfiniteTree from '../../../../node_modules/infinite-tree/dist/infinite-tree'

const lcfirst = (str) => {
  str += ''
  return str.charAt(0).toLowerCase() + str.substr(1)
}

export default {
  name: 'InfiniteTree',
  components: {
    RecycleScroller
  },
  props: {
    treeData: {
      type: [Array, Object],
      default: () => {
        return []
      }
    },
    autoOpen: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: false
    },
    tabIndex: {
      type: Number,
      default: 1
    },
    className: {
      type: String,
      default: 'scroll-box'
    },
    rowHeight: {
      type: Number,
      default: 32
    },
    loadNodes: {
      type: Function,
      default: () => {}
    },
    shouldSelectNode: {
      type: Function,
      default: () => {}
    },
    shouldLoadNodes: {
      type: Function,
      default: () => {}
    },
    // Callback invoked before updating the tree.
    onContentWillUpdate: {
      type: Function,
      default: null
    },
    // Callback invoked when the tree is updated.
    onContentDidUpdate: {
      type: Function,
      default: null
    },
    // Callback invoked when a node is opened.
    onOpenNode: {
      type: Function,
      default: null
    },
    // Callback invoked when a node is closed.
    onCloseNode: {
      type: Function,
      default: null
    },
    // Callback invoked when a node is selected or deselected.
    onSelectNode: {
      type: Function,
      default: null
    },
    // Callback invoked before opening a node.
    onWillOpenNode: {
      type: Function,
      default: null
    },
    // Callback invoked before closing a node.
    onWillCloseNode: {
      type: Function,
      default: null
    },
    // Callback invoked before selecting or deselecting a node.
    onWillSelectNode: {
      type: Function,
      default: null
    },
    onKeyUp: {
      type: Function,
      default: null
    },
    onKeyDown: {
      type: Function,
      default: null
    },
    onMouseLeave: {
      type: Function,
      default: null
    },
    onMouseEnter: {
      type: Function,
      default: null
    }
  },
  inheritAttrs: false,
  data () {
    return {
      tree: {
        nodes: []
      },
      nodes: [],
      eventHandlers: {
        onContentWillUpdate: null,
        onContentDidUpdate: null,
        onOpenNode: null,
        onCloseNode: null,
        onSelectNode: null,
        onWillOpenNode: null,
        onWillCloseNode: null,
        onWillSelectNode: null,
        onKeyUp: null,
        onKeyDown: null,
        onMouseEnter: null,
        onMouseLeave: null
      }
    }
  },
  watch: {
    treeData: {
      handler (newValue) {
        this.tree.loadData(newValue)
      }
    }
  },
  mounted () {
    this.tree = new InfiniteTree({
      el: this.$refs.tree,
      ...this.$props,
      data: this.$props.treeData
    })

    this.tree.update = () => {
      this.tree.emit('contentWillUpdate')
      this.nodes = this.tree.nodes
      this.$nextTick(function () {
        this.tree.emit('contentDidUpdate')
      })
    }

    Object.keys(this.eventHandlers).forEach(key => {
      if (!this[key]) {
        return
      }
      const eventName = lcfirst(key.substr(2)) // e.g. onContentWillUpdate -> contentWillUpdate
      this.eventHandlers[key] = this[key]
      this.tree.on(eventName, this.eventHandlers[key])
    })
  },
  beforeDestroy () {
    Object.keys(this.eventHandlers).forEach(key => {
      if (!this.eventHandlers[key]) {
        return
      }
      const eventName = lcfirst(key.substr(2)) // e.g. onUpdate -> update
      this.tree.removeListener(eventName, this.eventHandlers[key])
      this.eventHandlers[key] = null
    })

    this.tree.destroy()
    this.tree = null
  }
}
</script>
