export const state = {
  user: null
}

export const mutations = {
  SET_USER (state, user) {
    state.user = user
  }
}

export const actions = {
  setUser ({ commit }, user) {
    commit('SET_USER', user)
  }
}

const getters = {
  user: (state) => {
    return state.user
  }
}

export const user = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
