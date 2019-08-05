<template>
  <v-container>
    <v-layout justify-center wrap>
      <v-flex xs12 md12>
        <material-card
            color="green"
            :title="$t('UserProfile.tableHeader')"
            :text="$t('UserProfile.tableSubHeader')"
        >
          <v-form v-if="user !== null">
            <v-container py-0>
              <v-layout row wrap>
                <v-flex xs12 md12>
                  <v-text-field
                      :value="user.getUserName()"
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
                      :items="user.getGroups()"
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
                      :value="user.getCreated()"
                      :label="$t('UserProfile.created')"
                      disabled
                      aria-disabled="true"
                  />
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
          <v-progress-linear v-else :indeterminate="true" />
        </material-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { UserService } from '@/services/user.service'
import { mapState } from 'vuex'
import { mixin } from '@/mixins/index'

export default {
  mixins: [mixin],
  computed: {
    ...mapState('user', ['user'])
  },
  beforeCreate () {
    this.$store
      .dispatch('user/setUser', null)
      .then(() => {
        UserService.getUserProfile()
      })
  },
  metaInfo () {
    return {
      title: this.getPageTitle('App.userProfile')
    }
  }
}
</script>
