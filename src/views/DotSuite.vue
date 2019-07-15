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
          :text="$t('DotView.tableSubHeader')"
          :title="$t('DotView.tableHeader')"
          color="indigo"
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
            <template
              slot="state"
              slot-scope="props"
              class="dotClass"
            >
              <taskDot
                :dotClass="props.row[props.column.property]"
              >
              </taskDot>
            </template>
          </vue-ads-table>
        </material-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { SuiteService } from 'suite-service'
  import { mapState } from 'vuex'
  import Dot from "@/components/cylc/Dot"

  const suiteService = new SuiteService();

  export default {
    components: {
      taskDot: Dot
    },
    metaInfo() {
      return {
        title: 'Cylc UI | Dot View (' + this.$route.params.name + ')'
      }
    },
    data: () => ({
      columns: [
        {
          property: 'name',
          title: 'Task Name',
          direction: null,
          filterable: true,
        },
        {
          property: 'cyclePoint',
          title: 'Cycle Point',
          direction: null,
          filterable: true,
        },
        {
          property: 'state',
          title: 'Task State',
          direction: null,
          filterable: true,
        },
      ],
      classes: {
        table: "v-table",
      },
      filter: '',
      start: 0,
      end: 100,
      polling: null,
    }),
    methods: {
      filterChanged (filter) {
        this.filter = filter;
      },
      fetchSuite() {
        const suiteId = this.$route.params.name
        suiteService.fetchSuiteTree(suiteId)
        this.polling = setInterval(() => {
          suiteService.currentTaskIndex += 1
          suiteService.fetchSuiteTree(suiteId)
        }, 3000)
      },
    },
    beforeDestroy() {
      clearInterval(this.polling)
      this.$store.dispatch('suites/setTree', [])
    },
    computed: {
      ...mapState('suites', ['tasks', 'tree']),
      ...mapState(['isLoading']),
    },
    mounted: function () {
      this.fetchSuite()
    },
  }
</script>
