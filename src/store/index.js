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
  alerts: []
};

// Actions
const actions = {
  setLoading({commit}, isLoading) {
    commit('SET_LOADING', isLoading);
  },
  addAlert({commit}, alert) {
    commit('ADD_ALERT', alert);
  },
  removeAlert({commit}, alertText) {
    commit('REMOVE_ALERT', alertText);
  },
  clearAlerts({commit}) {
    commit('CLEAR_ALERTS');
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
  ADD_ALERT(state, alert) {
    state.alerts.push(alert);
  },
  REMOVE_ALERT(state, alertText) {
    for (var i = 0; i < state.alerts.length; i++) {
      if (state.alerts[i].text === alertText) {
        state.alerts.splice(i, 1);
        break;
      }
    }
  },
  CLEAR_ALERTS(state) {
    state.alerts = []
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
