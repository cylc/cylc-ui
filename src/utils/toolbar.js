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

import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'

/** Height in px */
export const toolbarHeight = 48

/** Global state of navigation drawer visibility */
const drawer = ref(false)

function toggleDrawer () {
  drawer.value = !drawer.value
}

/** Composable that provides the global state of the navigation drawer visibility. */
export function useDrawer () {
  return {
    drawer,
    toggleDrawer,
  }
}

/**
 * Composable that returns a computed property for whether we should show
 * the hamburger nav drawer button.
 */
export function useNavBtn () {
  const { mobile } = useDisplay()
  return {
    showNavBtn: computed(() => mobile.value || !drawer.value),
  }
}
