const state = {
  suites: []
};

const mutations = {
  SET_SUITES(state, suites) {
    state.suites = suites;
  }
};

const actions = {
  setSuites({commit}, suites) {
    commit('SET_SUITES', suites);
  }
};

const getters = {
  suites: (state) => {
    return state.suites
  }
};

export const suites = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
