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
    class="c-log h-100 pa-0 d-flex flex-column"
    fluid
  >
    <v-container fluid>
      <!-- the controls -->
      <v-row
        dense
        class="flex-0-0"
      >
        <v-col class="pt-0">
          <v-btn-toggle
            v-model="jobLog"
            divided
            mandatory
            variant="outlined"
            color="primary"
            density="comfortable"
          >
            <v-btn data-cy="workflow-toggle">Workflow</v-btn>
            <v-btn data-cy="job-toggle">Job</v-btn>
          </v-btn-toggle>
          <ViewToolbar
            :groups="controlGroups"
            @setOption="setOption"
            :size="toolbarBtnSize"
          />
        </v-col>
      </v-row>

      <!-- the inputs -->
      <v-row
        dense
        class="flex-0-0"
      >
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
        <v-col
          cols="4"
          class="d-flex col-gap-2"
        >
          <v-select
            data-cy="file-input"
            :label="fileLabel"
            :disabled="fileDisabled"
            :items="logFiles"
            v-model="file"
            clearable
            :menu-props="{ 'data-cy': 'file-input-menu' }"
          />
          <v-btn
            @click="() => this.updateLogFileList(false)"
            v-bind="toolbarBtnProps"
            data-cy="refresh-files"
          >
            <v-icon :icon="$options.icons.mdiFolderRefresh"/>
            <v-tooltip>Refresh file list</v-tooltip>
          </v-btn>
        </v-col>
      </v-row>

      <!-- the status line -->
      <v-row
        dense
        class="flex-0-0"
      >
        <v-col
          v-if="results.path"
          class="d-flex align-center"
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
          <div
            data-cy="log-path"
            class="ml-2 mr-1 d-flex text-medium-emphasis text-pre overflow-x-hidden"
          >
            <span>{{ results.host }}:</span>
            <span class="flex-shrink-1 text-truncate">{{ parentPath }}</span>
            <span>/{{ file }}</span>
          </div>
          <CopyBtn
            :text="results.path"
            tooltip="Copy path"
          />
        </v-col>
      </v-row>
      <v-alert
        v-if="results.error"
        type="error"
        variant="tonal"
        density="compact"
        class="mt-2"
        :icon="$options.icons.mdiFileAlertOutline"
      >
        <span class="text-pre-wrap text-break">
          {{ results.error }}
        </span>
      </v-alert>
    </v-container>

    <!-- the log file viewer -->
    <v-skeleton-loader
      v-if="id && file && results.connected == null"
      type="text@5"
      class="align-content-start"
    />
    <log-component
      v-else
      data-cy="log-viewer"
      :logs="results.lines"
      :timestamps="timestamps"
      :word-wrap="wordWrap"
      v-model:autoScroll="autoScroll"
    />
  </v-container>
</template>

<script>
import { ref, computed } from 'vue'
import { usePrevious, whenever } from '@vueuse/core'
import { useStore } from 'vuex'
import {
  mdiClockOutline,
  mdiFolderRefresh,
  mdiPowerPlugOff,
  mdiPowerPlug,
  mdiWrap,
  mdiFileAlertOutline,
  mdiMouseMoveDown,
} from '@mdi/js'
import { btnProps } from '@/utils/viewToolbar'
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
import DeltasCallback from '@/services/callbacks'
import { debounce } from 'lodash-es'
import CopyBtn from '@/components/core/CopyBtn.vue'
import { getJobLogFileFromState } from '@/model/JobState.model'

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
 * Query used to retrieve data on the Job.
 *
 * @type {DocumentNode}
*/
const JOB_QUERY = gql`
query JobState($id: ID!, $workflowId: ID!) {
  jobs (live: false, ids: [$id], workflows: [$workflowId]) {
    id
    state
  }
}
`

/**
 * The preferred file to start with as a list of patterns.
 * The first pattern with a matching file name will be chosen.
 */

class Results {
  constructor () {
    /** @type {string[]} */
    this.lines = []
    /** @type {?string} */
    this.host = null
    /** @type {?string} */
    this.path = null
    /** @type {?boolean} */
    this.connected = null
    /** @type {?string} */
    this.error = null
  }
}

/** Callback for assembling the log file from the subscription */
class LogsCallback extends DeltasCallback {
  /**
   * @param {Results} results
   */
  constructor (results) {
    super()
    this.results = results
  }

  onAdded (added, store, errors) {
    if (this.results.connected === false) {
      // We have reconnected; clear the current lines otherwise they will be duplicated
      this.results.lines = []
    }
    if (added.lines) {
      this.results.lines.push(...added.lines)
    }
    if (added.connected != null) {
      this.results.connected = added.connected
    }
    if (added.error != null) {
      this.results.error = added.error
    }
    if (added.path != null) {
      [this.results.host, this.results.path] = added.path.split(':', 2)
    }
  }
}

