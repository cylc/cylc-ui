// https://vuex.vuejs.org/en/getters.html

export default {
  appVersion: (state) => {
    return state.packageJson.version
  }
}
