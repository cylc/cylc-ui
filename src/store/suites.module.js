import {SuiteService} from '@/services/suite.service'

const state = {
  suites: []
};

const actions = {
  async fetchSuites({commit}) {
    commit('SET_LOADING', true, {root: true});
    return SuiteService.getSuites().then((suites) => {
      commit('SET_SUITES', suites);
      commit('SET_LOADING', false, {root: true})
    });
  }
};

const mutations = {
  SET_SUITES(state, suites) {
    state.suites = suites;
  }
};

export const suites = {
  namespaced: true,
  state,
  actions,
  mutations
};
