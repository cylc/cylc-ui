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

// Actions
const actions = {}

// Getters
const getters = {
  appVersion: (state) => {
    return state.packageJson.version
  }
}

// Mutations
const mutations = {}

// State
const state = {
  packageJson: JSON.parse(unescape(process.env.PACKAGE_JSON || '%7B%7D'))
}

Vue.use(Vuex)

// Create a new store
const store = new Vuex.Store({
  modules: {
    app,
    suites
  },
  actions,
  getters,
  mutations,
  state
})

export default store
