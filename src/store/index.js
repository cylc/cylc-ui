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
import {app} from './app.module'
import {suites} from './suites.module'
import {user} from './user.module'

// State
const state = {
  packageJson: JSON.parse(unescape(process.env.PACKAGE_JSON || '%7B%7D')),
  isLoading: false,
  refCount: 0,
  alert: null
};

// Actions
const actions = {
  setLoading({commit}, isLoading) {
    commit('SET_LOADING', isLoading);
  },
  setAlert({state, commit}, alert) {
    if (alert === null || state.alert === null || state.alert.getText() !== alert.getText()) {
      commit('SET_ALERT', alert);
    }
  }
};

// Mutations
const mutations = {
  SET_LOADING(state, isLoading) {
    if (isLoading) {
      state.refCount++;
      state.isLoading = isLoading
    } else if (state.refCount > 0) {
      state.refCount--;
      state.isLoading = (state.refCount > 0)
    }
  },
  SET_ALERT(state, alert) {
    state.alert = alert
  }
};

// Getters
const getters = {
  appVersion: (state) => {
    return state.packageJson.version
  }
};

Vue.use(Vuex);

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
});

export default store
