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
  <v-container class="c-user-profile">
    <v-row class="wrap">
      <v-col cols="12">
        <v-alert
          :icon="svgPaths.settings"
          prominent
          color="grey lighten-3"
        >
          <h3 class="headline">{{ $t('UserProfile.tableHeader') }}</h3>
          <p class="body-1">{{ $t('UserProfile.tableSubHeader') }}</p>
        </v-alert>
        <v-form v-if="user !== null">
          <v-container py-0>
            <v-row no-gutters class="align-center wrap">
              <v-col cols="3">
                <span>{{ $t('UserProfile.username') }}</span>
              </v-col>
              <v-col cols="9">
                <v-text-field
                    :value="user.username"
                    disabled
                    id="profile-username"
                    aria-disabled="true"
                    class="body-1"
                />
              </v-col>
            </v-row>

            <v-row no-gutters class="align-center wrap">
              <v-col cols="3">
                <span>{{ $t('UserProfile.administrator') }}</span>
              </v-col>
              <v-col cols="9">
                <v-checkbox
                    v-model="user.admin"
                    disabled
                    id="profile-admin"
                    aria-disabled="true"
                    class="body-1"
                />
              </v-col>
            </v-row>

            <v-row no-gutters class="align-center wrap">
              <v-col cols="3">
                <span>{{ $t('UserProfile.groups') }}</span>
              </v-col>
              <v-col cols="9">
                <v-select
                    :items="user.groups"
                    v-model="user.groups"
                    attach
                    multiple
                    disabled
                    id="profile-groups"
                    aria-disabled="true"
                    class="body-1"
                />
              </v-col>
            </v-row>

            <v-row no-gutters class="align-center wrap">
              <v-col cols="3">
                <span>{{ $t('UserProfile.created') }}</span>
              </v-col>
              <v-col cols="9">
                <v-text-field
                    :value="user.created"
                    disabled
                    id="profile-created"
                    aria-disabled="true"
                    class="body-1"
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
                    attach
                    multiple
                    disabled
                    id="profile-permissions"
                    aria-disabled="true"
                    class="body-1"
                />
              </v-col>
            </v-row>
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <p class="title">Preferences</p>
              </v-col>
            </v-row>

            <v-row no-gutters class="align-center wrap">
              <v-col cols="3">
                <span>Font size</span>
              </v-col>
              <v-col cols="9">
                <v-btn
                  depressed
                  id="font-size-reset-button"
                  class="mr-2"
                  @click="resetFontSize()">
                  Reset
                </v-btn>
                <v-btn
                  depressed
                  id="font-size-decrease-button"
                  class="mx-2"
                  @click="decreaseFontSize()">
                  <v-icon>{{ svgPaths.decrease }}</v-icon>
                </v-btn>
                <v-btn
                  depressed
                  id="font-size-increase-button"
                  class="ml-2"
                  @click="increaseFontSize()">
                  <v-icon>{{ svgPaths.increase }}</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-row no-gutters class="align-center wrap">
              <v-col cols="3">
                <span>Colour Theme</span>
              </v-col>
              <v-radio-group v-model="jobTheme" column>
                <table class="c-job-state-table">
                  <tr>
                    <th>State</th>
                    <th
                      v-for="theme in jobThemes"
                      :key="theme"
                    >
                      {{theme}}
                    </th>
                  </tr>
                  <tr
                  >
                    <td></td>
                    <td
                      v-for="theme in jobThemes"
                      :key="theme"
                    >
                      <v-radio
                        :value="theme"
                        :id="`input-job-theme-${theme}`"
                      />
                    </td>
                  </tr>
                  <tr
                    v-for="state in jobStates"
                    :key="state"
                  >
                    <td>{{state}}</td>
                    <td
                      v-for="theme in jobThemes"
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
              >
              </v-checkbox>
            </v-row>

            <v-row no-gutters class="align-center wrap">
              <v-col cols="3">
                <span>Table default view</span>
              </v-col>
              <v-checkbox
                v-model="tableDefaultView"
                id="table-default-view"
              >
              </v-checkbox>
            </v-row>
          </v-container>
        </v-form>
        <v-progress-linear v-else :indeterminate="true" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import pageMixin from '@/mixins'
import { decreaseFontSize, getCurrentFontSize, increaseFontSize, resetFontSize } from '@/utils/font-size'
import { mdiCog, mdiFormatFontSizeDecrease, mdiFormatFontSizeIncrease } from '@mdi/js'
import Job from '@/components/cylc/Job'
import JobState from '@/model/JobState.model'
import subscriptionViewMixin from '@/mixins/subscriptionView'

// TODO: update where user preferences are stored after #335

export default {
  name: 'UserProfile',
  mixins: [
    pageMixin,
    subscriptionViewMixin
  ],
  components: {
    Job
  },
  data () {
    return {
      tableDefaultView: false,
      cyclePointsOrderDesc: true, // default
      svgPaths: {
        settings: mdiCog,
        increase: mdiFormatFontSizeIncrease,
        decrease: mdiFormatFontSizeDecrease
      },
      jobStates: JobState.enumValues.map(state => state.name),
      jobThemes: [
        'default',
        'greyscale',
        'colour_blind'
      ],
      jobTheme: localStorage.jobTheme || 'default'
    }
  },
  computed: {
    ...mapState('user', ['user'])
  },
  metaInfo () {
    return {
      title: this.getPageTitle('App.userProfile')
    }
  },
  mounted () {
    if (localStorage.cyclePointsOrderDesc) {
      this.cyclePointsOrderDesc = JSON.parse(localStorage.cyclePointsOrderDesc)
    }
    this.tableDefaultView = typeof localStorage.tableDefaultView !== 'undefined' ? JSON.parse(localStorage.tableDefaultView) : this.tableDefaultView
  },
  methods: {
    resetFontSize,
    decreaseFontSize,
    increaseFontSize,
    getCurrentFontSize,
    ...mapMutations('app', ['setJobTheme'])
  },
  watch: {
    jobTheme: function (theme) {
      this.setJobTheme(theme)
    },
    cyclePointsOrderDesc (newOrder) {
      localStorage.setItem('cyclePointsOrderDesc', newOrder)
      this.cyclePointsOrderDesc = newOrder
    },
    tableDefaultView (newPreference) {
      localStorage.setItem('tableDefaultView', newPreference)
      this.tableDefaultView = newPreference
    }
  }
}
</script>
