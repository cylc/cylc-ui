import { convertGraphQLWorkflowToTree } from '@/components/cylc/tree'

const state = {
  workflows: [],
  workflowName: null
}

const getters = {
  currentWorkflow: state => {
    if (state.workflowName === null) {
      return null
    }
    return state.workflows.find(workflow => workflow.name === state.workflowName) || null
  },
  workflowTree: (state, getters) => {
    return convertGraphQLWorkflowToTree(getters.currentWorkflow)
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
