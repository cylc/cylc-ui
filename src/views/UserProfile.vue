<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <v-container fluid class="c-user-profile">
    <v-row class="wrap">
      <v-col cols="12">
        <v-alert
          :icon="$options.icons.settings"
          prominent
          color="grey-lighten-3"
        >
          <h3 class="text-h5">{{ $t('UserProfile.title') }}</h3>
        </v-alert>
        <v-form>
          <v-defaults-provider :defaults="$options.vuetifyDefaults">
            <v-container py-0>
              <v-row no-gutters>
                <h3>{{ $t('UserProfile.yourProfile') }}</h3>
              </v-row>

              <v-row no-gutters class="align-center wrap">
                <v-col cols="3">
                  <span>{{ $t('UserProfile.username') }}</span>
                </v-col>
                <v-col cols="9">
                  <v-text-field
                    :model-value="user.username"
                    disabled
                    id="profile-username"
                    class="text-body-1"
                  />
                </v-col>
              </v-row>

              <v-row
                v-if="user.extensions"
                no-gutters
                class="align-center wrap"
              >
                <v-col cols="3">
                  <span>Jupyter Server Extensions</span>
                </v-col>
                <v-col cols="9">
                  <v-text-field
                    :model-value="Object.keys(user.extensions).join(', ') || 'None'"
                    disabled
                    id="profile-extensions"
                    class="text-body-1"
                  />
                </v-col>
              </v-row>

              <v-row no-gutters class="align-center wrap">
                <v-col cols="3">
                  <span>{{ $t('UserProfile.permissions') }}</span>
                </v-col>
                <v-col cols="9">
                  <v-select
                    :items="user.permissions"
                    v-model="user.permissions"
                    :menu-props="{ attach: true }"
                    multiple
                    disabled
                    chips
                    id="profile-permissions"
                  >
                    <template #chip="{ data }">
                      <v-chip
                        v-bind="data"
                        label
                        size="default"
                      />
                    </template>
                  </v-select>
                </v-col>
              </v-row>

              <v-row no-gutters class="mt-4">
                <h3>Preferences</h3>
              </v-row>

              <v-row no-gutters class="align-center wrap">
                <v-col cols="3">
                  <span>Font size</span>
                </v-col>
                <v-col cols="9">
                  <v-btn
                    variant="outlined"
                    id="font-size-reset-button"
                    class="mr-2"
                    @click="resetFontSize()">
                    Reset
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    id="font-size-decrease-button"
                    class="mx-2"
                    @click="decreaseFontSize()">
                    <v-icon>{{ $options.icons.decrease }}</v-icon>
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    id="font-size-increase-button"
                    class="ml-2"
                    @click="increaseFontSize()">
                    <v-icon>{{ $options.icons.increase }}</v-icon>
                  </v-btn>
                </v-col>
              </v-row>

              <v-row no-gutters class="align-center wrap">
                <v-col cols="3">
                  <span>Colour Theme</span>
                </v-col>
                <v-radio-group
                  v-model="jobTheme"
                >
                  <table class="c-job-state-table">
                    <tr>
                      <th>State</th>
                      <th
                        v-for="theme in $options.jobThemes"
                        :key="theme"
                      >
                        {{ upperFirst(theme.replace('_', ' ')) }}
                      </th>
                    </tr>
                    <tr>
                      <td></td>
                      <td
                        v-for="theme in $options.jobThemes"
                        :key="theme"
                      >
                        <v-radio
                          :value="theme"
                          :id="`input-job-theme-${theme}`"
                        />
                      </td>
                    </tr>
                    <tr
                      v-for="state in $options.jobStates"
                      :key="state"
                    >
                      <td>{{state}}</td>
                      <td
                        v-for="theme in $options.jobThemes"
                        :key="theme"
                        :class="[`job_theme--${theme}`, 'job_theme_override']"
                      >
                        <job :status="state" />
                      </td>
                    </tr>
                  </table>
                </v-radio-group>
                <v-col cols="9">
                </v-col>
              </v-row>

              <v-row no-gutters class="align-center wrap">
                <v-col cols="3">
                  <span>Latest cycle point at top</span>
                </v-col>
                <v-checkbox
                  v-model="cyclePointsOrderDesc"
                  id="input-cyclepoints-order"
                />
              </v-row>

              <v-row no-gutters class="align-center wrap">
                <v-col cols="3">
                  <span>Reduced animations</span>
                </v-col>
                <v-checkbox
                  v-model="reducedAnimation"
                  data-cy="reduced-animation"
                />
              </v-row>

              <v-row no-gutters class="align-center wrap">
                <v-col cols="3">
                  <span>Default view</span>
                </v-col>
                <v-select
                  v-model="defaultView"
                  :items="Array.from(workflowViews.keys())"
                  :prepend-inner-icon="workflowViews.get(defaultView).icon"
                  data-cy="select-default-view"
                  :menu-props="{ 'data-cy': 'select-default-view-menu' }"
                >
                  <template v-slot:item="{ item, props }">
                    <v-list-item
                      v-bind="props"
                      :prepend-icon="workflowViews.get(item.value).icon"
                    />
                  </template>
                </v-select>
              </v-row>
            </v-container>
          </v-defaults-provider>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { mdiCog, mdiFormatFontSizeDecrease, mdiFormatFontSizeIncrease } from '@mdi/js'
import { useCyclePointsOrderDesc, useJobTheme, useReducedAnimation } from '@/composables/localStorage'
import { decreaseFontSize, getCurrentFontSize, increaseFontSize, resetFontSize } from '@/utils/font-size'
import { workflowViews, useDefaultView } from '@/views/views.js'
import Job from '@/components/cylc/Job.vue'
import JobState from '@/model/JobState.model'
import { upperFirst } from 'lodash-es'

// TODO: update where user preferences are stored after #335

export default {
  name: 'UserProfile',

  components: {
    Job
  },

  setup () {
    return {
      defaultView: useDefaultView(),
      cyclePointsOrderDesc: useCyclePointsOrderDesc(),
      jobTheme: useJobTheme(),
      reducedAnimation: useReducedAnimation(),
      upperFirst,
      workflowViews,
    }
  },

  computed: {
    ...mapState('user', ['user']),
  },

  methods: {
    resetFontSize,
    decreaseFontSize,
    increaseFontSize,
    getCurrentFontSize,
  },

  vuetifyDefaults: {
    global: {
      hideDetails: true,
    },
  },

  jobStates: JobState.enumValues.map(state => state.name),

  jobThemes: [
    'default',
    'greyscale',
    'colour_blind'
  ],

  icons: {
    settings: mdiCog,
    increase: mdiFormatFontSizeIncrease,
    decrease: mdiFormatFontSizeDecrease,
  },
}
</script>
