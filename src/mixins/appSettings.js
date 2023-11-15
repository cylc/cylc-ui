/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { useReducedAnimation } from '@/composables/localStorage'

export default {
  methods: {
    /**
     * Enable/disable reduced animations mode in the app.
     *
     * @param {boolean} value
     */
    setReducedAnimation (value) {
      useReducedAnimation().value = value
      for (const property of ['transition', 'ripple']) {
        // TODO: can use useDefaults() composable when we upgrade to Vuetify 3.2+
        // and convert this mixin into a composable -
        // https://github.com/cylc/cylc-ui/issues/1551
        this.$vuetify.defaults.global[property] = value ? false : null
      }
    }
  }
}
