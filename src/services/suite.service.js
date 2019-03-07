import Alert from '@/model/Alert.model'
import { createApolloClient } from '@/utils/graphql'
import axios from 'axios';
import gql from 'graphql-tag'
import store from '@/store/'
import Suite from '@/model/Suite.model';

// query to retrieve all suites
const tasksQuery = gql`query {
  tasks {
    id, name, meanElapsedTime, namespace, depth
  }
}
`;

export const SuiteService = {
  createGraphqlClient(host, port) {
    return createApolloClient(`http://${host}:${port}/graphql`);
  },
  getSuites() {
    return store.dispatch('suites/setSuites', []).then(() => {
      return axios.get(window.location.pathname + '/suites').then((response) => {
        const suites = [];
        for (let i = 0; i < response.data.length; i++) {
          const entry = response.data[i];
          suites.push(new Suite(entry.name, entry.user, entry.host, entry.port));
        }
        return store.dispatch('suites/setSuites', suites);
      }).catch((error) => {
        const alert = new Alert(error.response.statusText, null, 'error');
        return store.dispatch('addAlert', alert);
      });
    });
  },
  getSuiteTasks(suite) {
    const apolloClient =  this.createGraphqlClient(suite.host, suite.port);
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
