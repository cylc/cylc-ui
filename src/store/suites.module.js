const state = {
  suites: [],
  tasks: [],
  tree: []
};

const mutations = {
  SET_SUITES(state, suites) {
    state.suites = suites;
  },
  SET_TASKS(state, tasks) {
    state.tasks = tasks;
  },
  SET_TREE(state, tree) {
    state.tree = tree;
  }
};

const actions = {
  setSuites({commit}, suites) {
    commit('SET_SUITES', suites);
  },
  setTasks({commit}, tasks) {
    commit('SET_TASKS', tasks);
  },
  setTree({commit}, tree) {
    commit('SET_TREE', tree);
  }
};

const getters = {
  suites: (state) => {
    return state.suites
  },
  tasks: (state) => {
    return state.tasks
  },
  tree: (state) => {
    return state.tree
  }
};

export const suites = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
