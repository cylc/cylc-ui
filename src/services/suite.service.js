import Alert from '@/model/Alert.model'
import { createApolloClient } from '@/utils/graphql'
import gql from 'graphql-tag'
import store from '@/store/'

// query to retrieve all suites
const suitesQuery = gql`{
    workflows {
        id
        name
        owner
        host
        port
    }
}
`;

// query to retrieve all suites
const tasksQuery = gql`fragment treeNest on FamilyProxy {
  name
  cyclePoint
  state
  depth
  childTasks(ids: $nIds, states: $nStates, mindepth: $minDepth, maxdepth: $maxDepth) {
    id
    task {
      name
    }
    state
    latestMessage
    depth
    jobs {
      id
      host
      batchSysName
      batchSysJobId
      submittedTime
      startedTime
      finishedTime
      submitNum
    }
  }
}
query tree($wIds: [ID], $nIds: [ID], $nStates: [String], $minDepth: Int, $maxDepth: Int) {
  workflows(ids: $wIds) {
    id
    name
    status
    stateTotals {
      runahead
      waiting
      held
      queued
      expired
      ready
      submitFailed
      submitRetrying
      submitted
      retrying
      running
      failed
      succeeded
    }
    treeDepth
  }
  familyProxies(workflows: $wIds, ids: ["root"]) {
    ...treeNest
    childFamilies(mindepth: $minDepth, maxdepth: $maxDepth) {
      ...treeNest
      childFamilies(mindepth: $minDepth, maxdepth: $maxDepth) {
        ...treeNest
        childFamilies(mindepth: $minDepth, maxdepth: $maxDepth) {
          ...treeNest
          childFamilies(mindepth: $minDepth, maxdepth: $maxDepth) {
            ...treeNest
          }
        }
      }
    }
  }
}
`;

export class SuiteService {

  constructor() {
    this.apolloClient = this.createGraphqlClient()
  }

  createGraphqlClient() {
    return createApolloClient(`${window.location.pathname}/graphql`);
  }

  getSuites() {
    return this.apolloClient.query({
      query: suitesQuery,
      fetchPolicy: 'no-cache'
    }).then((response) => {
      const suites = response.data.workflows;
      return store.dispatch('suites/setSuites', suites);
    }).catch((error) => {
      const alert = new Alert(error.message, null, 'error');
      return store.dispatch('addAlert', alert);
    })
  }

  getSuiteTasks(suiteId) {
    return this.apolloClient.query({
      query: tasksQuery,
      variables: {
        wIds: [suiteId],
        minDepth: 0,
        maxDepth: 4
      },
      fetchPolicy: 'no-cache'
    }).then((response) => {
      const tasks = response.data.tasks;
      return store.dispatch('suites/setTasks', tasks);
    }).catch((error) => { // error is an ApolloError object
      const alert = new Alert(error.message, null, 'error');
      return store.dispatch('addAlert', alert);
    })
  }

  fetchSuiteTree(suiteId) {
    return this.apolloClient.query({
      query: tasksQuery,
      variables: {
        wIds: [suiteId],
        minDepth: 0,
        maxDepth: 4
      },
      fetchPolicy: 'no-cache'
    }).then((response) => {
      const tasks = response.data.familyProxies;
      return store.dispatch('suites/setTree', tasks);
    }).catch((error) => { // error is an ApolloError object
      const alert = new Alert(error.message, null, 'error');
      return store.dispatch('addAlert', alert);
    });
  }
}
