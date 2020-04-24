import { Enumify } from 'enumify'

/**
 * Cylc valid task states.
 */
class TaskState extends Enumify {
  // NOTE: the order of the enum values is important to calculate the group states in the UI. Items at
  // the top of the list have preference over the items below in the algorithm.
  static SUBMIT_FAILED = new TaskState('SUBMIT_FAILED')
  static FAILED = new TaskState('FAILED')
  static EXPIRED = new TaskState('EXPIRED')
  static SUBMIT_RETRYING = new TaskState('SUBMIT_RETRYING')
  static RETRYING = new TaskState('RETRYING')
  static RUNNING = new TaskState('RUNNING')
  static SUBMITTED = new TaskState('SUBMITTED')
  static READY = new TaskState('READY')
  static QUEUED = new TaskState('QUEUED')
  static WAITING = new TaskState('WAITING')
  static HELD = new TaskState('HELD')
  static SUCCEEDED = new TaskState('SUCCEEDED')
  static RUNAHEAD = new TaskState('RUNAHEAD')
  static _ = this.closeEnum()

  /**
   * Constructor.
   * @param {String} text
   */
  constructor (name) {
    super()
    this.name = name
  }
}

export default TaskState
