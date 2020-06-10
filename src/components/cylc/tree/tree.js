import { computePercentProgress } from '@/components/cylc'
import { extractGroupState } from '@/utils/tasks'
import { merge } from 'lodash'
import { createFamilyProxyNode } from '@/components/cylc/tree/index'
import TaskState from '@/model/TaskState.model'

export const FAMILY_ROOT = 'root'

/***
 * Compute the task progress if possible.
 *
 * Only applicable when the task is in the "running" state, and when it has one or more jobs.
 *
 * The formula used to compute the progress is the same as in Cylc 7, using `meanElapsedTime` task property,
 * the latest job's `startedTime`, and the current time.
 *
 * When the progress is successfully computed, the given task proxy node will get an additional property
 * `progress` with type number (integer) between 0 and 100, representing the task progress.
 *
 * The property will be set in the taskProxy.node.progress property.
 *
 * @param taskProxy {{
 *   id: string,
 *   node: {
 *     state: string,
 *     progress: number,
 *     task: {
 *       meanElapsedTime: number
 *     }
 *   },
 *   children: [{
 *     id: string,
 *     node: {
 *       state: string,
 *       startedTime: string
 *     }
 *   }]
 * }} task proxy
 */
function computeTaskProgress (taskProxy) {
  // calculate task progress if necessary/possible
  if (taskProxy.node.state === TaskState.RUNNING.name.toLowerCase() && taskProxy.children.length > 0) {
    // the graphql query is expected to have jobs sorted by submit_num, e.g.:
    // `jobs(sort: { keys: ["submit_num"], reverse:true })`
    const latestJob = taskProxy.children[0]
    if (latestJob.node.startedTime) {
      const startedTime = Date.parse(latestJob.node.startedTime)
      taskProxy.node.progress = computePercentProgress(startedTime, taskProxy.node.task.meanElapsedTime)
    }
  }
}

/**
 * Compute the state of each cycle point node in the list given.
 *
 * The formula used to compute each cycle point state is the same as in Cylc 7, using an enum of task types.
 *
 * After the state is successfully computed, each cycle point node gets an additional property `state`
 * with type string, representing the cycle point state.
 *
 * @param cyclePointNodes {Array} list of cycle point nodes.
 */
function computeCyclePointsStates (cyclePointNodes) {
  for (const cyclePointNode of cyclePointNodes) {
    const childStates = []
    for (const child of cyclePointNode.children) {
      childStates.push(child.node.state)
    }
    cyclePointNode.node.state = extractGroupState(childStates, false)
  }
}

/**
 * A data structure representing the tree used by Cylc.
 *
 * Each node has a similar structure, represented as follows:
 *
 * <script language="javascript">
 * {
 *   id: "some string",
 *   node: {},
 *   children: []
 * }
 * </script>
 *
 * At its first level, there is a single root node, the Workflow node.
 * Workflows have cycle points as children.
 *
 * A cycle point, in its turn, has family proxies children.
 *
 * A family proxy can have either other family proxies as children, or
 * task proxies.
 *
 * Task proxies have jobs as children.
 *
 * And jobs, finally, have job details as children.
 *
 * <script language="javascript">
 * // This data structure keeps the reference to the root node:
 * const rootNode = cylcTreeInstance.root;
 * // and its children can be equally accessed with:
 * const workflowChildren = rootNode.children
 * const cyclePoint = workflowChildren[0]
 * // and so it goes
 * const familyProxy = cyclePoint.children[0]
 * </script>
 *
 * This data structure also keeps a lookup `Map` object. This map
 * contains the ID of each node as key, and the node itself as object
 * reference.
 *
 * It means that you can easily access any element in the tree, without
 * having to iterate and visit each of its parents.
 *
 * <script language="javascript">
 * const jobID = 'kinow|five|20150129T1200+12|foo|1'
 * const someJob = cycleTreeInstance.lookup.get(jobID)
 * </script>
 *
 * Finally, this data structure class contains methods to:
 *
 * - add a node of any type
 * - update a node of any type
 * - remove a node of any type
 *
 * When a node is added, it gets added to the hierarchical tree (i.e. it
 * will be added as child of some other node), and also added to the
 * lookup map.
 *
 * When a node is updated, the values of the given node argument in the
 * function replace the values in the existing element of the map. i.e.
 * we will find the object in the lookup map, and use Lodash's `merge`.
 *
 * And when a node is removed, it gets removed from its parent's `.children`
 * array, and the node and each of its children get removed from the
 * lookup map as well.
 */
