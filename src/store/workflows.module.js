// raw GraphQL response data structure
const state = {
  workflows: []
}

const mutations = {
  SET (state, data) {
    // TODO: when subscriptions are introduced this will have to apply
    // deltas to the store
    state.workflows = data
  }
}

const actions = {
  set ({ commit }, data) {
    commit('SET', data)
  }
}

export const workflows = {
  namespaced: true,
  state,
  mutations,
  actions
}
