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
  <v-container
    id="quickstart-guide"
    fluid
  >
    <h1 class="ma-0">Cylc UI Quick Start</h1>
    <!--
      TODO: make sections linkable

      TODO: add a contents bar which:
            * links to the guide sections
            * is presented when space is available
            * stays in a fixed position when scrolling (i.e. position: fixed)
            * tracks scroll position
    -->

    <div class="card-grid">

      <v-col>
        <v-card variant="outlined" class="pa-1">
          <v-card-title primary-title>
            <p class="text-h4 text--primary">Tasks &amp; Jobs</p>
          </v-card-title>
          <v-card-text>
            <p>
              A <b>task</b> represents a single unit of activity in a workflow.
            </p>
            <p>
              A <b>job</b> performs the activity of a task, by means of a
              <b>job script</b> submitted to a <b>job runner</b>.
            </p>
            <p>
              One task can have multiple jobs, by automatic retry or manual
              triggering.
            </p>
         </v-card-text>
            <table id="task-job-state-table">
              <tr>
                <td>Task</td>
                <td></td>
                <td>Job</td>
              </tr>
              <tr
                v-bind:key="state.name.name"
                v-for="state of states"
              >
                <td style="font-size: 2em;">
                  <!-- set times to make the progress change -->
                  <task
                    :task="{
                      state: state.name,
                      task: {meanElapsedTime: 30}
                    }"
                    :startTime="String(Date.now())"
                  />
                </td>
                <td>
                  <span>{{ state.name }}</span>
                </td>
                <td style="font-size: 2em;">
                  <job :status="state.name" />
                </td>
              </tr>
            </table>
          <v-card-text>
            <p>
              A <b>waiting task</b> with <b>failed jobs</b> will
              <b>retry</b> after a delay.
            </p>
            <p>
              A <b>task</b> can only fail if it runs out of retries.
            </p>
          </v-card-text>
        </v-card>

        <br />

        <v-card variant="outlined" class="pa-1">
          <v-card-title primary-title>
            <p class="text-h4 text--primary">Skip Mode?</p>
          </v-card-title>
          <v-card-text>
            <p>
              Tasks can be configured to skip rather than run. These tasks are
              marked with a special icon proving they are not otherwise held
              back from running by some other factor (e.g, if they are held).
            </p>
            <v-list
               lines="three"
            >
              <v-list-item>
                <template v-slot:prepend>
                  <task
                    style="font-size: 2em;"
                    :task="{state: 'waiting', runtime: { runMode: 'Skip' }}"
                    class="mr-4"
                  />
                </template>
                <v-list-item-title>
                  Skip Mode
                </v-list-item-title>
                <v-list-item-subtitle>
                  This task will be run in skip mode.
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col>
        <v-card variant="outlined" class="pa-1">
          <v-card-title primary-title>
            <p class="text-h4 text--primary">Why Are We Waiting?</p>
          </v-card-title>
          <v-card-text>
            <p>
              Why has my task not started to run yet?
            </p>
           <v-list
              lines="three"
            >
              <v-list-item>
                <template v-slot:prepend>
                  <task
                    style="font-size: 2em;"
                    :task="{state: 'waiting'}"
                    class="mr-4"
                  />
                </template>
                <v-list-item-title>
                  Waiting
                </v-list-item-title>
                <v-list-item-subtitle>
                  The task is not ready to run yet - it is still waiting on
                  upstream <b>dependencies</b> (or old style
                  external triggers).
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <task
                    style="font-size: 2em;"
                    :task="{state: 'waiting', isHeld: true}"
                    class="mr-4"
                  />
                </template>
                <v-list-item-title>
                  Held
                </v-list-item-title>
                <v-list-item-subtitle>
                  The task won't run unless <b>released</b> from hold.
                  Tasks can be held before they are ready to run
                  (or after, prior to retriggering).
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <task
                    style="font-size: 2em;"
                    :task="{state: 'waiting', isRunahead: true}"
                    class="mr-4"
                  />
                </template>
                <v-list-item-title>
                  Runahead
                </v-list-item-title>
                <v-list-item-subtitle>
                  The task is ready to run but is beyond the runahead limit,
                  which restricts the number of active cycle points.
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <task
                    style="font-size: 2em;"
                    :task="{state: 'waiting', isQueued: true}"
                    class="mr-4"
                  />
                </template>
                <v-list-item-title>
                  Queued
                </v-list-item-title>
                <v-list-item-subtitle>
                  The task is ready to run but is held back by a queue,
                  which restricts the number of active tasks.
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <task
                    style="font-size: 2em;"
                    :task="{state: 'waiting', isRetry: true}"
                    class="mr-4"
                  />
                </template>
                <v-list-item-title>
                  Retry
                </v-list-item-title>
                <v-list-item-subtitle>
                  The task is waiting to retry running after
                  a configured <b>submission or execution retry delay</b>.
                  It will then attempt to run the job again.
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <task
                    style="font-size: 2em;"
                    :task="{state: 'waiting', isWallclock: true}"
                    class="mr-4"
                  />
                </template>
                <v-list-item-title>
                  Wallclock
                </v-list-item-title>
                <v-list-item-subtitle>
                  This task is waiting for a wallclock trigger.
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <task
                    style="font-size: 2em;"
                    :task="{state: 'waiting', isXtriggered: true}"
                    class="mr-4"
                  />
                </template>
                <v-list-item-title>
                  Xtriggered
                </v-list-item-title>
                <v-list-item-subtitle>
                  This task is waiting for an <b>xtrigger</b>.
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p>
            <em>Note: tasks downstream of queued (or runahead limited) tasks
               are not themselves shown as queued (or runahead limited)
               because they are not otherwise ready to run yet.</em>
             </p>
          </v-card-text>
        </v-card>
      </v-col>
    </div>

  </v-container>
</template>

<script>
import Task from '@/components/cylc/Task.vue'
import Job from '@/components/cylc/Job.vue'
import { TaskStateUserOrder } from '@/model/TaskState.model'

export default {
  name: 'Guide',
  components: {
    task: Task,
    job: Job
  },
  // TODO: extract task states and descriptions from the GraphQL API
  //       once this is an enumeration.
  data: () => ({
    states: TaskStateUserOrder
  })
}
</script>

<style lang="scss">
  .card-grid {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 1em;

    > * {
      margin: 0.5em;
    }

  }

  .v-card-text p + p {
    margin-top: 8px;
  }

  #task-job-state-table {
    text-align: center;
    /*border-spacing: 1em 0.5em;*/
    border-spacing: 0;

    p {
      margin-top: 1em;
      line-height: 1.2em;
    }

    tr:nth-child(1) {
      font-size: 2em;
    }

    tr > td:nth-child(2) {
      font-size: 1em;
    }

    tr > td:nth-child(1), tr > td:nth-child(3) {
      width: 5em;
    }

    td {
      padding: 0.1em 0 0.1em 0;
    }

    td > * {
      background-color: white;
    }
  }
</style>
