import Alert from '@/model/Alert.model'
import apolloClient from '@/utils/graphql'
import axios from 'axios';
import gql from 'graphql-tag'
import store from '@/store/'
import Suite from '@/model/Suite.model';

// query to retrieve all suites
const suitesQuery = gql`query allSpeakers {
    allSpeakers {
      id
      name
      photo {
        url
      }
    }
}
`;

export const SuiteService = {
  getSuites() {
    store.dispatch('suites/setSuites', []).then(() => {
      return axios.get(window.location.pathname + '/suites').then((response) => {
        const suites = [];
        for (var i = 0; i < response.data.length; i++) {
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
  getSuitesGraphql() {
    return apolloClient.query({
      query: suitesQuery
    }).then((response) => {
      const suites = response.data.allSpeakers;
      return store.dispatch('suites/setSuites', suites);
    }).catch((error) => { // error is an ApolloError object
      const alert = new Alert(error.message, null, 'error');
      return store.dispatch('addAlert', alert);
    });
  }
};
