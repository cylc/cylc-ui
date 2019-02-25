import {set} from '@/utils/vuex'
import User from '@/model/User.model'

export const state = {
  user: new User({
    name: 'kinow',
    groups: ['admin', 'wheel'],
    created: 'now?',
    admin: true
  })
};

export const mutations = {
  setUser: set('user')
};

export const user = {
  namespaced: true,
  state,
  mutations
};
