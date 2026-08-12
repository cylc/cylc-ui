<!--
Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.

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
            v-model="inputID"
            :rules="[validateInputID]"
            placeholder="cycle/task/job"
            clearable
          >
            <template #prepend-inner>
              <v-btn
                :disabled="!relativeTokens || jobNode === false"
                v-bind="toolbarBtnProps"
                size="medium"
                variant="plain"
                @click="() => jobNode ?? fetchJobData()"
                data-cy="job-info-btn"
              >
                <v-icon :icon="$options.icons.mdiInformationOutline"/>
                <v-menu
                  activator="parent"
                  :close-on-content-click="false"
                >
                  <v-card class="pa-2">
                    <v-skeleton-loader
                      v-if="!jobNode"
                      type="text@6"
                    />
                    <JobDetails
                      v-else
                      :node="jobNode"
                      density="compact"
                      hover
                    >
                      <template #header>
                        {{ new Tokens(jobNode.id).relativeID }}
                      </template>
                    </JobDetails>
                  </v-card>
                </v-menu>
              </v-btn>
            </template>
          </v-text-field>
          <v-text-field
            v-else
            data-cy="workflow-id-input"
            v-model="workflowId"
            disabled
          />
        </v-col>
        <v-col
          cols="4"
          class="d-flex align-start col-gap-2"
        >
          <v-select
            data-cy="file-input"
            :label="fileLabel"
            :disabled="fileDisabled"
            :items="logFiles"
            v-model="file"
            :menu-props="{ 'data-cy': 'file-input-menu' }"
          />
          <v-btn
            @click="() => this.updateLogFileList()"
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
          v-if="results.connected != null"
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
          <template v-if="results.path">
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
          </template>
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
import { ref, computed, watch } from 'vue'
import { refWithControl, usePrevious, whenever } from '@vueuse/core'
import { useStore } from 'vuex'
import {
  mdiClockOutline,
  mdiFolderRefresh,
  mdiPowerPlugOff,
  mdiPowerPlug,
  mdiWrap,
  mdiFileAlertOutline,
  mdiMouseMoveDown,
  mdiInformationOutline,
  mdiFormatVerticalAlignBottom,
  mdiFormatVerticalAlignTop,
  mdiFormatVerticalAlignCenter,
  mdiPlaylistRemove,
  mdiFormatListNumbered,
  mdiRefresh,
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
import { Alert } from '@/model/Alert.model'
import { getJobLogFileFromState } from '@/model/JobState.model'
import JobDetails from '@/components/cylc/common/JobDetails.vue'
import { useLogWordWrapDefault } from '@/composables/localStorage'
import { eventBus } from '@/services/eventBus'

/**
 * Log view modes.
 *
 * These map to the `--mode` values of `cylc cat-log`. "HEAD" is presented to
 * the user but corresponds to the "tail-from-start" cat-log mode (follow the
 * file from the start); "TAIL" follows from the end; "MIXED" shows the start
 * and the end of the file, following the end.
 */
const LOG_MODE_TAIL = 'tail'
const LOG_MODE_HEAD = 'tail-from-start'
const LOG_MODE_MIXED = 'mixed'

/** The ordered list of modes the toolbar control cycles through. */
const LOG_MODES = [LOG_MODE_HEAD, LOG_MODE_TAIL, LOG_MODE_MIXED]

/**
 * Build a prominent multi-line divider shown where the log has been truncated.
 *
 * The block is a single log "line" (with embedded newlines) so it counts as one
 * entry for the pop/freeze logic. It has a trailing blank line so the following
 * log line starts fresh rather than appending to the marker.
 *
 * @param {string} message
 * @returns {string}
 */
function truncationMarker (message) {
  const rule = '-'.repeat(56)
  return `\n${rule}\n  ${message}\n${rule}\n\n`
}

/**
 * Dividers shown where the log file has been truncated.
 *
 * The uiserver sends a structured `truncated` value ("start", "middle" or
 * "end"); these are the human-readable blocks shown in its place.
 */
const LOG_TRUNCATION_MARKERS = {
  start: truncationMarker('earlier lines omitted (file truncated)'),
  middle: truncationMarker('lines omitted here (file truncated)'),
  end: truncationMarker('later lines omitted (file truncated)'),
}

/**
 * The default maximum number of log lines to fetch/display.
 *
 * This mirrors the uiserver's MAX_LINES default.
 */
const LOG_MAX_LINES_DEFAULT = 5000

/** The maximum value allowed for the maxLines option (memory guardrail). */
const LOG_MAX_LINES_MAX = 50000

/**
 * Coerce a user-provided maxLines value into a valid integer.
 *
 * Falls back to the default for invalid/empty input and caps at the maximum.
 *
 * @param {*} value
 * @returns {number}
 */
function normalizeMaxLines (value) {
  const n = parseInt(value, 10)
  if (!Number.isFinite(n) || n < 1) {
    return LOG_MAX_LINES_DEFAULT
  }
  return Math.min(n, LOG_MAX_LINES_MAX)
}

/**
 * Query used to retrieve data for the Log view.
 *
 * @type {DocumentNode}
*/
const LOGS_SUBSCRIPTION = gql`
subscription LogData ($id: ID!, $file: String!, $mode: String, $maxLines: Int) {
  logs (id: $id, file: $file, mode: $mode, maxLines: $maxLines) {
    lines
    connected
    path
    error
    truncated
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
query Jobs($id: ID!, $workflowId: ID!) {
  jobs (live: false, ids: [$id], workflows: [$workflowId]) {
    id
    state
    platform
    jobId
    jobRunnerName
    submittedTime
    startedTime
    finishedTime
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
    /**
     * Number of leading lines that must not be discarded in "pop" mode
     * (the frozen head block + marker when the middle is truncated).
     * @type {number}
     */
    this.frozenLength = 0
  }
}

/** Callback for assembling the log file from the subscription */
class LogsCallback extends DeltasCallback {
  /**
   * @param {Results} results
   * @param {() => (?number)} getMaxLines
   *   Returns the maximum number of lines to keep (discarding the oldest as
   *   new lines arrive), or null/undefined to keep all lines.
   */
  constructor (results, getMaxLines) {
    super()
    this.results = results
    this.getMaxLines = getMaxLines
  }

  onAdded (added, store, errors) {
    if (this.results.connected === false) {
      // We have reconnected; clear the current lines otherwise they will be duplicated
      this.results.lines = []
      this.results.frozenLength = 0
    }
    if (added.lines) {
      this.results.lines.push(...added.lines)
      this.trim()
    }
    if (added.truncated != null) {
      // insert a marker line where the file has been truncated
      const marker = LOG_TRUNCATION_MARKERS[added.truncated]
      if (added.truncated === 'start') {
        // the *start* of the file is omitted -> pin the marker to the top
        this.results.lines.unshift(marker)
        this.results.frozenLength = Math.max(this.results.frozenLength, 1)
      } else {
        // "middle" (mixed-mode boundary) or "end" of the file omitted
        this.results.lines.push(marker)
        if (added.truncated === 'middle') {
          // freeze the head block + marker so "pop" mode only rolls the tail
          this.results.frozenLength = this.results.lines.length
        }
      }
      this.trim()
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

  /**
   * In "pop" mode, discard the oldest non-frozen lines to stay within the
   * limit (the frozen leading lines are never discarded).
   */
  trim () {
    const maxLines = this.getMaxLines?.()
    if (maxLines != null && this.results.lines.length > maxLines) {
      this.results.lines.splice(
        this.results.frozenLength,
        this.results.lines.length - maxLines
      )
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
    JobDetails,
  },
  emits: [
    updateInitialOptionsEvent,
  ],

  props: {
    initialOptions,
    /** ID of widget if the log view is in a Lumino tab. */
    widgetID: {
      type: String,
      required: false,
      default: null,
    },
  },

  setup (props, { emit }) {
    const store = useStore()

    /**
     * The task/job ID.
     * @type {import('vue').Ref<string>}
     */
    const relativeID = useInitialOptions('relativeID', { props, emit })

    const previousRelativeID = usePrevious(relativeID)

    /**
     * The user input for task/job ID.
     * Set the value of relativeID at most every 0.5 seconds.
     */
    const inputID = refWithControl(relativeID.value, {
      onChanged: debounce((value) => {
        relativeID.value = value
      }, 500)
    })

    function validateInputID (id) {
      return !id || (Tokens.validate(id, true) ?? true)
    }

    /** @type {import('vue').Ref<Tokens>} */
    const relativeTokens = computed(() => {
      if (relativeID.value) {
        try {
          const tokens = new Tokens(relativeID.value, true)
          if (tokens.task) {
            return tokens.job ? tokens : tokens.clone({ job: 'NN' })
          }
        } catch {}
      }
      return null
    })

    /**
     * The selected log file name.
     * @type {import('vue').Ref<string>}
     */
    const file = useInitialOptions('file', { props, emit })

    /** Toggle timestamps in log files */
    const timestamps = useInitialOptions('timestamps', { props, emit }, true)

    /* Wrap lines? */
    const wordWrapDefault = useLogWordWrapDefault()
    const wordWrap = useInitialOptions('wordWrap', { props, emit }, wordWrapDefault.value)
    watch(wordWrap, (value) => {
      wordWrapDefault.value = value
    })

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

    /** AutoScroll? */
    const autoScroll = useInitialOptions('autoScroll', { props, emit }, true)

    /**
     * The log view mode (one of LOG_MODES).
     * HEAD (tail-from-start) shows the start of the file, TAIL the end, and
     * MIXED both ends. Defaults to HEAD to preserve the original behaviour.
     */
    const logMode = useInitialOptions('logMode', { props, emit }, LOG_MODE_HEAD)

    /**
     * Pop mode? (true = only keep the most recent LOG_MAX_LINES lines,
     * discarding the oldest as new lines arrive; false = keep all lines).
     * UI-only, so changing it does not require re-subscribing.
     */
    const popMode = useInitialOptions('popMode', { props, emit }, false)

    /**
     * The maximum number of log lines to fetch/display.
     * Changing this re-subscribes (raising it needs the backend). It also
     * acts as the cap for "pop" mode.
     * @type {import('vue').Ref<number>}
     */
    const maxLines = useInitialOptions(
      'maxLines', { props, emit }, LOG_MAX_LINES_DEFAULT
    )

    /**
     * The user input for maxLines.
     *
     * This holds the *uncommitted* value shown in the toolbar. It is only
     * applied to `maxLines` (which re-subscribes) when the user clicks the
     * apply button or presses Enter — see `applyMaxLines`. This avoids
     * re-streaming on every keystroke, which would add server load and make
     * the view flicker as lines are repeatedly removed and re-added.
     * @type {import('vue').Ref<number>}
     */
    const maxLinesInput = ref(maxLines.value)
    watch(maxLines, (value) => {
      // reflect the committed/normalised value back into the input field
      // (e.g. after clamping or when restoring a saved view)
      maxLinesInput.value = value
    })

    /**
     * Commit the edited maxLines value, re-subscribing with the new limit.
     * Snaps the input to the normalised value so the user sees any clamping.
     * @param {*} value
     */
    function applyMaxLines (value) {
      const normalized = normalizeMaxLines(value)
      maxLinesInput.value = normalized
      maxLines.value = normalized
    }

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
      inputID,
      validateInputID,
      relativeTokens,
      Tokens,
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
      logMode,
      popMode,
      maxLines,
      maxLinesInput,
      applyMaxLines,
      reset,
      toolbarBtnSize,
      toolbarBtnProps: btnProps(toolbarBtnSize),
      jobNode: ref(null),
    }
  },

  mounted () {
    // Watch id & file together:
    this.$watch(
      () => ({
        id: this.id ?? undefined, // (do not trigger the callback on null ⇄ undefined)
        file: this.file ?? undefined
      }),
      async ({ id, file }, old) => {
        // update the widget tab caption when the id or file change
        if (this.widgetID) {
          const prefix = this.relativeID ? `${this.relativeID} – ` : ''
          eventBus.emit(
            `lumino:update-tab:${this.widgetID}`,
            {
              title: `Log: ${this.jobLog ? 'Job' : 'Workflow'}`,
              caption: `${prefix}${file ?? 'No file selected'}`,
            }
          )
        }
        // update the query when the id or file change
        this.updateQuery()
        // refresh the file & file list when the id changes
        if (id !== old?.id) {
          await this.setNewFile(!old)
        }
      },
      { immediate: true }
    )

    // re-subscribe when the log view mode is changed
    this.$watch(() => this.logMode, (logMode) => {
      if (logMode === LOG_MODE_TAIL || logMode === LOG_MODE_MIXED) {
        // these modes follow the end of the file, so jump to the end and
        // follow new lines
        this.autoScroll = true
      }
      this.updateQuery()
    })

    // apply the pop limit immediately when it is enabled (otherwise it only
    // takes effect as new lines arrive)
    this.$watch(() => this.popMode, (popMode) => {
      if (popMode && this.results.lines.length > this.maxLines) {
        this.results.lines.splice(
          this.results.frozenLength,
          this.results.lines.length - this.maxLines
        )
      }
    })

    // re-subscribe when the maximum number of lines is changed
    this.$watch(() => this.maxLines, () => {
      this.updateQuery()
    })
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
        return this.relativeTokens?.clone(this.workflowTokens)?.id
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
            {
              title: {
                [LOG_MODE_HEAD]: 'HEAD: showing the start of the file',
                [LOG_MODE_TAIL]: 'TAIL: showing the end of the file',
                [LOG_MODE_MIXED]: 'MIXED: showing the start and end of the file',
              }[this.logMode],
              icon: {
                [LOG_MODE_HEAD]: mdiFormatVerticalAlignTop,
                [LOG_MODE_TAIL]: mdiFormatVerticalAlignBottom,
                [LOG_MODE_MIXED]: mdiFormatVerticalAlignCenter,
              },
              action: 'cycle',
              values: LOG_MODES,
              value: this.logMode,
              key: 'logMode',
            },
            {
              title: this.popMode
                ? `Popping: only keeping the most recent ${this.maxLines} lines`
                : 'Keeping all lines',
              icon: mdiPlaylistRemove,
              action: 'toggle',
              value: this.popMode,
              key: 'popMode',
            },
            {
              title: 'Maximum number of lines to fetch/display',
              icon: mdiFormatListNumbered,
              action: 'input',
              wide: true,
              value: this.maxLinesInput,
              key: 'maxLinesInput',
              appendButton: {
                icon: mdiRefresh,
                title: 'Apply — re-fetch this many lines',
                callback: (value) => this.applyMaxLines(value),
              },
              props: {
                type: 'number',
                min: 1,
                max: LOG_MAX_LINES_MAX,
                label: 'Max lines',
                'hide-details': true,
              },
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
        {
          id: this.id,
          file: this.file,
          mode: this.logMode,
          maxLines: this.maxLines,
        },
        `log-query-${this._uid}`,
        [
          new LogsCallback(this.results, () => this.popMode ? this.maxLines : null)
        ],
        /* isDelta */ false,
        /* isGlobalCallback */ false
      )
    },
    /**
     * Query job data.
     *
     * @returns {Object|false} The job node, or false if no data/the query failed.
     */
    async fetchJobData () {
      let result
      this.jobNode = null
      try {
        if (this.relativeTokens) {
          // get the latest job state
          result = await this.$workflowService.query2(
            JOB_QUERY,
            {
              id: this.relativeTokens.id,
              workflowId: this.workflowTokens.workflow
            }
          )
        }
      } catch (err) {
        // the query failed
        console.error(err)
        return false
      }
      this.jobNode = result?.data?.jobs?.[0] ?? false
      return this.jobNode
    },
    /**
     * Get the default workflow log file from the given log filenames, if there is a
     * matching filename. Relies on the filenames having been sorted in descending
     * order.
     *
     * @returns {?string}
     */
    getDefaultWorkflowLog () {
      return this.logFiles.find((fileName) => fileName.startsWith('scheduler/'))
    },
    async updateLogFileList () {
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
        this.handleLogFileListingErr(err)
        this.handleNoLogFiles()
        return
      }

      if (!this.id) {
        // id has been cleared while we were waiting for the query to return
        return
      }

      const logFiles = result.data.logFiles?.files ?? []

      // update the file input
      if (logFiles.length) {
        this.fileLabel = 'Select File'
        this.fileDisabled = false
        this.logFiles = logFiles
      } else {
        if (result.errors?.length) {
          this.handleLogFileListingErr(result.errors[0].message)
        }
        this.handleNoLogFiles()
      }
    },
    /**
     * Set the appropriate workflow or job log file.
     *
     * @param {boolean} initialLoad - is this the initial load of the log view?
     */
    async setNewFile (initialLoad) {
      const promises = [this.updateLogFileList()]
      if (this.jobLog && !initialLoad) {
        // (Don't query job state on initial load, as it will either be pre-populated or empty)
        promises.push(
          this.fetchJobData().then((result) => {
            this.file = getJobLogFileFromState(result?.state)
          })
        )
      }
      // Simultaneously wait for the log file list and the job state result
      await Promise.all(promises)
      if (!this.jobLog) {
        this.file = this.getDefaultWorkflowLog()
      }
    },
    handleNoLogFiles () {
      this.fileLabel = this.id ? `No log files for ${this.id}` : 'Enter a task/job ID'
      this.fileDisabled = true
      this.logFiles = []
    },
    handleLogFileListingErr (err) {
      this.$store.dispatch('setAlert', new Alert(err, 'error'))
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
    mdiFileAlertOutline,
    mdiInformationOutline,
  }
}
</script>
