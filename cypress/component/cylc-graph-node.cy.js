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

import GraphNode from '@/components/cylc/GraphNode'
import { Tokens } from '@/utils/uid'

function makeTaskNode (id, jobStates) {
  const tokens = new Tokens(id)
  const jobs = []
  let itt = 1
  for (const jobState of jobStates) {
    const jobTokens = tokens.clone({ job: `0${itt}` })
    jobs.push({
      id: jobTokens.id,
      tokens: jobTokens,
      name: jobTokens.job,
      type: 'job',
      node: {
        id: jobTokens.id,
        status: jobState
      }
    })
    itt++
  }
  return {
    id: tokens.id,
    tokens,
    name: tokens.task,
    type: 'task',
    children: jobs,
    node: {
      id: tokens.id,
      state: jobs.length ? jobs[0].node.status : 'waiting'
    }
  }
}

const GraphNodeSVG = {
  template: `
    <svg id="app" class="job_theme--default" width="100%" height="100%">
      <GraphNode :task="task" />
    </svg>
  `,
  props: ['task'],
  components: { GraphNode }
}

describe('graph node component', () => {
  it('works', () => {
    cy.mount(
      GraphNodeSVG,
      {
        propsData: {
          task: makeTaskNode(
            '~a/b//20000101T0000Z/task_name',
            ['running', 'failed', 'failed', 'failed']
          )
        }
      }
    )
  })
})
