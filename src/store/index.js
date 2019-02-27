/**
 * Vuex
 *
 * @library
 *
 * https://vuex.vuejs.org/en/
 */

// Lib imports
import Vue from 'vue'
import Vuex from 'vuex'
// Modules
import { app } from './app.module'
import { suites } from './suites.module'
import { user } from './user.module'

// Actions
const actions = {}

// Getters
const getters = {
  appVersion: (state) => {
    return state.packageJson.version
  }
}

// Mutations
const mutations = {
  SET_LOADING(state, isLoading) {
    if (isLoading) {
      state.refCount++
      state.isLoading = isLoading
    } else if (state.refCount > 0) {
      state.refCount--
      state.isLoading = (state.refCount > 0)
    }
  }
}

// State
const state = {
  packageJson: JSON.parse(unescape(process.env.PACKAGE_JSON || '%7B%7D')),
  isLoading: false,
  refCount: 0
}

Vue.use(Vuex)

// Create a new store
const store = new Vuex.Store({
  modules: {
    app,
    suites,
    user
  },
  actions,
  getters,
  mutations,
  state
})

export default store
