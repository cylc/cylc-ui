const state = {
  suites: [],
  tasks: []
};

const mutations = {
  SET_SUITES(state, suites) {
    state.suites = suites;
  },
  SET_TASKS(state, tasks) {
    state.tasks = tasks;
  }
};

const actions = {
  setSuites({commit}, suites) {
    commit('SET_SUITES', suites);
  },
  setTasks({commit}, tasks) {
    commit('SET_TASKS', tasks);
  }
};

const getters = {
  suites: (state) => {
    return state.suites
  },
  tasks: (state) => {
    return state.tasks
  }
};

export const suites = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
