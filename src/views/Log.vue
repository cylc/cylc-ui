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
<style>
.v-application--is-ltr .v-text-field__prefix {
  text-align: right;
  padding-right: 0px;
  color: blue;
}
</style>
<template>
  <v-container fluid mt-4>
    <v-row>
      <span class="title font-weight-light ma-2">
        Viewing {{ this.fileType }} Log: {{ this.actualFile }} for {{ this.workflowName }}
      </span>
    </v-row>
    <v-row justify="start">
      <v-col cols="12">
        <v-form fluid>
          <v-row justify="start">
            <v-col class="id">
              <v-text-field v-model.lazy="task" clearable flat dense hint="Type cycle/task/job to view job log"
                :prefix="workflowNamePrefix" @change="fileQuery()" outlined placeholder="cycle/task/job"
                class="flex-grow-1 flex-column" id="c-log-search-box"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="start" align="top">
            <v-col cols="6">
              <v-select :label="getFileListLabel" :items="getFileList" filled v-model="file" dense clearable outlined>
              </v-select>
            </v-col>
            <v-col cols="2">
              <v-btn :disabled="isDisabled(task, file)" color="primary" dense outlined @click="setId(file, task)">{{
                buttonText() }}</v-btn>
            </v-col>
            <v-col cols="4">
              <v-switch v-model="timestamps" color="primary" label="Timestamps"></v-switch>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-row>
        <log-component :logs="lines" :timestamps="timestamps" ref="log0" placeholder="Fetching logs..."></log-component>
    </v-row>
  </v-container>
</template>

<script>
import { mdiFileDocumentMultipleOutline } from '@mdi/js'
import pageMixin from '@/mixins/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionViewMixin from '@/mixins/subscriptionView'
import subscriptionMixin from '@/mixins/subscriptionComponent'
import LogComponent from '@/components/cylc/log/Log'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import { LOGS_SUBSCRIPTION, LOG_FILE_QUERY } from '@/graphql/queries'
import { Tokens } from '@/utils/uid'

class LogsCallback {
  constructor (lines) {
    this.lines = lines
  }

  tearDown (store, errors) {
  }

  onAdded (added, store, errors) {
    this.lines.push(...added.lines)
  }

  commit (store, errors) {
  }
}

export default {
  mixins: [
    pageMixin,
    graphqlMixin,
    subscriptionMixin,
    subscriptionViewMixin
  ],
  name: 'Log',
  components: {
    LogComponent
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
  data () {
    return {
      logFiles: [],
      widget: {
        title: 'logs',
        icon: mdiFileDocumentMultipleOutline
      },
      selectedLogFile: '',
      lines: [],
      task: '',
      file: '',
      timestamps: true,
      loading: true,
      fileType: 'Workflow',
      actualFile: 'Log'
    }
  },
  created () {
    if (this.initialOptions) {
      this.$data.task = this.initialOptions.task || ''
      this.$data.file = this.initialOptions.file || ''
    }
    this.fileQuery()
  },
  computed: {
    logVariables () {
      return {
        workflowName: new Tokens(this.workflowId).workflow,
        task: this.$data.task,
        file: this.$data.file
      }
    },
    logFileVars () {
      return {
        workflowName: new Tokens(this.workflowId).workflow,
        task: this.$data.task
      }
    },

    getFileListLabel () {
      if (this.$data.task && this.$data.task.length) {
        return 'Select Job Log File'
      }
      return 'Select Workflow Log File'
    },
    getFileList () {
      if (this.$data.task && this.$data.task.length) {
        return this.$data.logFiles
      }
      return this.$data.logFiles
    },
    query () {
      return new SubscriptionQuery(
        LOGS_SUBSCRIPTION,
        this.logVariables,
        `log-query-${this._uid}`,
        // ,
        [
          new LogsCallback(this.lines)
        ],
        /* isDelta */ false,
        /* isGlobalCallback */ false
      )
    },
    workflowNamePrefix () {
      if (this.workflowName.length > 20) {
        const splitWorkflowName = this.workflowName.split('/')
        const l = splitWorkflowName.length - 1
        return `../${splitWorkflowName[l]}//`
      }
      return `${this.workflowName}//`
    }
  },
  methods: {
    async fileQuery () {
      this.$data.logFiles = ['Updating available files...']
      const result = await this.$workflowService.apolloClient.query({
        query: LOG_FILE_QUERY,
        variables: this.logFileVars
      })
      this.$data.logFiles = result.data.logFiles.files
    },
    setId (selectedLogFile, jobSearch) {
      this.$data.lines = []
      this.$workflowService.unsubscribe(this)
      this.logVariables.task = jobSearch
      this.logVariables.file = this.getFileName(selectedLogFile)
      this.$workflowService.subscribe(this)
      this.$workflowService.startSubscriptions()
      this.$data.actualFile = this.$data.file
      this.$data.fileType = this.getFileType()
    },
    getFileType () {
      if (this.logVariables.task.length) {
        return 'Job'
      } else {
        return 'Workflow'
      }
    },
    buttonText () {
      if (this.$data.lines.length) {
        return 'Update'
      }
      return 'Search'
    },
    getFileName (selectedLogFile) {
      if (selectedLogFile === 'log') {
        return ''
      } else {
        return selectedLogFile
      }
    },
    isDisabled (jobSearch, file) {
      return false
    }
  }
}
</script>
