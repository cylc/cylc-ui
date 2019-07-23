import Settings from '@/model/Settings.model'

export const state = {
  user: null,
  settings: new Settings(),
  // TODO: These properties need be moved and loaded dynamically once we have server-side user-settings
  applicationThemes: [
    'default'
  ],
  jobStatesThemes: [
    'default'
  ],
  languages: [
    'en-GB',
    'pt-BR'
  ]
}

export const mutations = {
  SET_USER (state, user) {
    state.user = user
  },
  SET_SETTINGS (state, settings) {
    state.settings = settings
  }
}

export const actions = {
  setUser ({ commit }, user) {
    commit('SET_USER', user)
  },
  setSettings ({ commit }, settings) {
    commit('SET_SETTINGS', settings)
  }
}

const getters = {
  user: (state) => {
    return state.user
  }
}

export const user = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
