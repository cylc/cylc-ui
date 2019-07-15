import { set, toggle } from '@/utils/vuex'

const state = {
  drawer: null,
  color: 'success',
  title: null
}

const mutations = {
  setDrawer: set('drawer'),
  setImage: set('image'),
  setColor: set('color'),
  toggleDrawer: toggle('drawer'),
  setTitle: set('title')
}

const actions = {}

export const app = {
  namespaced: true,
  state,
  actions,
  mutations
}
