export default class Family {
  constructor (name, cyclePoint, state, depth, childTasks, childFamilies) {
    this.name = name
    this.cyclePoint = cyclePoint
    this.state = state
    this.depth = depth
    this.childTasks = childTasks !== undefined ? childTasks : []
    this.childFamilies = childFamilies !== undefined ? childFamilies : []
  }
}
