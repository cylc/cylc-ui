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

<style lang="scss">
// make the toolbar sit alongside the workflow|job selector
// and put some space between them
.c-log .c-view-toolbar {
  display: inline-block;
  margin-left: 1em;
}
</style>

<template>
  <v-container
    class="c-log py-1"
    fluid
  >
    <!-- the controls -->
    <v-row dense>
      <v-col>
        <v-btn-toggle
          v-model="jobLog"
          divided
          mandatory
          variant="outlined"
          color="primary"
        >
          <v-btn data-cy="workflow-toggle">Workflow</v-btn>
          <v-btn data-cy="job-toggle">Job</v-btn>
        </v-btn-toggle>
        <ViewToolbar
          :groups="controlGroups"
          @setOption="setOption"
        />
      </v-col>
    </v-row>

    <!-- the inputs -->
    <v-row dense>
      <v-col cols="8">
        <v-text-field
          v-if="jobLog"
          data-cy="job-id-input"
          class="flex-grow-1 flex-column"
          v-model="relativeID"
          placeholder="cycle/task/job"
          clearable
        />
        <v-text-field
          v-else
          data-cy="workflow-id-input"
          v-model="workflowId"
          disabled
        />
      </v-col>
      <v-col cols="4">
        <v-select
          data-cy="file-input"
          :label="fileLabel"
          :disabled="fileDisabled"
          :items="logFiles"
          v-model="file"
          clearable
          :menu-props="{ 'data-cy': 'file-input-menu' }"
        />
      </v-col>
    </v-row>

    <!-- the status line -->
    <v-row dense>
      <v-col
        v-if="results.path"
        class="d-flex align-center overflow-x-auto text-pre"
      >
        <v-chip
          data-cy="connected-icon"
          variant="outlined"
          class="flex-shrink-0"
          v-bind="results.connected ? {
            color: 'success',
            prependIcon: $options.icons.mdiPowerPlug,
          } : {
            color: 'error',
            prependIcon: $options.icons.mdiPowerPlugOff,
            onClick: updateQuery
          }"
        >
          {{ results.connected ? 'Connected' : 'Reconnect' }}
        </v-chip>
        <span
          data-cy="log-path"
          style="padding-left: 0.5em; color: rgb(150,150,150);"
        >
          {{ results.path }}
        </span>
      </v-col>
    </v-row>

    <!-- the log file viewer -->
    <v-row>
      <v-col>
        <v-skeleton-loader
          v-if="id && file && results.connected == null"
          type="text@5"
          class="mx-n4"
        />
        <template v-else>
          <v-alert
            v-if="results.error"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-4"
            :icon="$options.icons.mdiFileAlertOutline"
          >
            <span class="text-pre-wrap text-break">
              {{ results.error }}
            </span>
          </v-alert>
          <log-component
            data-cy="log-viewer"
            :logs="results.lines"
            :timestamps="timestamps"
          />
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {
  mdiClockOutline,
  mdiFileAlertOutline,
  mdiFolderRefresh,
  mdiPowerPlugOff,
  mdiPowerPlug,
} from '@mdi/js'
import { getPageTitle } from '@/utils/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import LogComponent from '@/components/cylc/log/Log.vue'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import { Tokens } from '@/utils/uid'
import gql from 'graphql-tag'
import ViewToolbar from '@/components/cylc/ViewToolbar.vue'
import debounce from 'lodash/debounce'

/**
 * Query used to retrieve data for the Log view.
 *
 * @type {DocumentNode}
*/
const LOGS_SUBSCRIPTION = gql`
subscription LogData ($id: ID!, $file: String!) {
  logs (id: $id, file: $file) {
    lines
    connected
    path
    error
  }
}
`

//    error
//    path
//    connected

/**
 * Query used to retrieve available log files for the Log view.
 *
 * @type {DocumentNode}
*/
const LOG_FILE_QUERY = gql`
query LogFiles($id: ID!) {
  logFiles(id: $id) {
    files
  }
}
`

// The preferred file to start with as a list of patterns
// The first pattern with a matching file name will be choosen
const LOG_FILE_DEFAULTS = [
  // job stdout
  /job\.out/,
  // job script (e.g. on job submission failure)
  /job/,
  // scheduler log (lexographical sorting ensures the latest log)
  /scheduler\/*/
]

class Results {
  constructor () {
    /** @type {string[]} */
    this.lines = []
    /** @type {?string} */
    this.path = null
    /** @type {?boolean} */
    this.connected = null
    /** @type {?string} */
    this.error = null
  }
}

/** Callback for assembling the log file from the subscription */
class LogsCallback {
  /**
   * @param {Results} results
   */
  constructor (results) {
    this.results = results
  }

  onAdded (added, store, errors) {
    if (added.lines) {
      this.results.lines.push(...added.lines)
    }
    if (added.connected !== null) {
      this.results.connected = added.connected
    }
    if (added.error !== null) {
      this.results.error = added.error
    }
    if (added.path !== null) {
      this.results.path = added.path
    }
  }

