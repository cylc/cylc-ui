import BoxPlot from '@/components/cylc/analysis/BoxPlot.vue'

describe('BoxPlot', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.vmount(BoxPlot, {
      props: {
        configOptions: {
          itemsPerPage: 20,
          page: 1,
          sortBy: 'name',
          sortDesc: false
        },
        timingOption: 'totalTimes',
        workflowName: 'Test_workflow_name',
        tasks: [
          {
            name: 'a_test_task',
            platform: 'localhost',
            count: 5,
            meanTotalTime: 90,
            stdDevTotalTime: 15,
            minTotalTime: 68,
            totalQuartiles: [78, 97, 101],
            maxTotalTime: 110,
            meanRunTime: 89,
            stdDevRunTime: 15,
            minRunTime: 66,
            runQuartiles: [77, 95, 99],
            maxRunTime: 108,
            meanQueueTime: 1,
            stdDevQueueTime: 0,
            minQueueTime: 1,
            queueQuartiles: [2, 2, 2],
            maxQueueTime: 2,
          },
          {
            name: 'another_test_task',
            platform: 'xcf',
            count: 1,
            meanTotalTime: 135,
            stdDevTotalTime: 0.5,
            minTotalTime: 60,
            totalQuartiles: [80, 105, 135],
            maxTotalTime: 145,
            meanRunTime: 105,
            stdDevRunTime: 0.5,
            minRunTime: 60,
            runQuartiles: [80, 105, 135],
            maxRunTime: 145,
            meanQueueTime: 30,
            stdDevQueueTime: 0.5,
            minQueueTime: 60,
            queueQuartiles: [80, 105, 135],
            maxQueueTime: 145,
          },
        ],
      },
    })
    // Make sure the chart is shown
    cy.get('.vue-apexcharts')
      .should('be.visible')
  })
})
