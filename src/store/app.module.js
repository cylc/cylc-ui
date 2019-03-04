import { set, toggle } from '@/utils/vuex'

const state = {
  drawer: null,
  color: 'success'
};

const mutations = {
  setDrawer: set('drawer'),
  setImage: set('image'),
  setColor: set('color'),
  toggleDrawer: toggle('drawer')
};

const actions = {};

export const app = {
  namespaced: true,
  state,
  actions,
  mutations
};
