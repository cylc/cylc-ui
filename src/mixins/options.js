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

import Vue from 'vue'

/**
 * A mixin which provides a pattern for setting and storing options.
 *
 Options stored here will be preserved when the tab layout is restored.
 */
export default {
  // options can be passed in using the initialOptions prop
  // e.g. initialOptions = { color: 'blue' }
  props: {
    initialOptions: {
      type: Object,
      required: false,
      default: () => {}
    }
  },

  // defaults can be hardcoded by adding a "defaults" item
  // e.g. defaults = { color: 'red' }
  defaults: {},

  // options are stored as data.options
  data () {
    return {
      options: {}
    }
  },

  // this lifecycle method auto-populates this.options when the component
  // is loaded
  created () {
    for (const [key, value] of Object.entries({ ...this.$options.defaults, ...this.initialOptions })) {
      Vue.set(this.$data.options, key, value)
    }
  }
}
