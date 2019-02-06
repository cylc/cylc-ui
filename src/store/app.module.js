import { set, toggle } from '@/utils/vuex'

const state = {
  drawer: null,
  color: 'success'
}

const actions = {}

const mutations = {
  setDrawer: set('drawer'),
  setImage: set('image'),
  setColor: set('color'),
  toggleDrawer: toggle('drawer')
}

export const app = {
  namespaced: true,
  state,
  actions,
  mutations
}