class CylcTree {
  /**
   * Create a tree with an initial root node, representing
   * a workflow in Cylc.
   *
   * @param {null | {
   *   id: string,
   *   node: Object,
   *   children: []
   * }} [workflow]
   */
  constructor (workflow) {
    this.lookup = new Map()
    if (!workflow) {
      this.root = {
        id: '',
        node: {},
        children: []
      }
    } else {
      this.root = workflow
      this.lookup.set(this.root.id, this.root)
    }
  }

  setWorkflow (workflow) {
    if (!workflow) {
      throw new Error('You must provide a valid workflow!')
    }
    this.root = workflow
    this.lookup.set(workflow.id, workflow)
  }

  clear () {
    this.lookup.clear()
    this.root = {
      id: '',
      node: {},
      children: []
    }
  }

  isEmpty () {
    return this.lookup.size === 0
  }

  /**
   * @param {null|{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} node
   */
  recursivelyRemoveNode (node) {
    if (node) {
      const stack = [node]
      while (stack.length > 0) {
        const n = stack.pop()
        this.lookup.delete(n.id)
        if (n.children && n.children.length > 0) {
          stack.push(...n.children)
        }
      }
    }
  }

  // --- Cycle points

  /**
   * @param {null|{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} cyclePoint
   */
  addCyclePoint (cyclePoint) {
    if (cyclePoint && !this.lookup.has(cyclePoint.id)) {
      this.lookup.set(cyclePoint.id, cyclePoint)
      this.root.children.push(cyclePoint)
      // sort cycle points
      this.root.children.sort((cyclepoint, anotherCyclepoint) => {
        return cyclepoint.id.localeCompare(anotherCyclepoint.id)
      })
    }
  }

  /**
   * @param {null|{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} cyclePoint
   */
  updateCyclePoint (cyclePoint) {
    if (cyclePoint) {
      const node = this.lookup.get(cyclePoint.id)
      if (node) {
        merge(node, cyclePoint)
      }
    }
  }

  /**
   * @param {null|string} cyclePointId
   */
  removeCyclePoint (cyclePointId) {
    const node = this.lookup.get(cyclePointId)
    if (node) {
      this.recursivelyRemoveNode(node)
      this.root.children.splice(this.root.children.indexOf(node), 1)
    }
  }

  tallyCyclePointStates () {
    // calculate cycle point states
    computeCyclePointsStates(this.root.children)
  }

  // --- Family proxies

  /**
   * @param {null|{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} familyProxy
   */
  addFamilyProxy (familyProxy) {
    // When we receive the families from the GraphQL endpoint, we are sorting by their
    // firstParent's. However, you may get family proxies out of order when iterating
    // them. When that happens, you may add a family proxy to the lookup, and only
    // append it to the parent later.
    if (familyProxy) {
      // ignore the root family
      if (familyProxy.id.endsWith(`|${FAMILY_ROOT}`)) {
        return
      }
      // add if not in the lookup already
      const existingFamilyProxy = this.lookup.get(familyProxy.id)
      if (!existingFamilyProxy) {
        this.lookup.set(familyProxy.id, familyProxy)
      } else {
        // We may get a family proxy added twice. The first time is when it is the parent of another
        // family proxy. In that case, we create an orphan node in the lookup table.
        // The second time will be node with more information, such as .firstParent {}. When this happens,
        // we must remember to merge the objects, i.e. augment the existing orphan with the extra
        // information. That's because GraphQL firstParent brings less data.
        merge(familyProxy, existingFamilyProxy)
        this.lookup.set(familyProxy.id, familyProxy)
      }
      // if we got the parent, let's link parent and child
      if (familyProxy.node.firstParent) {
        let parent
        if (familyProxy.node.firstParent.name === FAMILY_ROOT) {
          // if the parent is root, we use the cyclepoint as the parent
          parent = this.lookup.get(familyProxy.node.cyclePoint)
        } else if (this.lookup.has(familyProxy.node.firstParent.id)) {
          // if its parent is another family proxy node and must already exist
          parent = this.lookup.get(familyProxy.node.firstParent.id)
        } else {
          // otherwise we create it so task proxies can be added to it as a child
          parent = createFamilyProxyNode(familyProxy.node.firstParent)
          this.lookup.set(parent.id, parent)
        }
        // since this method may be called several times for the same family proxy (see comments above), it means
        // the parent-child could end up repeated by accident; it means we must make sure to create this relationship
        // exactly once.
        if (parent.children.length === 0 || !parent.children.find(child => child.id === familyProxy.id)) {
          parent.children.push(familyProxy)
        }
      }
    }
  }

