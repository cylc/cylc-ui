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

const MUTATIONS = [
  {
    name: 'workflowMutation',
    _title: 'Workflow Mutation',
    description: `
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
      enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
      aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
      in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
      officia deserunt mollit anim id est laborum.
    `,
    args: [
      {
        name: 'workflow',
        type: {
          name: 'WorkflowID',
          kind: null,
        },
      },
    ],
  },
  {
    name: 'unauthorisedMutation',
    _title: 'Unauthorised Mutation',
    description: `
      A mutation user will not be authorised for.
    `,
    args: [
      {
        name: 'workflow',
        type: {
          name: 'WorkflowID',
          kind: null,
        },
      },
    ],
  },
  {
    name: 'cycleMutation',
    _title: 'Cycle Mutation',
    description: 'cycle',
    args: [
      {
        name: 'workflow',
        type: {
          name: 'WorkflowID',
          kind: null,
        },
      },
      {
        name: 'cycle',
        type: {
          name: 'CyclePoint',
          kind: null,
        },
      },
    ],
  },
  {
    name: 'namespaceMutation',
    _title: 'Namespace Mutation',
    description: 'namespace',
    args: [
      {
        name: 'workflow',
        type: {
          name: 'WorkflowID',
          kind: null,
        },
      },
      {
        name: 'namespace',
        type: {
          name: 'NamespaceName',
          kind: null,
        },
      },
    ],
  },
  {
    name: 'jobMutation',
    _title: 'Job Mutation',
    description: 'job',
    args: [
      {
        name: 'workflow',
        type: {
          name: 'WorkflowID',
          kind: null,
        },
      },
      {
        name: 'job',
        type: {
          name: 'JobID',
          kind: null,
        },
      },
    ],
  },
]

export { MUTATIONS }
