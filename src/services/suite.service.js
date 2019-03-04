import apolloClient from '@/utils/graphql'
import gql from 'graphql-tag'
import store from '@/store/'

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
  async getSuites() {
    // TODO: move setLoading to interceptors/chain filters
    //store.dispach('setLoading', true).then(() => {});
    const response = await apolloClient.query({
      query: suitesQuery
    });
    //store.dispach('setLoading', false);
    const suites = response.data.allSpeakers;
    return store.dispatch('suites/setSuites', suites);
  }
};
