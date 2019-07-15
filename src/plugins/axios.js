import Vue from 'vue'
import store from '@/store/'

// Lib imports
import axios from 'axios'

axios.interceptors.request.use(function (config) {
  store.dispatch('setLoading', true)
  return config
}, function (error) {
  return Promise.reject(error)
})

axios.interceptors.response.use(function (response) {
  store.dispatch('setLoading', false)
  return response
}, function (error) {
  store.dispatch('setLoading', false)
  return Promise.reject(error)
})

Vue.prototype.$http = axios
