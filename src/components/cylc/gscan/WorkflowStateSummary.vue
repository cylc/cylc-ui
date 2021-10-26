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
      v-for="[state, tasks] in validLatestStateTasks"
      :key="`${nodeId}-summary-${state}`"
      :class="getTaskStateClasses(state)"
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
          <span class="grey--text">{{ countTasksInState(state) }} {{ state }}. Recent {{ state }} tasks:</span>
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

/**
 * Valid states for a latestStateTasks. See computed variable validLatestStateTasks.
 */
const VALID_STATES = Object.freeze([
  TaskState.SUBMITTED.name,
  TaskState.SUBMIT_FAILED.name,
  TaskState.RUNNING.name,
  TaskState.SUCCEEDED.name,
  TaskState.FAILED.name
])

export default {
  name: 'WorkflowStateSummary',
  props: {
    nodeId: {
      type: String,
      required: true
    },
    /**
     * @type {Object}
     */
    latestStateTasks: {
      type: Object,
      required: true
    },
    stateTotals: {
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
  computed: {
    // TODO: temporary filter, remove after b0 - https://github.com/cylc/cylc-ui/pull/617#issuecomment-805343847
    /**
     * @return {Object}
     */
    validLatestStateTasks () {
      // Values found in: https://github.com/cylc/cylc-flow/blob/9c542f9f3082d3c3d9839cf4330c41cfb2738ba1/cylc/flow/data_store_mgr.py#L143-L149
      return Object.entries(this.latestStateTasks).filter(entry => {
        return VALID_STATES.includes(entry[0])
      })
    }
  },
  methods: {
    /**
     * Get number of tasks we have in a given state. The states are retrieved
     * from `latestStateTasks`, and the number of tasks in each state is from
     * the `stateTotals`. (`latestStateTasks` includes old tasks).
     *
     * @param {String} state - a workflow state
     * @returns {Number} - the number of tasks in the given state
     */
    countTasksInState (state) {
      return this.stateTotals[state] || 0
    },
    /**
     * Defines the CSS class for a state. Useful for handling empty states, when
     * we need to compensate for no children HTML elements.
     *
     * @param {String} state - a workflow state
     * @return {Array<String>} - a list of CSS classes (can be empty).
     */
    getTaskStateClasses (state) {
      return this.countTasksInState(state) === 0 ? ['empty-state'] : []
    }
  }
}
</script>