  tearDown (store, errors) {}
  commit (store, errors) {}
}

export default {
  name: 'Log',

  mixins: [
    graphqlMixin,
    subscriptionComponentMixin
  ],

  components: {
    LogComponent,
    ViewToolbar
  },

  head () {
    return {
      title: getPageTitle('App.workflow', { name: this.workflowName })
    }
  },

  props: {
    initialOptions: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },

  data () {
    return {
      // the log subscription query
      query: null,
      // list of log files for the selected workflow/task/job
      logFiles: [],
      // the log file as a list of lines
      results: new Results(),
      // the task/job ID input
      relativeID: null,
      // the selected log file name
      file: null,
      // the label for the file input
      fileLabel: 'Select File',
      // turns the file input off (e.g. when the file list is being loaded)
      fileDisabled: false,
      // toggle between viewing workflow logs (0) and job logs (1)
      jobLog: 0, // default to displaying workflow logs
      // toggle timestamps in log files
      timestamps: true,
      controlGroups: [
        {
          title: 'Log',
          controls: [
            {
              title: 'Timestamps',
              icon: mdiClockOutline,
              action: 'toggle',
              value: true,
              key: 'timestamps'
            },
            {
              title: 'Refresh File List',
              icon: mdiFolderRefresh,
              action: 'callback',
              callback: () => { this.updateLogFileList(false) }
            }
          ]
        }
      ],
    }
  },

  created () {
    // set the ID/file if specified in initialOptions
    if (this.initialOptions?.tokens?.task) {
      this.relativeID = this.initialOptions.tokens.relativeID
    }
    if (this.initialOptions?.file) {
      this.file = this.initialOptions.file
    }
  },

  async mounted () {
    // load the log file list and subscribe on startup
    await this.updateLogFileList()
  },

  computed: {
    workflowTokens () {
      // tokens for the workflow this view was opened for
      return new Tokens(this.workflowId)
    },
    id () {
      // the ID of the workflow/task/job we are subscribed to
      // OR null if not subscribed
      if (this.jobLog) {
        try {
          const taskTokens = new Tokens(this.relativeID, true)
          if (!taskTokens?.task) {
            return null
          }
          return this.workflowTokens.clone({ cycle: taskTokens.cycle, task: taskTokens.task, job: taskTokens.job }).id
        } catch {
          return null
        }
      }
      return this.workflowId
    }
  },

  methods: {
    setOption (option, value) {
      // used by the ViewToolbar to update settings
      this[option] = value
    },
    reset () {
      this.results = new Results()
    },
    updateQuery () {
      // update the subscription query
      // wipe the log lines from any previous subscription
      this.reset()
      // check that there is something to subscribe to
      if (!this.file || !this.id) {
        this.query = null
        return
      }
      // update the subscription
      this.query = new SubscriptionQuery(
        LOGS_SUBSCRIPTION,
        { id: this.id, file: this.file },
        `log-query-${this._uid}`,
        [
          new LogsCallback(this.results)
        ],
        /* isDelta */ false,
        /* isGlobalCallback */ false
      )
    },
    async updateLogFileList (reset = true) {
      // if reset===true then the this.file will be reset
      // otherwise it will be left alone

      // update the list of log files
      this.fileLabel = 'Updating available files...'
      this.fileDisabled = true
      let result
      try {
        // get the list of available log files
        result = await this.$workflowService.apolloClient.query({
          query: LOG_FILE_QUERY,
          variables: { id: this.id }
        })
      } catch (err) {
        // the query failed
        console.warn(err)
        this.fileLabel = this.id ? `No log files for ${this.id}` : 'Enter a task/job ID'
        this.fileDisabled = true
        return
      }
      const logFiles = result.data.logFiles?.files ?? []

      // reset the file if it is not present in the new selection
      if (reset) {
        if (this.file && !logFiles.includes(this.file)) {
          this.file = null
        }

        // set the default log file if appropriate
        if (!this.file && logFiles.length) {
          for (const filePattern of LOG_FILE_DEFAULTS) {
            for (const fileName of logFiles) {
              if (filePattern.exec(fileName)) {
                this.file = fileName
                break
              }
            }
            if (this.file) { break }
          }
        }
      }

      // update the file input
      if (logFiles.length) {
        this.fileLabel = 'Select File'
        this.fileDisabled = false
        this.logFiles = logFiles
      } else {
        this.fileLabel = `No log files for ${this.id}`
        this.fileDisabled = true
        this.logFiles = []
      }
    }
  },

  watch: {
    id: debounce(
      // refresh the file list and update the query when the id changes
      async function () {
        await this.updateLogFileList()
        this.updateQuery()
      },
      // only re-run this once every 0.5 seconds
      500
    ),
    jobLog () {
      // reset the filename when the log mode changes
      this.file = null
    },
    file () {
      // update the query when the file changes
      this.updateQuery()
    }
  },

  // Misc options
  icons: {
    mdiFileAlertOutline,
    mdiPowerPlug,
    mdiPowerPlugOff,
  }
}
</script>
