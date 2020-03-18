const state = {
  drawer: null,
  color: 'success',
  title: null
}

const mutations = {
  setDrawer (state, drawer) {
    state.drawer = drawer
  },
  setColor (state, color) {
    state.color = color
  },
  toggleDrawer (state) {
    state.drawer = !state.drawer
  },
  setTitle (state, title) {
    state.title = title
  }
}

export const app = {
  namespaced: true,
  state,
  mutations
}
