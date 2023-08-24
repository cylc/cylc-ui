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

import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { VAutocomplete } from 'vuetify/components/VAutocomplete'
import { VCombobox } from 'vuetify/components/VCombobox'
import { VSelect } from 'vuetify/components/VSelect'
import { VTextarea } from 'vuetify/components/VTextarea'
import { VTextField } from 'vuetify/components/VTextField'
import { VDataTable, VDataTableFooter } from 'vuetify/labs/VDataTable'
import colors from 'vuetify/lib/util/colors'
import { mdiClose } from '@mdi/js'

const inputDefaults = Object.fromEntries([
  VAutocomplete,
  VCombobox,
  VSelect,
  VTextarea,
  VTextField
].map(({ name }) => [
  name,
  {
    density: 'compact',
    variant: 'outlined',
    clearIcon: mdiClose,
    hideDetails: true,
  }
]))

/**
 * @type {import('vuetify').VuetifyOptions}
 */
export const vuetifyOptions = {
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: colors.lightBlue.accent4,
          'primary-darken-1': colors.lightBlue.darken4,
          secondary: colors.teal.accent4,
          'secondary-darken-1': colors.teal.darken3
        }
      }
    }
  },
  display: {
    mobileBreakpoint: 991
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  components: {
    VDataTable,
    VDataTableFooter
  },
  defaults: {
    global: {
      // Gets set from user profile reduced animation setting:
      transition: null,
      ripple: null,
    },
    VTooltip: {
      activator: 'parent',
      location: 'bottom',
    },
    ...inputDefaults
  },
}
