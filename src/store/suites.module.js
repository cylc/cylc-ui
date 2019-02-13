import {set} from '@/utils/vuex'
import gql from 'graphql-tag'

import apolloClient from '@/utils/graphql'

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

const state = {
  suites: []
}

const actions = {
  async fetchSuites({ commit }) {
    const response = await apolloClient.query({
      query: suitesQuery
    })

    commit('setSuites', response.data.allSpeakers)
  }
}

const mutations = {
  setSuites: set('suites')
}

export const suites = {
  namespaced: true,
  state,
  actions,
  mutations
}
