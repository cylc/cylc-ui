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

import {
  createCyclePointNode,
  createFamilyProxyNode,
  createJobNode,
  createTaskProxyNode, populateTreeFromGraphQLData
} from '@/components/cylc/tree/index'
// eslint-disable-next-line no-unused-vars
import CylcTree from './tree'

/**
 * Deltas pruned.
 *
 * @param {{
 *   taskProxies: [string],
 *   familyProxies: [string],
 *   jobs: [string]
 * }} pruned
 * @param {CylcTree} tree
 */
function applyDeltasPruned (pruned, tree) {
  // jobs
  if (pruned.jobs) {
    for (const jobId of pruned.jobs) {
      tree.removeJob(jobId)
    }
  }
  // task proxies
  if (pruned.taskProxies) {
    for (const taskProxyId of pruned.taskProxies) {
      tree.removeTaskProxy(taskProxyId)
    }
  }
  // family proxies
  if (pruned.familyProxies) {
    for (const familyProxyId of pruned.familyProxies) {
      tree.removeFamilyProxy(familyProxyId)
    }
  }
}

/**
 * Deltas added.
 *
 * @param {{
 *   workflow: Object,
 *   cyclePoints: [Object],
 *   familyProxies: [Object],
 *   taskProxies: [Object],
 *   jobs: [Object]
 * }} added
 * @param {CylcTree} tree
 */
function applyDeltasAdded (added, tree) {
  if (added.cyclePoints) {
    added.cyclePoints.forEach(cyclePoint => {
      const cyclePointNode = createCyclePointNode(cyclePoint)
      tree.addCyclePoint(cyclePointNode)
    })
  }
  if (added.familyProxies) {
    added.familyProxies.forEach(familyProxy => {
      const familyProxyNode = createFamilyProxyNode(familyProxy)
      tree.addFamilyProxy(familyProxyNode)
    })
  }
  if (added.taskProxies) {
    added.taskProxies.forEach(taskProxy => {
      const taskProxyNode = createTaskProxyNode(taskProxy)
      tree.addTaskProxy(taskProxyNode)
    })
  }
  if (added.jobs) {
    added.jobs.forEach(job => {
      const jobNode = createJobNode(job, '')
      tree.addJob(jobNode)
    })
  }
}

/**
 * Deltas updated.
 *
 * @param updated {{
 *   familyProxies: [Object],
 *   taskProxies: [Object],
 *   jobs: [Object]
 * }} updated
 * @param {CylcTree} tree
 */
function applyDeltasUpdated (updated, tree) {
  if (updated.familyProxies) {
    updated.familyProxies.forEach(familyProxy => {
      const familyProxyNode = createFamilyProxyNode(familyProxy)
      tree.updateFamilyProxy(familyProxyNode)
    })
  }
  if (updated.taskProxies) {
    updated.taskProxies.forEach(taskProxy => {
      const taskProxyNode = createTaskProxyNode(taskProxy)
      tree.updateTaskProxy(taskProxyNode)
    })
  }
  if (updated.jobs) {
    updated.jobs.forEach(job => {
      const jobNode = createJobNode(job, '')
      tree.updateJob(jobNode)
    })
  }
}

/**
 * @param {{
 *   id: string,
 *   shutdown: boolean,
 *   added: {
 *     workflow: Object,
 *     cyclePoints: Object,
 *     familyProxies: Object,
 *     taskProxies: Object,
 *     jobs: Object
 *   },
 *   updated: {
 *     workflow: Object,
 *     cyclePoints: Object,
 *     familyProxies: Object,
 *     taskProxies: Object,
 *     jobs: Object
 *   },
 *   pruned: {
 *     taskProxies: [string],
 *     familyProxies: [string],
 *     jobs: [string]
 *   }
 * }} deltas
 * @param {CylcTree} tree
 */
export function applyDeltas (deltas, tree) {
  if (deltas) {
    // first we check whether it is a shutdown response
    if (deltas.shutdown) {
      tree.clear()
      return
    }
    if (tree.isEmpty()) {
      // When the tree is null, we have two possible scenarios:
      //   1. This means that we will receive our initial data burst in deltas.added.workflow
      //      which we can use to create the tree structure.
      //   2. Or this means that after the shutdown (when we delete the tree), we received a delta.
      //      In this case we don't really have any way to fix the tree.
      // In both cases, actually, the user has little that s/he could do, besides refreshing the
      // page. So we fail silently and wait for a request with the initial data.
      if (!deltas.added.workflow) {
        // eslint-disable-next-line no-console
        console.error('Received a delta before the workflow initial data burst')
        return
      }
      const workflow = deltas.added.workflow
      // A workflow (e.g. five) may not have any families as 'root' is filtered
      workflow.familyProxies = workflow.familyProxies || []
      populateTreeFromGraphQLData(tree, workflow)
      tree.tallyCyclePointStates()
    } else {
      // the tree was created, and now the next messages should contain
      // 1. new data added under deltas.added (but not in deltas.added.workflow)
      // 2. data updated in deltas.updated
      // 3. data pruned in deltas.pruned
      if (deltas.pruned) {
        applyDeltasPruned(deltas.pruned, tree)
      }
      if (deltas.added) {
        applyDeltasAdded(deltas.added, tree)
      }
      if (deltas.updated) {
        applyDeltasUpdated(deltas.updated, tree)
      }
      // if added, removed, or updated deltas, we want to re-calculate the cycle point states now
      if (deltas.pruned || deltas.added || deltas.updated) {
        tree.tallyCyclePointStates()
      }
    }
  } else {
    throw Error('Workflow tree subscription did not return data.deltas')
  }
}
