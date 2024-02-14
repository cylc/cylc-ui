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
          :model-value="relativeID"
          @update:modelValue="debouncedUpdateRelativeID"
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
import { ref } from 'vue'
import { usePrevious } from '@vueuse/core'
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
import {
  initialOptions,
  updateInitialOptionsEvent,
  useInitialOptions
} from '@/utils/initialOptions'
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

/**
 * The preferred file to start with as a list of patterns.
 * The first pattern with a matching file name will be chosen.
 */
const LOG_FILE_DEFAULTS = [
  // job stdout
  /^job\.out$/,
  // job script (e.g. on job submission failure)
  /^job$/,
  // scheduler log (lexographical sorting ensures the latest log)
  /^scheduler\/*/
]

/**
 * Return the default log file from the given log filenames, if there is a
 * matching filename. Relies on the filenames having been sorted in descending
 * order.
 *
 * @param {string[]} logFiles - list of available log filenames
 * @returns {?string}
 */
export const getDefaultFile = (logFiles) => {
  if (logFiles.length) {
    for (const filePattern of LOG_FILE_DEFAULTS) {
      for (const fileName of logFiles) {
        if (filePattern.exec(fileName)) {
          return fileName
        }
      }
    }
  }
  return null // rather than undefined
}

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

  emits: [
    updateInitialOptionsEvent,
  ],

  props: {
    initialOptions,
  },

  setup (props, { emit }) {
    /**
     * The task/job ID input.
     * @type {import('vue').Ref<string>}
     */
    const relativeID = useInitialOptions('relativeID', { props, emit })

    const previousRelativeID = usePrevious(relativeID)

    /**
     * The selected log file name.
     * @type {import('vue').Ref<string>}
     */
    const file = useInitialOptions('file', { props, emit })

    /** Set the value of relativeID at most every 0.5 seconds, used for text input */
    const debouncedUpdateRelativeID = debounce((value) => {
      relativeID.value = value
    }, 500)

    return {
      // the log subscription query
      query: ref(null),
      // list of log files for the selected workflow/task/job
      logFiles: ref([]),
      // the log file as a list of lines
      results: ref(new Results()),
      relativeID,
      previousRelativeID,
      file,
      // the label for the file input
      fileLabel: ref('Select File'),
      // turns the file input off (e.g. when the file list is being loaded)
      fileDisabled: ref(false),
      // toggle between viewing workflow logs (0) and job logs (1).
      // default to displaying workflow logs unless initial task/job ID is provided.
      jobLog: ref(relativeID.value == null ? 0 : 1),
      // toggle timestamps in log files
      timestamps: ref(true),
      debouncedUpdateRelativeID,
    }
  },

  data () {
    return {
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

  mounted () {
    // Watch id & file together:
    this.$watch(
      () => ({
        id: this.id ?? undefined, // (treat null as undefined)
        file: this.file ?? undefined
      }),
      async ({ id }, old) => {
        // update the query when the id or file change
        this.updateQuery()
        // refresh the file list when the id changes
        if (id !== old?.id) {
          await this.updateLogFileList()
        }
      },
      { immediate: true }
    )
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

      if (!this.id) {
        this.handleNoLogFiles()
        return
      }
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
        this.handleNoLogFiles()
        return
      }
      const logFiles = result.data.logFiles?.files ?? []

      // reset the file if it is not present in the new selection
      if (reset) {
        if (this.file && !logFiles.includes(this.file)) {
          this.file = null
        }
        if (!this.file) {
        // set the default log file if appropriate
          this.file = getDefaultFile(logFiles)
        }
      }

      // update the file input
      if (logFiles.length) {
        this.fileLabel = 'Select File'
        this.fileDisabled = false
        this.logFiles = logFiles
      } else {
        this.handleNoLogFiles()
      }
    },
    handleNoLogFiles () {
      this.fileLabel = this.id ? `No log files for ${this.id}` : 'Enter a task/job ID'
      this.fileDisabled = true
      this.logFiles = []
    },
  },

  watch: {
    jobLog (val, old) {
      // reset the filename when the log mode changes
      this.file = null
      // go back to last chosen job if we are switching back to job logs
      this.relativeID = val ? this.previousRelativeID : null
    },
  },

  // Misc options
  icons: {
    mdiFileAlertOutline,
    mdiPowerPlug,
    mdiPowerPlugOff,
  }
}
</script>
