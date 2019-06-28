export default class Task {
  constructor (id, state, latestMessage, depth, jobs) {
    this.id = id
    this.state = state
    this.latestMessage = latestMessage
    this.depth = depth
    this.jobs = jobs
  }
}
