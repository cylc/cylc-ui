<template>
  <v-container>
    <v-layout justify-center wrap>
      <v-flex xs12 md12>
        <material-card
            color="green"
            title="Your Profile"
            text="This is a read-only view of your user"
        >
          <v-form>
            <v-container py-0>
              <v-layout row wrap>
                <v-flex xs12 md12>
                  <v-text-field
                      :value="user.getUserName()"
                      label="Username"
                      disabled
                      aria-disabled="true"
                  />
                </v-flex>
              </v-layout>
              <v-layout row wrap>
                <v-flex xs12 md12>
                  <v-checkbox
                      v-model="user.admin"
                      label="Administrator"
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
                      label="Groups"
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
                      label="Created"
                      disabled
                      aria-disabled="true"
                  />
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
        </material-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { UserService } from '@/services/user.service'
  import { mapState } from 'vuex';
  export default {
    beforeRouteEnter(to, from, next) {
      UserService.getUserProfile().then(() => {
        next()
      }).catch((error) => {
        next(false);
        console.log(error)
      })
    },
    computed: {
      ...mapState('user', ['user'])
    },
    metaInfo() {
      return {
        title: 'Cylc Web | User Profile'
      }
    }
  }
</script>
