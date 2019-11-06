import { convertGraphQLWorkflowToTree } from '@/components/cylc/tree/index'

const state = {
  workflows: [],
  workflowTree: []
}

const mutations = {
  SET (state, data) {
    // TODO: when subscriptions are introduced this will have to apply
    // deltas to the store
    state.workflows = data
  },
  SET_WORKFLOW_TREE (state, workflowTree) {
    state.workflowTree = workflowTree
  }
}

const actions = {
  set ({ commit }, data) {
    if (data && Array.isArray(data) && data.length > 0) {
      const workflow = data[0]
      if (Object.hasOwnProperty.call(workflow, 'familyProxies')) {
        commit('SET_WORKFLOW_TREE', convertGraphQLWorkflowToTree(data[0]))
      }
    }
    commit('SET', data)
  }
}

export const workflows = {
  namespaced: true,
  state,
  mutations,
  actions
}
