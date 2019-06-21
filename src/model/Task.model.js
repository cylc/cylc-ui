export default class Task {
  constructor (id, state, latestMessage, depth, jobs) {
    this.id = id
    this.state = state
    this.latestMessage = latestMessage
    this.depth = depth
    this.jobs = jobs
  }

  get jobId () {
    if (this.jobs !== undefined && this.jobs.length > 0) {
      return this.jobs.slice(-1)[0].batchSysJobId
    }
    return null
  }
}
