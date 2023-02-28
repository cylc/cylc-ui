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

import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VDataTable } from 'vuetify/labs/VDataTable'
import colors from 'vuetify/lib/util/colors'
import { mdiClose } from '@mdi/js'

const inputDefaults = Object.fromEntries([
  components.VAutocomplete,
  components.VCombobox,
  components.VSelect,
  components.VTextarea,
  components.VTextField
].map(({ name }) => [
  name,
  {
    density: 'compact',
    variant: 'outlined',
    clearIcon: mdiClose
  }
]))

export default createVuetify({
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
  // TODO: this should be taken care of by a loader or something:
  components: {
    ...components,
    VDataTable
  },
  directives,
  defaults: {
    ...inputDefaults
  }
})
