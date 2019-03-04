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
    commit('SET_LOADING', true, {root: true});
    commit('SET_SUITES', suites);
    commit('SET_LOADING', false, {root: true})
  }
};


export const suites = {
  namespaced: true,
  state,
  actions,
  mutations
};
