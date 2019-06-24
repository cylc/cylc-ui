import { expect } from 'chai'
import Task from '@/model/Task.model.js'

describe('TaskModel', () => {
  describe('constructor', () => {
    it('should be created', () => {
      const id = '2019010100000.1'
      const state = 'running'
      const latestMessage = 'success'
      const depth = 1
      const jobs = [2, 3, 1]
      const task = new Task(id, state, latestMessage, depth, jobs)
      expect(task.id).to.equal('2019010100000.1')
      expect(task.state).to.equal('running')
      expect(task.latestMessage).to.equal('success')
      expect(task.depth).to.equal(1)
      expect(task.jobs).to.eql([2, 3, 1])
    })
  })
})
