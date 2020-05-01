import { computePercentProgress } from '@/components/cylc'
import { extractGroupState } from '@/utils/tasks'

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
 * @param taskProxyNode {Object} task proxy node
 */
function computeTaskProgress (taskProxyNode) {
  // calculate task progress if necessary/possible
  if (taskProxyNode.state === 'running' && taskProxyNode.jobs.length > 0) {
    // the graphql query is expected to have jobs sorted by submit_num, e.g.:
    // `jobs(sort: { keys: ["submit_num"], reverse:true })`
    const latestJob = taskProxyNode.jobs[0]
    if (latestJob.startedTime) {
      const startedTime = Date.parse(latestJob.startedTime)
      taskProxyNode.progress = computePercentProgress(startedTime, taskProxyNode.task.meanElapsedTime)
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
 * we will find the object in the lookup map, and use `Object.assign`.
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
   * @param {{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} workflow
   */
  constructor (workflow) {
    if (!workflow) {
      throw new Error('Invalid tree root workflow!')
    }
    this.root = workflow
    this.lookup = new Map([
      [this.root.id, this.root]
    ])
  }

  /**
   * @param {{
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
   * @param {{
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
      // calculate cycle point states
      computeCyclePointsStates(this.root.children)
    }
  }

  /**
   * @param {{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} cyclePoint
   */
  updateCyclePoint (cyclePoint) {
    if (cyclePoint) {
      const node = this.lookup.get(cyclePoint.id)
      if (node) {
        Object.assign(node, cyclePoint)
        // calculate cycle point states
        computeCyclePointsStates(this.root.children)
      }
    }
  }

  /**
   * @param {{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} cyclePoint
   */
  removeCyclePoint (cyclePoint) {
    if (cyclePoint) {
      const node = this.lookup.get(cyclePoint.id)
      if (node) {
        this.recursivelyRemoveNode(node)
        // sort cycle points
        this.root.children.sort((cyclepoint, anotherCyclepoint) => {
          return cyclepoint.id.localeCompare(anotherCyclepoint.id)
        })
        // calculate cycle point states
        computeCyclePointsStates(this.root.children)
      }
    }
  }

  // --- Family proxies

  /**
   * @param {{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} familyProxy
   */
  addFamilyProxy (familyProxy) {
    if (familyProxy && !this.lookup.has(familyProxy.id)) {
      this.lookup.set(familyProxy.id, familyProxy)
      let parent
      if (familyProxy.node.firstParent.name === FAMILY_ROOT) {
        // if the parent is root, we use the cyclepoint as the parent
        parent = this.lookup.get(familyProxy.node.cyclePoint)
      } else {
        // otherwise its parent is another family proxy node and must already exist
        parent = this.lookup.get(familyProxy.node.firstParent.id)
      }
      parent.children.push(familyProxy)
    }
  }

  /**
   * @param {{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} familyProxy
   */
  updateFamilyProxy (familyProxy) {
    if (familyProxy) {
      const node = this.lookup.get(familyProxy.id)
      if (node) {
        Object.assign(node, familyProxy)
      }
    }
  }

  /**
   * @param {{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} familyProxy
   */
  removeFamilyProxy (familyProxy) {
    if (familyProxy) {
      const node = this.lookup.get(familyProxy.id)
      if (node) {
        this.recursivelyRemoveNode(node)
      }
    }
  }

  // --- Task proxies

  /**
   * @param {{
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
        parent = this.lookup.get(taskProxy.node.firstParent.cyclePoint)
      } else {
        // otherwise its parent is another family proxy node and must already exist
        parent = this.lookup.get(taskProxy.node.firstParent.id)
      }
      parent.children.push(taskProxy)
    }
  }

  /**
   * @param {{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} taskProxy
   */
  updateTaskProxy (taskProxy) {
    if (taskProxy) {
      const node = this.lookup.get(taskProxy.id)
      if (node) {
        computeTaskProgress(taskProxy.node)
        Object.assign(node, taskProxy)
      }
    }
  }

  /**
   * @param {{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} taskProxy
   */
  removeTaskProxy (taskProxy) {
    if (taskProxy) {
      const node = this.lookup.get(taskProxy.id)
      if (node) {
        this.recursivelyRemoveNode(node)
      }
    }
  }

  // --- Jobs

  /**
   * @param {{
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
      computeTaskProgress(parent.node)
    }
  }

  /**
   * @param {{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} job
   */
  updateJob (job) {
    if (job) {
      const node = this.lookup.get(job.id)
      if (node) {
        Object.assign(node, job)
        // re-calculate the job's task progress
        const parent = this.lookup.get(job.node.firstParent.id)
        computeTaskProgress(parent.node)
      }
    }
  }

  /**
   * @param {{
   *   id: string,
   *   node: Object,
   *   children: []
   * }} job
   */
  removeJob (job) {
    if (job) {
      const node = this.lookup.get(job.id)
      if (node) {
        this.recursivelyRemoveNode(node)
        // re-calculate the job's task progress
        const parent = this.lookup.get(job.node.firstParent.id)
        computeTaskProgress(parent.node)
      }
    }
  }
}

export default CylcTree