export default {
  name: 'Log',

  mixins: [
    graphqlMixin,
    subscriptionComponentMixin
  ],

  components: {
    CopyBtn,
    LogComponent,
    ViewToolbar,
  },
  emits: [
    updateInitialOptionsEvent,
  ],

  props: {
    initialOptions,
  },

  setup (props, { emit }) {
    const store = useStore()

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

    /** Toggle timestamps in log files */
    const timestamps = useInitialOptions('timestamps', { props, emit }, true)

    /** Wrap lines? */
    const wordWrap = useInitialOptions('wordWrap', { props, emit }, false)

    /** The log subscription results */
    const results = ref(new Results())

    function reset () {
      results.value = new Results()
    }

    /** The path of the log file parent dir minus the trailing slash. */
    const parentPath = computed(
      () => results.value.path?.substring(0, results.value.path.length - file.value.length - 1)
    )

    whenever(
      () => store.state.offline,
      () => { results.value.connected = false }
    )

    /** Set the value of relativeID at most every 0.5 seconds, used for text input */
    const debouncedUpdateRelativeID = debounce((value) => {
      relativeID.value = value
    }, 500)

    /** AutoScroll? */
    const autoScroll = useInitialOptions('autoScroll', { props, emit }, true)

    /** View toolbar button size */
    const toolbarBtnSize = '40'

    return {
      // the log subscription query
      query: ref(null),
      // list of log files for the selected workflow/task/job
      logFiles: ref([]),
      results,
      parentPath,
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
      timestamps,
      wordWrap,
      autoScroll,
      reset,
      debouncedUpdateRelativeID,
      toolbarBtnSize,
      toolbarBtnProps: btnProps(toolbarBtnSize),
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
    },
    controlGroups () {
      return [
        {
          title: 'Log',
          controls: [
            {
              title: 'Timestamps',
              icon: mdiClockOutline,
              action: 'toggle',
              value: this.timestamps,
              key: 'timestamps'
            },
            {
              title: 'Word wrap',
              icon: mdiWrap,
              action: 'toggle',
              value: this.wordWrap,
              key: 'wordWrap',
            },
            {
              title: 'Auto scroll',
              icon: mdiMouseMoveDown,
              action: 'toggle',
              value: this.autoScroll,
              key: 'autoScroll',
            },
          ]
        }
      ]
    }
  },

  methods: {
    setOption (option, value) {
      // used by the ViewToolbar to update settings
      this[option] = value
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
    /**
     * Return the default job log file from the given log filenames, if there is a
     * matching filename. Relies on the filenames having been sorted in descending
     * order.
     *
     * @returns {?string}
     */
    async getDefaultJobLog () {
      // get the job from the store
      let result
      try {
        if (this.id) {
          // get the list of available log files
          result = await this.$workflowService.query2(
            JOB_QUERY,
            {
              id: this.id.split('//')[1],
              workflowId: this.workflowTokens.workflow
            }
          )
        }
      } catch (err) {
        // the query failed
        console.warn(err)
        return
      }
      return getJobLogFileFromState(result?.data?.jobs?.[0]?.state)
    },
    /**
     * Return the default workflow log file from the given log filenames, if there is a
     * matching filename. Relies on the filenames having been sorted in descending
     * order.
     *
     * @param {string[]} logFiles - list of available log filenames
     * @returns {?string}
     */
    getDefaultWorkflowLog (logFiles) {
      return logFiles.find((fileName) => fileName.startsWith('scheduler/'))
    },
    /**
     * Return the default log file from the given log filenames, if there is a
     * matching filename. Relies on the filenames having been sorted in descending
     * order.
     *
     * @param {string[]} logFiles - list of available log filenames
     * @returns {?string}
     */
    async getDefaultFile (logFiles) {
      return this.jobLog ? await this.getDefaultJobLog() : this.getDefaultWorkflowLog(logFiles)
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

      if (!this.id) {
        // id has been cleared while we were waiting for the query to return
        return
      }

      const logFiles = result.data.logFiles?.files ?? []

      // reset the file if it is not present in the new selection
      if (reset) {
        if (!this.file || !this.initialLoad) {
          // set the default log file if appropriate
          this.file = await this.getDefaultFile(logFiles)
        }
        this.initialLoad = false
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
    }
  },

  // Misc options
  icons: {
    mdiFolderRefresh,
    mdiPowerPlug,
    mdiPowerPlugOff,
    mdiFileAlertOutline
  }
}
</script>
