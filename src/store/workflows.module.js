const state = {
  workflows: [],
  workflow: null
}

const mutations = {
  SET (state, data) {
    // TODO: when subscriptions are introduced this will have to apply
    // deltas to the store
    state.workflows = data
  },
  SET_WORKFLOW (state, { workflow }) {
    state.workflow = workflow
  }
}

const actions = {
  set ({ commit }, data) {
    commit('SET', data)
  },
  setWorkflow ({ state, commit }, { workflowName }) {
    if (workflowName === null) {
      commit('SET_WORKFLOW', { workflow: null })
      return
    }
    for (const workflow of state.workflows) {
      // TODO: simplify once we have decided on workflow name vs. workflow id
      if (workflow.name === workflowName || workflow.id === workflowName) {
        commit('SET_WORKFLOW', { workflow })
      }
    }
  }
}

export const workflows = {
  namespaced: true,
  state,
  mutations,
  actions
}
