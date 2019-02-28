import apolloClient from '@/utils/graphql'
import gql from 'graphql-tag'

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
    const response = await apolloClient.query({
      query: suitesQuery
    });
    return response.data.allSpeakers;
  }
};
