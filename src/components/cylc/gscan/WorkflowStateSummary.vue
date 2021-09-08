<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <!-- task summary tooltips -->
  <span>
    <span
      v-for="[state, tasks] in getLatestStateTasks(Object.entries(node.node.latestStateTasks))"
      :key="`${node.id}-summary-${state}`"
      :class="getTaskStateClasses(node.node.stateTotals, state)"
    >
      <v-tooltip color="black" top>
        <template v-slot:activator="{ on }">
          <!-- a v-tooltip does not work directly set on Cylc job component, so we use a dummy button to wrap it -->
          <!-- NB: most of the classes/directives in these button are applied so that the user does not notice it is a button -->
          <v-btn
            v-on="on"
            class="ma-0 pa-0"
            min-width="0"
            min-height="0"
            style="font-size: 120%; width: auto"
            :ripple="false"
            dark
            icon
          >
            <job :status="state" />
          </v-btn>
        </template>
        <!-- tooltip text -->
        <span>
          <span class="grey--text">{{ countTasksInState(node.node, state) }} {{ state }}. Recent {{ state }} tasks:</span>
          <br/>
          <span v-for="(task, index) in tasks.slice(0, maximumTasksDisplayed)" :key="index">
            {{ task }}<br v-if="index !== tasks.length -1" />
          </span>
        </span>
      </v-tooltip>
    </span>
  </span>
</template>

<script>
import Job from '@/components/cylc/Job'
import TaskState from '@/model/TaskState.model'
export default {
  name: 'WorkflowStateSummary',
  props: {
    node: {
      type: Object,
      required: true
    },
    maximumTasksDisplayed: {
      type: Number,
      default: 5
    }
  },
  components: {
    Job
  },
  methods: {
    /**
     * Get number of tasks we have in a given state. The states are retrieved
     * from `latestStateTasks`, and the number of tasks in each state is from
     * the `stateTotals`. (`latestStateTasks` includes old tasks).
     *
     * @param {Object} stateTotals - the workflow object retrieved from GraphQL
     * @param {string} state - a workflow state
     * @returns {number|*} - the number of tasks in the given state
     */
    countTasksInState (stateTotals, state) {
      if (Object.hasOwnProperty.call(stateTotals, state)) {
        return stateTotals[state]
      }
      return 0
    },
    getTaskStateClasses (stateTotals, state) {
      const tasksInState = this.countTasksInState(stateTotals, state)
      return tasksInState === 0 ? ['empty-state'] : []
    },
    // TODO: temporary filter, remove after b0 - https://github.com/cylc/cylc-ui/pull/617#issuecomment-805343847
    getLatestStateTasks (latestStateTasks) {
      // Values found in: https://github.com/cylc/cylc-flow/blob/9c542f9f3082d3c3d9839cf4330c41cfb2738ba1/cylc/flow/data_store_mgr.py#L143-L149
      const validValues = [
        TaskState.SUBMITTED.name,
        TaskState.SUBMIT_FAILED.name,
        TaskState.RUNNING.name,
        TaskState.SUCCEEDED.name,
        TaskState.FAILED.name
      ]
      return latestStateTasks.filter(entry => {
        return validValues.includes(entry[0])
      })
    }
  }
}
</script>
