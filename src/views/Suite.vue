<template>
  <v-container
      fill-height
      fluid
      grid-list-xl
  >
    <v-layout
        justify-center
        wrap
    >
      <v-flex
          md12
      >
        <material-card
            text="This is the list of tasks for the suite"
            title="Tasks"
            color="green"
        >
          <vue-ads-table
              :columns="columns"
              :rows="tree"
              :classes="classes"
              :filter="filter"
              :start="start"
              :end="end"
              @filter-change="filterChanged"
          >
            <template slot="toggle-children-icon" slot-scope="props">
              <span>
                <i class="mdi mdi-minus" v-if="props.expanded"></i>
                <i class="mdi mdi-plus" v-else></i>
              </span>
            </template>
          </vue-ads-table>
        </material-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { SuiteService } from 'suite-service'
  import {mapState} from 'vuex'

  const suiteService = new SuiteService();

  export default {
    metaInfo() {
      return {
        title: 'Cylc UI | Suite ' + this.$route.params.name
      }
    },
    data: () => ({
      columns: [
        {
          property: 'name',
          title: 'Task',
          direction: null,
          filterable: true,
          collapseIcon: true
        },
        {
          property: 'state',
          title: 'State',
          direction: null,
          filterable: false
        },
        {
          property: 'host',
          title: 'Host',
          direction: null,
          filterable: true
        },
        {
          property: 'jobId',
          title: 'Job ID',
          direction: null,
          filterable: true
        },
        {
          property: 'latestMessage',
          title: 'Latest Message',
          direction: null,
          filterable: false
        },
        {
          property: 'depth',
          title: 'Depth',
          direction: null,
          filterable: false
        }
      ],
      classes: {
        table: "v-table",
        '0/all': {'column text-xs-left': true}
      },
      // vue-ads-table-tree filtering (even if not enabled, we need this)
      filter: '',
      // vue-ads-table-tree pagination
      start: 0,
      end: 100,
      // TODO: page polling, for the time being until we have websockets/graphql subscriptions
      polling: null
    }),
    methods: {
      filterChanged (filter) {
        this.filter = filter;
      },
      fetchSuite() {
        const suiteId = this.$route.params.name
        suiteService.fetchSuiteTree(suiteId)
        // TODO: to be replaced by websockets
        this.polling = setInterval(() => {
          suiteService.currentTaskIndex += 1
          suiteService.fetchSuiteTree(suiteId)
        }, 3000)
      }
    },
    beforeDestroy() {
      clearInterval(this.polling)
    },
    computed: {
      // namespace: module suites, and property suites, hence these repeated tokens...
      ...mapState('suites', ['tasks', 'tree']),
      ...mapState(['isLoading'])
    },
    mounted: function () {
      this.fetchSuite()
    }
  }
</script>
