/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { expect } from 'chai'
import TaskState from '@/model/TaskState.model'
import { extractGroupState } from '@/utils/tasks'

describe('tasks', () => {
  describe('extractGroupState', () => {
    it('should return the correct state for the node groups when not stopped', () => {
      [
        [
          TaskState.FAILED.name.toLowerCase(), // expected
          [TaskState.WAITING, TaskState.FAILED].map((state) => state.name.toLowerCase())], // childStates
        [
          TaskState.WAITING.name.toLowerCase(),
          [TaskState.WAITING].map((state) => state.name.toLowerCase())],
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
