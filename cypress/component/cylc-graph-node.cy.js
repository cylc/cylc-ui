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

import { TaskStateUserOrder, JobStates } from '@/model/TaskState.model'
import GraphNode from '@/components/cylc/GraphNode'
import { Tokens } from '@/utils/uid'
import {
  MEAN_ELAPSED_TIME,
  getStartTime
} from './utils/task'

function makeTaskNode (id, state, jobStates) {
  const tokens = new Tokens(id)
  const jobs = []
  let itt = 1
  let job
  for (const jobState of jobStates) {
    const jobTokens = tokens.clone({ job: `0${itt}` })
    job = {
      id: jobTokens.id,
      name: jobTokens.job,
      node: {
        state: jobState
      }
    }
    if (jobState === 'running') { // TODO constant
      job.node.startedTime = getStartTime(50)
    }
    jobs.push(job)
    itt++
  }

  const task = {
    id: tokens.id,
    name: tokens.task,
    tokens,
    node: {
      cyclePoint: tokens.cycle,
      isHeld: false,
      state,
      task: {
        meanElapsedTime: MEAN_ELAPSED_TIME
      }
    }
  }

  return [task, jobs]
}

const GraphNodeSVG = {
  template: `
    <svg id="app" class="job_theme--default" width="100%" height="100%">
      <GraphNode :task="task" :jobs="jobs" :maxJobs="maxJobs" />
    </svg>
  `,
  props: {
    task: {
      required: true
    },
    jobs: {
      required: true
    },
    maxJobs: {
      default: 6,
      required: false
    }
  },
  components: { GraphNode }
}

describe('graph node component', () => {
  it('Renders multiple jobs', () => {
    const [task, jobs] = makeTaskNode(
      '~a/b//20000101T0000Z/task_name',
      'failed',
      ['running', 'failed', 'failed', 'failed']
    )
    cy.mount(
      GraphNodeSVG,
      {
        propsData: { task, jobs }
      }
    )
    // there should be 4 jobs
    cy.get('.c-graph-node:last .jobs')
      .children()
      .should('have.length', 4)
    // there shouldn't be a job overflow indicator
    cy.get('.c-graph-node:last .job-overflow').should('not.exist')

    cy.get('.c-graph-node').last().parent().screenshot(
      `graph-node-multiple-jobs`,
      { overwrite: true, disableTimersAndAnimations: false }
    )
  })

  it('Hides excessive numbers of jobs', () => {
    const [task, jobs] = makeTaskNode(
      '~a/b//20000101T0000Z/task_name',
      'failed',
      ['running', 'failed', 'failed', 'failed', 'failed', 'failed']
    )
    cy.mount(
      GraphNodeSVG,
      {
        propsData: { task, jobs, maxJobs: 4 }
      }
    )
    // there should be <maxJobs> jobs
    cy.get('.c-graph-node:last .jobs')
      .children()
      .should('have.length', 4)
    // there should be a job overflow indicator with the number of overflow jobs
    cy.get('.c-graph-node:last .job-overflow')
      .should('exist')
      .get('text')
      .contains('+2')

    cy.get('.c-graph-node').last().parent().screenshot(
      `graph-node-overflow-jobs`,
      { overwrite: true, disableTimersAndAnimations: false }
    )
  })

  it('Renders for each task state', () => {
    let task
    let jobs
    let jobStates
    for (const state of TaskStateUserOrder) {
      jobStates = []
      for (const jobState of JobStates) {
        if (state.name === jobState.name) {
          jobStates = [state.name]
          break
        }
      }
      [task, jobs] = makeTaskNode(
        `~a/b//20000101T0000Z/${state.name}`,
        state.name,
        jobStates
      )
      console.log(jobs)
      cy.mount(GraphNodeSVG, { propsData: { task, jobs } })
      cy.get('.c-graph-node').last().parent().screenshot(
        `graph-node-${state.name}`,
        { overwrite: true, disableTimersAndAnimations: false }
      )
    }
  })

  it('Renders for each task modifier', () => {
    let task
    let jobs
    for (const modifier of ['isHeld', 'isQueued', 'isRunahead']) {
      [task, jobs] = makeTaskNode(
        `~a/b//20000101T0000Z/${modifier}`,
        'waiting',
        []
      )
      task.node[modifier] = true
      cy.mount(GraphNodeSVG, { propsData: { task, jobs } })
      cy.get('.c-graph-node').last().parent().screenshot(
        `graph-node-${modifier}`,
        { overwrite: true, disableTimersAndAnimations: false }
      )
    }
  })

  it('Animates task progress', () => {
    let task
    let jobs
    for (const percent of [0, 25, 50, 75, 100]) {
      [task, jobs] = makeTaskNode(
        `~a/b//${percent}/running`,
        'running',
        ['running']
      )
      jobs[0].node.startedTime = getStartTime(percent)
      cy.mount(GraphNodeSVG, { propsData: { task, jobs } })
      cy.get('.c-graph-node').last().parent().screenshot(
        `graph-node-running-${percent}`,
        { overwrite: true, disableTimersAndAnimations: false }
      )
      // check the progress animation
      .get('.c8-task:last .status > .progress')
        // the animation duration should be equal to the expected job duration
        .should('have.css', 'animation-duration', `${MEAN_ELAPSED_TIME}s`)
        // the offset should be set to the "percent" of the expected job duration
        .should('have.css', 'animation-delay')
        .and('match', /([\d\.]+)s/) // NOTE the delay should be negative
        .then((number) => {
          // convert the duration string into a number that we can test
          cy.wrap(Number(number.match(/([\d\.]+)s/)[1]))
            // ensure this number is ±5 from the expected value
            // (give it a little bit of margin to allow for timing error)
            .should('closeTo', MEAN_ELAPSED_TIME * (percent / 100), 5)
        })
    }
  })
})
