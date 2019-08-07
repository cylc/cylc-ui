import i18n from '@/i18n'

/**
 * Here we can define the operations that are common to components/views.
 * @type {{methods: {setPageTitle(*=, *=): string}}}
 */

const mixin = {
  /**
   * Automatically created methods for components.
   */
  methods: {
    /**
     * i18n-enabled operation, to get the title respecting the locale used
     * in the application settings.
     * @param key {string} i18n key
     * @param params {object} optional object key=value used in the i18n message
     * @returns {string}
     */
    getPageTitle: function (key, params = {}) {
      return `${i18n.t('App.name')} | ${i18n.t(key, params)}`
    }
  }
}

export {
  mixin
}
