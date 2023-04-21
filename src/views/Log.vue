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
  <div class="h-100">
    <v-form>
      <v-container>
        <v-row justify="start">
          <v-col cols="12" md="4" >
            <v-text-field
            v-model="task"
            clearable
            flat
            dense
            hint="Type cycle/task/job to view job log"
            :prefix="workflowNamePrefix"
            outlined
            placeholder="cycle/task/job"
            class="flex-grow-1 flex-column"
            id="c-log-search-box"
            ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            md="4">
            <v-select
              :label="getFileListLabel"
              :items="getFileList"
              filled
              v-model="file"
              dense
              clearable
              outlined
              >
            </v-select>
          </v-col>
          <v-col  v-show="file === 'other'" cols="12" md="3">
            <v-text-field
              v-model="logFileEntered"
              placeholder="Enter Job File Name Here"
              dense
              clearable
              outlined
              >
            </v-text-field>
          </v-col>
          <v-col cols="12" md="1">
            <v-btn
            :disabled="isDisabled(task, file)"
            color="primary"
            dense
            outlined
            @click="setId(file, logFileEntered, task)">{{ buttonText() }}</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
    <div class="c-log pa-2 h-100" data-cy="log-view">
      <log-component
        :logs="lines"
        ref="log0"
        placeholder="Waiting for logs..."
      ></log-component>
    </div>
  </div>
</template>

<script>
import { mdiFileDocumentMultipleOutline } from '@mdi/js'
import pageMixin from '@/mixins/index'
import graphqlMixin from '@/mixins/graphql'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import LogComponent from '@/components/cylc/log/Log'
import SubscriptionQuery from '@/model/SubscriptionQuery.model'
import { LOGS_SUBSCRIPTION } from '@/graphql/queries'
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
    subscriptionComponentMixin
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
      jobLogFiles: ['job.out',
        'job.err',
        'job',
        'job-activity.log',
        'job.status',
        'job.xtrace',
        'other'],
      workflowLogFiles: ['scheduler/log'],
      widget: {
        title: 'logs',
        icon: mdiFileDocumentMultipleOutline
      },
      selectedLogFile: '',
      lines: [],
      logFileEntered: '',
      task: '',
      file: ''
    }
  },
  created () {
    this.$data.task = (this.initialOptions.task || '')
    this.$data.file = (this.initialOptions.file || '')
  },
  computed: {
    logVariables () {
      return {
        workflowName: new Tokens(this.workflowId).workflow,
        task: this.$data.task,
        file: this.$data.file
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
        return this.$data.jobLogFiles
      }
      return this.$data.workflowLogFiles
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
      return `${this.workflowName}//`
    }
  },
  methods: {
    setId (selectedLogFile, logFileEntered, jobSearch) {
      this.$data.lines = []
      this.$workflowService.unsubscribe(this)
      this.logVariables.task = jobSearch
      this.logVariables.file = this.getFileName(selectedLogFile, logFileEntered)
      this.$workflowService.subscribe(this)
      this.$workflowService.startSubscriptions()
    },
    buttonText () {
      if (this.$data.lines.length) {
        return 'Update'
      }
      return 'Search'
    },
    getFileName (selectedLogFile, logFileEntered) {
      if (selectedLogFile === 'scheduler/log') {
        return ''
      }
      if (selectedLogFile === 'other' && logFileEntered) {
        return logFileEntered
      } else {
        return selectedLogFile
      }
    },
    isDisabled (jobSearch, file) {
      if ((jobSearch && file) || (file === 'scheduler/log')) {
        return false
      } else {
        return true
      }
    }
  }
}
</script>
