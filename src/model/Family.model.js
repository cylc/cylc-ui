import Task from '@/model/Task.model'

export default class Family {
  constructor (name, cyclePoint, state, depth, childTasks) {
    this.name = name
    this.cyclePoint = cyclePoint
    this.state = state
    this.depth = depth
    this.childTasks = childTasks !== undefined ? childTasks.map((childTask) => {
      return new Task(childTask.id, childTask.state, childTask.latestMessage, childTask.depth, childTask.jobs)
    }) : []
  }
}
