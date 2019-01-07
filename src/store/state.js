// https://vuex.vuejs.org/en/state.html

export default {
  packageJson: JSON.parse(unescape(process.env.PACKAGE_JSON || '%7B%7D'))
}
