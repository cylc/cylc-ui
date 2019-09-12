import { Enum } from 'enumify'

/**
 * Cylc valid task states.
 */
class TaskState extends Enum {}
// NOTE: the order of the enum values is important to calculate the group states in the UI. Items at
// the top of the list have preference over the items below in the algorithm.
TaskState.initEnum([
  'SUBMIT_FAILED',
  'FAILED',
  'EXPIRED',
  'SUBMIT_RETRYING',
  'RETRYING',
  'RUNNING',
  'SUBMITTED',
  'READY',
  'QUEUED',
  'WAITING',
  'HELD',
  'SUCCEEDED',
  'RUNAHEAD'
])

export default TaskState
