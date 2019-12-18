const state = {
  workflows: [],
  workflowName: null
}

const getters = {
  currentWorkflow: state => {
    if (state.workflowName !== null) {
      for (const workflow of state.workflows) {
        if (state.workflowName === workflow.name) {
          return workflow
        }
      }
    }
    return null
  }
}

const mutations = {
  SET (state, data) {
    // TODO: when subscriptions are introduced this will have to apply
    // deltas to the store
    state.workflows = data
  },
  SET_WORKFLOW_NAME (state, { workflowName }) {
    state.workflowName = workflowName
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
  getters,
  mutations,
  actions
}
