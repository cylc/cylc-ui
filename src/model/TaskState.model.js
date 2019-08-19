import { Enum } from 'enumify'

/**
 * Cylc valid task states.
 */
class TaskState extends Enum {}
TaskState.initEnum([
  'RUNAHEAD',
  'WAITING',
  'HELD',
  'QUEUED',
  'READY',
  'EXPIRED',
  'SUBMITTED',
  'SUBMIT_FAILED',
  'SUBMIT_RETRYING',
  'RUNNING',
  'SUCCEEDED',
  'FAILED',
  'RETRYING'
])

export default TaskState
