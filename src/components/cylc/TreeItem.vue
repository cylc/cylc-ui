<script>
import Task from '@/components/cylc/Task'
import Job from '@/components/cylc/Job'
import { TreeEventBus } from '@/components/cylc/tree/event-bus'
import { VRow, VFlex, VLayout, VContainer, VCol } from 'vuetify/lib/components'

/**
 * Offset used to move nodes to the right or left, to represent the nodes hierarchy.
 * @type {number} integer
 */
const NODE_DEPTH_OFFSET = 30

function createNodeLayout (createElement, nodeClicked, children) {
  return createElement(VLayout, {
    class: 'node-data row wrap',
    on: {
      click: nodeClicked
    }
  }, children)
}

export default {
  name: 'TreeItem',
  functional: false,
  render: function (createElement) {
    // the node's left icon; used for expand/collapse
    const expandCollapseButton = createElement(VFlex, {
      class: 'node-expand-collapse-button shrink',
      on: {
        click: this.typeClicked
      },
      style: this.getTypeStyle()
    }, this.isExpanded ? '▽' : '▷')
    const divContents = []

    // v-row displayed only if depth >= this minimum depth
    if (this.depth >= this.minDepth) {
      const rowContents = []
      if (this.hasChildren) {
        rowContents.push(expandCollapseButton)
      }
      // the node value
      let node = null
      switch (this.node.__type) {
        case 'cyclepoint':
          node = createNodeLayout(createElement, this.nodeClicked, [
            createElement(VFlex, {
              class: 'shrink'
            }, [
              createElement(Task, {
                props: {
                  status: this.node.state,
                  progress: 0
                }
              })
            ]),
            createElement(VFlex, {
              class: 'grow'
            }, [
              createElement('span', {
                class: 'mx-1'
              }, this.node.name)
            ])
          ])
          break
        case 'task':
          // eslint-disable-next-line no-case-declarations
          const taskChildren = []
          if (!this.isExpanded && Object.hasOwnProperty.call(this.node, 'children') && Array.isArray(this.node.children)) {
            const taskJobs = []
            // task summary
            for (const [index, task] of this.node.children.entries()) {
              const key = `${task.id}-summary-${index}`
              taskJobs.push(createElement(Job, {
                key: key,
                props: {
                  status: task.state
                }
              }))
            }
            const taskChild = createElement(VFlex, {
              class: 'grow ml-4'
            }, taskJobs)
            taskChildren.push(taskChild)
          }
          node = createNodeLayout(createElement, this.nodeClicked, [
            createElement(VFlex, {
              class: 'shrink'
            }, [
              createElement(Task, {
                props: {
                  status: this.node.state,
                  progress: 0
                }
              })
            ]),
            createElement(VFlex, {
              class: 'shrink'
            }, [
              createElement('span', {
                class: 'mx-1'
              }, this.node.name)
            ]),
            taskChildren
          ])
          break
        case 'job':
          node = createNodeLayout(createElement, this.jobNodeClicked, [
            createElement(VFlex, {
              class: 'shrink'
            }, [
              createElement(Job, {
                props: {
                  status: this.node.state
                }
              })
            ]),
            createElement(VFlex, {
              class: 'xs2 md1 lg1'
            }, [
              createElement('span', {
                class: 'mx-1'
              }, this.node.name)
            ]),
            createElement(VFlex, {
              class: 'grow'
            }, [
              createElement('span', {
                class: 'grey--text'
              },
              this.node.host)
            ])
          ])
          break
        default:
          // default node value
          node = createNodeLayout(createElement, this.nodeClicked, [
            createElement('span', {
              on: {
                click: this.nodeClicked
              },
              class: 'mx-1'
            }, this.node.name)
          ])
          break
      }
      rowContents.push(node)
      // each TreeItem is a VRow
      const row = createElement(VRow, {
        'v-show': this.depth >= this.minDepth,
        class: this.getNodeClass(),
        style: this.getNodeStyle()
      }, rowContents)
      divContents.push(row)
    }

    // job leaf
    if (this.displayLeaf && this.node.__type === 'job') {
      const leafProperties = []
      this.leafProperties.forEach((leafProperty) => {
        leafProperties.push(createElement(VRow, {
          key: leafProperty.id,
          class: 'no-gutters'
        }, [
          createElement(VCol, {
            class: 'xs-4 sm-4 md-4 lg-2 xl-2 no-wrap'
          }, [
            createElement('span', {
              class: 'px-4'
            }, leafProperty.title)
          ]),
          createElement(VCol, {
            class: 'wrap'
          }, [
            createElement('span', {
              class: 'grey--text'
            }, this.node[leafProperty.property])
          ])
        ]))
      })
      divContents.push(createElement(VContainer, {
        class: 'leaf'
      }, [
        createElement('div', {
          class: 'arrow-up',
          style: this.getLeafTriangleStyle()
        }),
        createElement(VCol, {
          class: 'leaf-data font-weight-light py-4'
        }, [
          leafProperties
        ])
      ]))
    }

    // child TreeItem (recursion happens here!)
    if (this.isExpanded && Object.hasOwnProperty.call(this.node, 'children') && Array.isArray(this.node.children)) {
      const children = this.node.children.map((child) => {
        return createElement('TreeItem', {
          ref: 'treeitem',
          key: child.id,
          props: {
            node: child,
            depth: this.depth + 1,
            hoverable: this.hoverable,
            'min-depth': this.minDepth,
            initialExpanded: this.initialExpanded
          }
        })
      })
      divContents.push(createElement('span', {}, children))
    }
    // component single-element, a div
    return createElement('div', {}, divContents)
  },
  components: {
    task: Task,
    job: Job,
    VRow,
    VLayout,
    VFlex,
    VContainer,
    VCol
  },
  props: {
    node: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    minDepth: {
      type: Number,
      default: 0
    },
    hoverable: Boolean,
    initialExpanded: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      active: false,
      selected: false,
      isExpanded: this.initialExpanded,
      leafProperties: [
        {
          title: 'host id',
          property: 'host'
        },
        {
          title: 'job id',
          property: 'batchSysJobId'
        },
        {
          title: 'batch sys',
          property: 'batchSysName'
        },
        {
          title: 'submit time',
          property: 'submittedTime'
        },
        {
          title: 'start time',
          property: 'startedTime'
        },
        {
          title: 'finish time',
          property: 'finishedTime'
        },
        {
          title: 'latest message',
          property: 'latestMessage'
        }
      ],
      displayLeaf: false
    }
  },
  computed: {
    hasChildren () {
      return Object.prototype.hasOwnProperty.call(this.node, 'children')
    }
  },
  created () {
    TreeEventBus.$emit('tree-item-created', this)
  },
  beforeDestroy () {
    TreeEventBus.$emit('tree-item-destroyed', this)
  },
  beforeMount () {
    if (Object.prototype.hasOwnProperty.call(this.node, 'expanded')) {
      this.isExpanded = this.node.expand
      this.emitExpandCollapseEvent(this.isExpanded)
    }
  },
  methods: {
    typeClicked () {
      this.isExpanded = !this.isExpanded
      this.emitExpandCollapseEvent(this.isExpanded)
    },
    /**
     * Emits an event `tree-item-expanded` if `expanded` is true, or emits
     * `tree-item-collapsed` if `expanded` is false.
     * @param {boolean} expanded whether the node is expanded or not
     */
    emitExpandCollapseEvent (expanded) {
      if (expanded) {
        TreeEventBus.$emit('tree-item-expanded', this)
      } else {
        TreeEventBus.$emit('tree-item-collapsed', this)
      }
    },
    getTypeStyle () {
      const styles = {}
      if (this.hasChildren) {
        styles.cursor = 'pointer'
      }
      return styles
    },
    /**
     * Handler for when any node of the tree was clicked, except jobs.
     * @param {event} e event
     */
    nodeClicked (e) {
      TreeEventBus.$emit('tree-item-clicked', this)
    },
    /**
     * Handler for when a job node was clicked.
     * @param {event} e event
     */
    jobNodeClicked (e) {
      this.displayLeaf = !this.displayLeaf
    },
    getNodeStyle () {
      // we need to compensate for the minimum depth set by the user, subtracting it
      // from the node depth.
      const depthDifference = this.depth - this.minDepth
      return {
        'padding-left': `${depthDifference * NODE_DEPTH_OFFSET}px`
      }
    },
    /**
     * All nodes have the same padding-left. However, the job leaf node needs special care, as it will occupy the
     * whole content area.
     *
     * For this, we calculate it similarly to `getNodeStyle` but doing the reverse, to move the element to the
     * left, instead of moving it to the right. Using `depth` to calculate the exact location for the element.
     */
    getLeafTriangleStyle () {
      const depthDifference = this.depth - this.minDepth
      return {
        'margin-left': `${depthDifference * NODE_DEPTH_OFFSET}px`
      }
    },
    getNodeClass () {
      return {
        node: true,
        'node--hoverable': this.hoverable,
        'node--active': this.active,
        'ml-3': true
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '~vuetify/src/styles/styles.sass';

$active-color: #BDD5F7;

@mixin active-state() {
  background-color: $active-color;
  &:hover {
    background-color: $active-color;
  }
}

@mixin states() {
  &:hover {
    background-color: map-get($grey, 'lighten-3');
  }
}

.node {
  line-height: 1.8em;

  &--hoverable {
    @include states()
  }

  &--active {
    @include active-state()
  }

  .node-data {
    margin-left: 6px;
  }
}
.type {
  margin-right: 10px;
}

$arrow-size: 15px;
$leaf-background-color: map-get($grey, 'lighten-3');

.leaf {
  padding: 0;
  margin: 0;
  .arrow-up {
    width: 0;
    height: 0;
    border-left: $arrow-size solid transparent;
    border-right: $arrow-size solid transparent;
    border-bottom: $arrow-size solid $leaf-background-color;
    display: flex;
    flex-wrap: nowrap;
  }
  .leaf-data {
    background-color: $leaf-background-color;
  }
}
</style>
