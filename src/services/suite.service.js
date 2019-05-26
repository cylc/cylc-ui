import Alert from '@/model/Alert.model'
import { createApolloClient } from '@/utils/graphql'
import gql from 'graphql-tag'
import store from '@/store/'

// query to retrieve all suites
const suitesQuery = gql`query {
  workflows {
    id, name, owner, host, port
  }
}
`;

// query to retrieve all suites
const tasksQuery = gql`query {
  tasks {
    id, name, meanElapsedTime, namespace, depth
  }
}
`;

export const SuiteService = {
  createGraphqlClient() {
    return createApolloClient(`${window.location.pathname}/graphql`);
  },
  getSuites() {
    const apolloClient =  this.createGraphqlClient();
    return apolloClient.query({
      query: suitesQuery
    }).then((response) => {
      const suites = response.data.workflows;
      return store.dispatch('suites/setSuites', suites);
    }).catch((error) => {
      const alert = new Alert(error.message, null, 'error');
      return store.dispatch('addAlert', alert);
    });
  },
  getSuiteTasks() {
    const apolloClient =  this.createGraphqlClient();
    return apolloClient.query({
      query: tasksQuery
    }).then((response) => {
      const tasks = response.data.tasks;
      return store.dispatch('suites/setTasks', tasks);
    }).catch((error) => { // error is an ApolloError object
      const alert = new Alert(error.message, null, 'error');
      return store.dispatch('addAlert', alert);
    });
  }
};
