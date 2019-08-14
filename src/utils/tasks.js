import TaskState from '@/model/TaskState.model'

/**
 * States used when comparing the parent with children nodes.
 * @type {*[]}
 */
const orderedStates = [
  TaskState.SUBMIT_FAILED,
  TaskState.FAILED,
  TaskState.EXPIRED,
  TaskState.SUBMIT_RETRYING,
  TaskState.RETRYING,
  TaskState.RUNNING,
  TaskState.SUBMITTED,
  TaskState.READY,
  TaskState.QUEUED,
  TaskState.WAITING,
  TaskState.HELD,
  TaskState.SUCCEEDED,
  TaskState.RUNAHEAD
]

/**
 * States used when the parent is stopped.
 * @type {*[]}
 */
const isStoppedOrderedStates = [
  TaskState.SUBMIT_FAILED,
  TaskState.FAILED,
  TaskState.RUNNING,
  TaskState.SUBMITTED,
  TaskState.EXPIRED,
  TaskState.READY,
  TaskState.SUBMIT_RETRYING,
  TaskState.RETRYING,
  TaskState.SUCCEEDED,
  TaskState.QUEUED,
  TaskState.WAITING,
  TaskState.HELD,
  TaskState.RUNAHEAD
]

/**
 * Gives a single state, based on a list of states of children nodes.
 * @param childStates {Array} children nodes
 * @param isStopped {Boolean} whether the parent node is stopped or not
 * @returns {null|*} a valid Task State, or null if not found
 * @link @see https://github.com/cylc/cylc-flow/blob/d66ae5c3ce8c749c8178d1cd53cb8c81d1560346/lib/cylc/task_state_prop.py
 */
function extractGroupState (childStates, isStopped = false) {
  const states = isStopped ? isStoppedOrderedStates : orderedStates
  for (const state of states) {
    if (childStates.includes(state.name.toLowerCase())) {
      return state.name.toLowerCase()
    }
  }
  return ''
}

export {
  extractGroupState
}
