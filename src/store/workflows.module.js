// raw GraphQL response data structure
const state = {
    workflows: []
};

const mutations = {
    SET(state, data) {
        // TODO: when subscriptions are introduced this will have to apply
        // deltas to the store
        console.log('#', data)
        state.workflows = data;
    }
};

const actions = {
    set({commit}, data) {
        commit('SET', data)
    }
};

const getters = {
    workflows: (state) => {
        console.log('$', state.workflows)
        return state.workflows;
    }
};

export const workflows = {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
