import Alert from '@/model/Alert.model'
import User from '@/model/User.model'
import Settings from '@/model/Settings.model'
import store from '@/store/index'
import i18n from '@/i18n/index'

export const UserService = {

  /**
   * Fetch the user, and set the value returned in the user store.
   * @returns {Promise<any>}
   */
  getUserProfile () {
    const user = new User('guest', [], new Date().toISOString(), false)
    return store.dispatch('user/setUser', user)
  },

  /**
   * Fetch the settings from the backend (for now using LocalStorage), and set the value returned in the
   * user store.
   * @returns {Promise<any>}
   */
  async fetchSettings () {
    // TODO: move to the backend later (probably?)
    let settings = null
    const localSettings = localStorage.getItem('user/settings')
    if (localSettings) {
      settings = JSON.parse(localSettings)
    } else {
      settings = new Settings()
    }
    i18n.locale = settings.language
    return store.dispatch('user/setSettings', settings)
  },

  /**
   * Save the settings to the backend (for now using LocalStorage). The value saved in the local storage area
   * is actually the object passed through JSON.stringify. So users/developers can also inspect the values
   * from their browsers.
   * @param settings {Object} the settings object
   * @returns {Promise<any>}
   */
  async saveSettings (settings) {
    try {
      await store.dispatch('setLoading', true)
      localStorage.setItem('user/settings', JSON.stringify(settings))
      i18n.locale = settings.language
      await store.dispatch('user/setSettings', settings)
      return store.dispatch('setAlert', new Alert('Settings updated', null, 'success'))
    } catch (error) {
      return store.dispatch('setAlert', new Alert(error.message, null, 'error'))
    } finally {
      await store.dispatch('setLoading', false)
    }
  }
}
