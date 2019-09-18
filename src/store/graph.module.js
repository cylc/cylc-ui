/* jshint esversion: 6, asi: true */
import Vue from 'vue'

const state = {
  socket: {
    isConnected: false,
    message: '',
    reconnectError: false
  },
  message: {
    gData: ''
  }
}

const mutations = {
  SOCKET_ONOPEN (state, event) {
    state.socket.isConnected = true
  },
  SOCKET_ONCLOSE (state, event) {
    state.socket.isConnected = false
  },
  SOCKET_ONERROR (state, event) {
    console.error(state, event)
  },
  // default handler called for all methods
  SOCKET_ONMESSAGE (state, message) {
    console.log('message in graph service', message)
    state.message = message
  },
  // mutations for reconnect methods
  SOCKET_RECONNECT (state, count) {
    console.info(state, count)
  },
  SOCKET_RECONNECT_ERROR (state) {
    state.socket.reconnectError = true
  }
}

const actions = {
  sendMessage: function (context, message) {
    console.log('GRAPH MODULE MESSAGE : ', message)
    Vue.prototype.$socket.send(message)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
