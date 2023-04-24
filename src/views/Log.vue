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
    class="c-log"
    fluid
    py-0
  >
    <!-- the controls -->
    <v-row dense>
      <v-col>
        <v-btn-toggle
          class="job-workflow-toggle"
          v-model="jobLog"
          divided
          variant="outlined"
        >
          <v-btn>Workflow</v-btn>
          <v-btn>Job</v-btn>
        </v-btn-toggle>
        <ViewToolbar
          :groups="groups"
          @setOption="setOption"
        />
      </v-col>
    </v-row>

    <!-- the inputs -->
    <v-row dense>
      <v-col cols="8">
        <v-text-field
          class="flex-grow-1 flex-column job-id-input"
          v-if="jobLog"
          v-model="relativeID"
          placeholder="cycle/task/job"
          hide-details
          clearable
          dense
          flat
          outlined
        />
        <v-text-field
          class="workflow-id-input"
          v-else
          v-model="workflowId"
          disabled
          hide-details
          dense
          flat
          outlined
        />
      </v-col>
      <v-col cols="4">
        <v-select
          class="file-input"
          :label="fileLabel"
          :disabled="fileDisabled"
          :items="logFiles"
          v-model="file"
          hide-details
          filled
          dense
          clearable
          outlined
        />
      </v-col>
    </v-row>

    <!-- the status line -->
    <v-row dense>
      <v-col v-if="results.path" style="white-space: pre; overflow-x: scroll">
        <v-chip
          class="connected-icon"
          v-if="results.connected"
          color="green"
          outlined
        >
          <v-icon>{{ $options.icons.mdiPowerPlug }}</v-icon>
          Connected
        </v-chip>
        <v-chip
          class="disconnected-icon"
          v-else
          color="red"
          @click="updateQuery"
          outlined
        >
          <v-icon>{{ $options.icons.mdiPowerPlugOff }}</v-icon>
          Reconnect
        </v-chip>
        <span
          class="log-path"
          style="padding-left: 0.5em; color: rgb(150,150,150);"
        >{{ results.path }}</span>
      </v-col>
    </v-row>

    <!-- the log file viewer -->
    <v-row>
      <v-col>
        <v-skeleton-loader
          v-if="id && file && !results.path"
          width="50%"
          type="list-item-three-line"
        />
        <log-component
          class="log-viewer"
          v-else
          :logs="results.lines"
          :timestamps="timestamps"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from 'vue'
import {
  mdiClockOutline,
  mdiFileDocumentMultipleOutline,
  mdiFolderRefresh,
  mdiPowerPlugOff,
  mdiPowerPlug
} from '@mdi/js'
import pageMixin from '@/mixins/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import LogComponent from '@/components/cylc/log/Log'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import { Tokens } from '@/utils/uid'
import gql from 'graphql-tag'
import ViewToolbar from '@/components/cylc/ViewToolbar'
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

// Callback for assembling the log file from the subscription
class LogsCallback {
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
  mixins: [
    pageMixin,
    graphqlMixin,
    subscriptionComponentMixin
  ],

  name: 'Log',

  components: {
    LogComponent,
    ViewToolbar
  },

  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },

  props: {
    initialOptions: {
      type: Object,
      required: false,
      default: () => {}
    }
  },

  icons: {
    mdiPowerPlug,
    mdiPowerPlugOff
  },

  data () {
    return {
      // metadata for the workspace view
      widget: {
        title: 'logs',
        icon: mdiFileDocumentMultipleOutline
      },
      // the log subscription query
      query: null,
      // list of log files for the selected workflow/task/job
      logFiles: [],
      // the log file as a list of lines
      results: {
        lines: [],
        path: null,
        connected: false,
        error: null
      },
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

      // option groups
      groups: [
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
      ]
    }
  },

  created () {
    // set the ID/file if specified in initialOptions
    if (this.initialOptions && this.initialOptions.tokens) {
      if (this.initialOptions.tokens.task) {
        this.$data.relativeID = this.initialOptions.tokens.relative_id
        this.$data.jobLog = 1
      }
    }
    if (this.initialOptions && this.initialOptions.file) {
      this.$data.file = this.initialOptions.file
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
          if (!taskTokens || !taskTokens.task) {
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
      Vue.set(this, option, value)
    },
    reset () {
      this.results = {
        lines: [],
        path: null,
        connected: false,
        error: null
      }
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
        // ,
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
      } catch {
        // the query failed
        this.fileLabel = `No log files for ${this.id}`
        this.fileDisabled = true
        return
      }
      let logFiles
      if (result.data.logFiles) {
        logFiles = result.data.logFiles.files
      } else {
        logFiles = []
      }

      // reset the file if it is not present in the new selection
      if (reset) {
        if (this.file && !(this.file in logFiles)) {
          this.file = null
        }

        // set the default log file if appropriate
        if (!this.file && logFiles) {
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
  }
}
</script>
