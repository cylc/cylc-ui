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
import { workflows } from './workflows.module'
import { user } from './user.module'

// State
const state = {
  packageJson: JSON.parse(unescape(process.env.PACKAGE_JSON || '%7B%7D')),
  environment: process.env.NODE_ENV.toUpperCase(),
  isLoading: false,
  refCount: 0,
  alert: null
}

// Actions
const actions = {
  setLoading ({ commit }, isLoading) {
    commit('SET_LOADING', isLoading)
  },
  setAlert ({ state, commit }, alert) {
    // log to console when the alert is not null (null can mean to remove the alert)
    if (alert !== null) {
      console.log(alert)
    }
    if (alert === null || state.alert === null || state.alert.getText() !== alert.getText()) {
      commit('SET_ALERT', alert)
    }
  }
}

// Mutations
const mutations = {
  SET_LOADING (state, isLoading) {
    if (isLoading) {
      state.refCount++
      state.isLoading = isLoading
    } else if (state.refCount > 0) {
      state.refCount--
      state.isLoading = (state.refCount > 0)
    }
  },
  SET_ALERT (state, alert) {
    state.alert = alert
  }
}

Vue.use(Vuex)

// Create a new store
const store = new Vuex.Store({
  modules: {
    app,
    workflows,
    user
  },
  actions,
  mutations,
  state
})

export default store
