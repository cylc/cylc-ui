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

import { computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useStore } from 'vuex'

/** Height in px */
export const toolbarHeight = 48

/**
 * Composable that returns a computed property for whether we should show
 * the hamburger nav drawer button.
 */
export function useNavBtn () {
  const { mobile } = useDisplay()
  const store = useStore()
  return {
    showNavBtn: computed(() => mobile.value || !store.state.app.drawer),
  }
}

/**
 * Composable that replaces the old toolbar mixin.
 *
 * Main responsibility is to add responsive toggle
 * to a Toolbar component. Shared between (at least) the Cylc
 * UI default Toolbar, and the Workflow view Toolbar.
 */
export function useToolbar () {
  const store = useStore()
  const { showNavBtn } = useNavBtn()

  onMounted(() => {
    store.commit('app/setDrawer', !showNavBtn.value)
  })

  const toggleDrawer = () => {
    store.commit('app/setDrawer', !store.state.app.drawer)
  }

  return {
    showNavBtn,
    toggleDrawer,
  }
}
