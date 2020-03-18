<template>
  <v-container>
    <v-layout wrap>
      <v-flex xs12 md12>
        <v-alert
          prominent
          color="grey lighten-3"
          icon="mdi-settings"
        >
          <h3 class="headline">{{ $t('UserProfile.tableHeader') }}</h3>
          {{ $t('UserProfile.tableSubHeader') }}
        </v-alert>
        <v-form v-if="user !== null">
          <v-container py-0>
            <v-layout row wrap>
              <v-flex xs12 md12>
                <v-text-field
                    :value="user.username"
                    :label="$t('UserProfile.username')"
                    disabled
                    aria-disabled="true"
                />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex xs12 md12>
                <v-checkbox
                    v-model="user.admin"
                    :label="$t('UserProfile.administrator')"
                    disabled
                    aria-disabled="true"
                />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex
                  xs12
                  md12
              >
                <v-select
                    :items="user.groups"
                    v-model="user.groups"
                    :label="$t('UserProfile.groups')"
                    attach
                    chips
                    multiple
                    disabled
                    aria-disabled="true"
                />
              </v-flex>
            </v-layout>
            <v-layout row wrap>
              <v-flex
                  xs12
                  md12
              >
                <v-text-field
                    :value="user.created"
                    :label="$t('UserProfile.created')"
                    disabled
                    aria-disabled="true"
                />
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
import { mixin } from '@/mixins/index'

export default {
  mixins: [mixin],
  computed: {
    ...mapState('user', ['user'])
  },
  metaInfo () {
    return {
      title: this.getPageTitle('App.userProfile')
    }
  }
}
</script>
