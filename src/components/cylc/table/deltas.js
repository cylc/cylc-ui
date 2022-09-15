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

import { mergeWith } from 'lodash'
import Vue from 'vue'
import { mergeWithCustomizer } from '@/components/cylc/common/merge'

function init (deltas, table) {
  const result = {
    errors: []
  }
  for (const taskProxy of deltas.taskProxies) {
    try {
      Vue.set(table, taskProxy.id, {
        id: taskProxy.id,
        node: deltas.globalLookup[taskProxy.id].node,
        latestJob: {},
        jobs: []
      })
    } catch (error) {
      result.errors.push([
        'Error applying initial-delta for table task proxy the first time, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
        error,
        taskProxy,
        deltas.globalLookup,
        table
      ])
    }
  }
  for (const job of deltas.jobs) {
    try {
      const jobHandle = deltas.globalLookup[job.id].node
      const existingEntry = table[jobHandle.firstParent.id]
      if (existingEntry) {
        const latestJobSubmitNum = existingEntry.latestJob.submitNum || 0
        const latestJob = latestJobSubmitNum < jobHandle.submitNum
          ? deltas.globalLookup[jobHandle.id].node
          : existingEntry.latestJob
        Vue.set(existingEntry, 'latestJob', latestJob)
        // ether way we want a reference to this job for the table view so add it to the list
        existingEntry.jobs.push(deltas.globalLookup[jobHandle.id].node)
        Vue.set(existingEntry, 'jobs', existingEntry.jobs)
      }
    } catch (error) {
      result.errors.push([
        'Error applying initial-delta for table job, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
        error,
        job,
        deltas.globalLookup,
        table
      ])
    }
  }
  return result
}

function before (deltas, table, lookup) {
  const result = {
    errors: []
  }
  // first we check whether it is a new initial-data-burst
  if (deltas && deltas.added && deltas.added.workflow) {
    Object.keys(table).forEach(key => {
      Vue.delete(table, key)
    })
  }
  // Safe check in case the table is empty.
  if (Object.keys(table).length === 0) {
    if (!deltas.added || !deltas.added.workflow) {
      result.errors.push(
        [
          'Received a Table delta before the workflow initial data burst',
          deltas.added,
          table,
          lookup
        ]
      )
    }
  }
  return result
}

/**
 * Deltas added.
 *
 * @param {DeltasAdded} added
 * @param {Table} table
 * @param {Lookup} lookup
 * @returns {Result}
 */
function applyDeltasAdded (added, table, lookup) {
  const result = {
    errors: []
  }
  if (added.taskProxies) {
    for (const taskProxy of added.taskProxies) {
      try {
        Vue.set(table, taskProxy.id, {
          id: taskProxy.id,
          node: lookup[taskProxy.id],
          latestJob: {},
          jobs: []
        })
      } catch (error) {
        result.errors.push([
          'Error applying added-delta for table task proxy, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
          error,
          taskProxy,
          added,
          table,
          lookup
        ])
      }
    }
  }
  if (added.jobs) {
    for (const job of added.jobs) {
      try {
        const existingEntry = table[job.firstParent.id]
        if (existingEntry) {
          const latestJobSubmitNum = existingEntry.latestJob.submitNum || 0
          if (job.submitNum > latestJobSubmitNum) {
            existingEntry.latestJob = lookup[job.id]
            // Add latest to front of jobs array
            existingEntry.jobs.unshift(job)
          } else {
            // Ought to sort jobs array newest to oldest
            existingEntry.jobs.push(job)
            existingEntry.jobs.sort((a, b) => b.submitNum - a.submitNum)
          }
        }
      } catch (error) {
        result.errors.push([
          'Error applying added-delta for table job, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
          error,
          job,
          added,
          table,
          lookup
        ])
      }
    }
  }
  return result
}

/**
 * Deltas updated.
 *
 * @param {DeltasUpdated} updated
 * @param {Table} table
 * @param {Lookup} lookup - Not really used since we can fetch the data from the table, and we are not altering the lookup data
 * @returns {Result}
 */
function applyDeltasUpdated (updated, table, lookup) {
  const result = {
    errors: []
  }
  if (updated.taskProxies) {
    for (const taskProxy of updated.taskProxies) {
      try {
        if (table[taskProxy.id]) {
          mergeWith(table[taskProxy.id].node, taskProxy, mergeWithCustomizer)
        }
      } catch (error) {
        result.errors.push([
          'Error applying updated-delta for table task proxy, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
          error,
          taskProxy,
          updated,
          table,
          lookup
        ])
      }
    }
  }
  if (updated.jobs) {
    for (const job of updated.jobs) {
      try {
        if (job.firstParent && job.firstParent.id) {
          const existingTask = table[job.firstParent.id]
          if (existingTask && existingTask.latestJob.id === job.id) {
            mergeWith(existingTask.latestJob, job, mergeWithCustomizer)
          }
          if (existingTask.jobs.indexOf(job) > -1) {
            mergeWith(existingTask.jobs[existingTask.jobs.indexOf(job)], job, mergeWithCustomizer)
          }
        }
      } catch (error) {
        result.errors.push([
          'Error applying updated-delta for table job, see browser console logs for more. Please reload your browser tab to retrieve the full flow state',
          error,
          job,
          updated,
          table,
          lookup
        ])
      }
    }
  }
  return result
}

/**
 * Deltas pruned.
 *
 * @param {DeltasPruned} pruned
 * @param {Table} table
 * @param {Lookup} lookup
 * @returns {Result}
 */
function applyDeltasPruned (pruned, table, lookup) {
  const result = {
    errors: []
  }
  if (pruned.taskProxies) {
    pruned.taskProxies.forEach(taskProxyId => {
      Vue.delete(table, taskProxyId)
    })
  }
  if (pruned.jobs) {
    pruned.jobs.forEach(jobId => {
      // TODO: should we use an internal lookup for table too? To replace this loop by a quick O(1) operation
      //       to fetch the existing job with its ID, and then its existing parent task?
      const parentTask = Object.values(table).find(entry => entry.latestJob && entry.latestJob.id === jobId)
      if (parentTask) {
        if (parentTask.latestJob) {
          Vue.set(parentTask, 'latestJob', {})
        }
        const parentsJobsReferenceIndex = parentTask.jobs.findIndex(job => job.id === jobId)
        if (parentsJobsReferenceIndex) {
          Vue.set(parentTask, 'jobs', parentTask.jobs.splice(parentsJobsReferenceIndex, 1))
        }
      }
    })
  }
  return result
}

export {
  init,
  before,
  applyDeltasAdded,
  applyDeltasUpdated,
  applyDeltasPruned
}
