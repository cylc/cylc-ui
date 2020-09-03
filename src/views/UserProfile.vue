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
  <v-container>
    <v-layout wrap>
      <v-flex xs12 md12>
        <v-alert
          prominent
          color="grey lighten-3"
          icon="mdi-cog"
        >
          <h3 class="headline">{{ $t('UserProfile.tableHeader') }}</h3>
          <p class="body-1">{{ $t('UserProfile.tableSubHeader') }}</p>
        </v-alert>
        <v-form v-if="user !== null">
          <v-container py-0>
            <v-layout row align-center wrap>
              <v-flex xs3>
                <span>{{ $t('UserProfile.username') }}</span>
              </v-flex>
              <v-flex xs9>
                <v-text-field
                    :value="user.username"
                    disabled
                    id="profile-username"
                    aria-disabled="true"
                    class="body-1"
                />
              </v-flex>
            </v-layout>
            <v-layout row align-center wrap>
              <v-flex xs3>
                <span>{{ $t('UserProfile.administrator') }}</span>
              </v-flex>
              <v-flex xs9>
                <v-checkbox
                    v-model="user.admin"
                    disabled
                    id="profile-admin"
                    aria-disabled="true"
                    class="body-1"
                />
              </v-flex>
            </v-layout>
            <v-layout row align-center wrap>
              <v-flex xs3>
                <span>{{ $t('UserProfile.groups') }}</span>
              </v-flex>
              <v-flex xs9>
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
              </v-flex>
            </v-layout>
            <v-layout row align-center wrap>
              <v-flex xs3>
                <span>{{ $t('UserProfile.created') }}</span>
              </v-flex>
              <v-flex xs9>
                <v-text-field
                    :value="user.created"
                    disabled
                    id="profile-created"
                    aria-disabled="true"
                    class="body-1"
                />
              </v-flex>
            </v-layout>
            <v-row mt-4>
              <v-flex xs12>
                <p class="title">Preferences</p>
              </v-flex>
            </v-row>
            <v-layout row align-center wrap>
              <v-flex xs3>
                <span>Font size</span>
              </v-flex>
              <v-flex xs9>
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
                  <v-icon>mdi-format-font-size-decrease</v-icon>
                </v-btn>
                <v-btn
                  depressed
                  id="font-size-increase-button"
                  class="ml-2"
                  @click="increaseFontSize()">
                  <v-icon>mdi-format-font-size-increase</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-form>
        <v-progress-linear v-else :indeterminate="true" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { mixin } from '@/mixins'
import {
  resetFontSize,
  decreaseFontSize,
  increaseFontSize,
  getCurrentFontSize
} from '@/utils/font-size'

// TODO: update where user preferences are stored after #335

export default {
  mixins: [mixin],
  computed: {
    ...mapState('user', ['user'])
  },
  metaInfo () {
    return {
      title: this.getPageTitle('App.userProfile')
    }
  },
  methods: {
    resetFontSize,
    decreaseFontSize,
    increaseFontSize,
    getCurrentFontSize
  }
}
</script>
