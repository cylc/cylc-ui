import { convertGraphQLWorkflowToTree } from '@/components/cylc/tree'

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
  },
  workflowTree: (state, getters) => {
    if (getters.currentWorkflow !== null && Object.hasOwnProperty.call(getters.currentWorkflow, 'familyProxies')) {
      try {
        return [convertGraphQLWorkflowToTree(getters.currentWorkflow)]
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    }
    return []
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
