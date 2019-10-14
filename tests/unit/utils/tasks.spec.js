import { expect } from 'chai'
import TaskState from '@/model/TaskState.model'
import { extractGroupState } from '@/utils/tasks'

describe('tasks', () => {
  describe('extractGroupState', () => {
    it('should return the correct state for the node groups when not stopped', () => {
      [
        [
          TaskState.FAILED.name.toLowerCase(), // expected
          [TaskState.WAITING, TaskState.HELD, TaskState.FAILED].map((state) => state.name.toLowerCase())], // childStates
        [
          TaskState.WAITING.name.toLowerCase(),
          [TaskState.WAITING, TaskState.HELD].map((state) => state.name.toLowerCase())],
        [
          TaskState.RUNNING.name.toLowerCase(),
          [TaskState.SUBMITTED, TaskState.RUNNING].map((state) => state.name.toLowerCase())]
      ].forEach((val) => {
        const groupState = extractGroupState(val[1], false)
        expect(groupState).to.equal(val[0])
      })
    })
    it('should return the correct state for the node groups when stopped', () => {
      [
        [
          TaskState.RUNNING.name.toLowerCase(), // expected
          [TaskState.WAITING, TaskState.SUBMITTED, TaskState.RUNNING].map((state) => state.name.toLowerCase())], // childStates
        [
          TaskState.SUCCEEDED.name.toLowerCase(),
          [TaskState.QUEUED, TaskState.SUCCEEDED].map((state) => state.name.toLowerCase())],
        [
          TaskState.RUNNING.name.toLowerCase(),
          [TaskState.SUBMITTED, TaskState.RUNNING, TaskState.EXPIRED].map((state) => state.name.toLowerCase())]
      ].forEach((val) => {
        const groupState = extractGroupState(val[1], true)
        expect(groupState).to.equal(val[0])
      })
    })
    it('should return empty when no states provided', () => {
      expect(extractGroupState([])).to.equal('')
    })
  })
})