  /**
   * @param {null|{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} familyProxy
   */
  updateFamilyProxy (familyProxy) {
    if (familyProxy) {
      const node = this.lookup.get(familyProxy.id)
      if (node) {
        merge(node, familyProxy)
      }
    }
  }

  /**
   * @param {null|string} familyProxyId
   */
  removeFamilyProxy (familyProxyId) {
    let node
    let nodeId
    let parentId
    // NOTE: when deleting the root family, we can also remove the entire cycle point
    if (familyProxyId.endsWith('|root')) {
      // 0 has the owner, 1 has the workflow Id, 2 has the cycle point, and 3 the family name
      const [owner, workflowId, cyclePoint] = familyProxyId.split('|')
      nodeId = cyclePoint
      node = this.lookup.get(nodeId)
      parentId = `${owner}|${workflowId}`
    } else {
      nodeId = familyProxyId
      node = this.lookup.get(nodeId)
      if (node.node.firstParent.name === FAMILY_ROOT) {
        parentId = node.node.cyclePoint
      } else {
        parentId = node.node.firstParent.id
      }
    }
    this.recursivelyRemoveNode(node)
    const parent = this.lookup.get(parentId)
    // If the parent has already been removed from the lookup map, there won't be any parent here
    if (parent) {
      parent.children.splice(parent.children.indexOf(node), 1)
    }
  }

  // --- Task proxies

  /**
   * @param {null|{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} taskProxy
   */
  addTaskProxy (taskProxy) {
    if (taskProxy && !this.lookup.has(taskProxy.id)) {
      // progress starts at 0
      taskProxy.node.progress = 0
      this.lookup.set(taskProxy.id, taskProxy)
      let parent
      if (taskProxy.node.firstParent.name === FAMILY_ROOT) {
        // if the parent is root, we must instead attach this node to the cyclepoint!
        parent = this.lookup.get(taskProxy.node.cyclePoint)
      } else {
        // otherwise its parent is another family proxy node and **MUST** already exist
        parent = this.lookup.get(taskProxy.node.firstParent.id)
      }
      if (!parent) {
        // eslint-disable-next-line no-console
        console.error(`Missing parent ${taskProxy.node.firstParent.id}`)
      } else {
        parent.children.push(taskProxy)
      }
    }
  }

  /**
   * @param {null|{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} taskProxy
   */
  updateTaskProxy (taskProxy) {
    if (taskProxy) {
      const node = this.lookup.get(taskProxy.id)
      if (node) {
        computeTaskProgress(taskProxy)
        merge(node, taskProxy)
      }
    }
  }

  /**
   * @param {null|string} taskProxyId
   */
  removeTaskProxy (taskProxyId) {
    const taskProxy = this.lookup.get(taskProxyId)
    if (taskProxy) {
      this.recursivelyRemoveNode(taskProxy)
      // Remember that we attach task proxies children of 'root' directly to a cycle point!
      let parent
      if (taskProxy.node.firstParent.id.endsWith('|root')) {
        parent = this.lookup.get(taskProxy.node.cyclePoint)
      } else {
        parent = this.lookup.get(taskProxy.node.firstParent.id)
      }
      parent.children.splice(parent.children.indexOf(taskProxy), 1)
    }
  }

  // --- Jobs

  /**
   * @param {null|{
   *   id: string,
   *   node: Object,
   *   latestMessage: string
   * }} job
   */
  addJob (job) {
    if (job && !this.lookup.has(job.id)) {
      this.lookup.set(job.id, job)
      const parent = this.lookup.get(job.node.firstParent.id)
      parent.children.push(job)
      // re-calculate the job's task progress
      computeTaskProgress(parent)
    }
  }

  /**
   * @param {null|{
   *   id: string,
   *   type: string,
   *   node: Object,
   *   latestMessage: string
   * }} job
   */
  updateJob (job) {
    if (job) {
      const node = this.lookup.get(job.id)
      if (node) {
        merge(node, job)
        // re-calculate the job's task progress
        const parent = this.lookup.get(job.node.firstParent.id)
        computeTaskProgress(parent)
      }
    }
  }

  /**
   * @param {null|string} jobId
   */
  removeJob (jobId) {
    const job = this.lookup.get(jobId)
    if (job) {
      this.recursivelyRemoveNode(job)
      // re-calculate the job's task progress
      const parent = this.lookup.get(job.node.firstParent.id)
      computeTaskProgress(parent)
      parent.children.splice(parent.children.indexOf(job), 1)
    }
  }
}

export default CylcTree
