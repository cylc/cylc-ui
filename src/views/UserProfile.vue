<template>
  <v-container>
    <v-layout justify-center wrap>
      <v-flex xs12 md12>
        <material-card
          title="Settings">
          <v-form>
            <v-dialog fullscreen full-width persistent :value=isLoading>
              <v-container fluid fill-height style="background-color: rgba(255, 255, 255, 0.5)">
                <v-layout justify-center align-center>
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    />
                </v-layout>
              </v-container>
            </v-dialog>
            <v-combobox
              :items="applicationThemes"
              v-model="applicationTheme"
              label="Application Theme"
            />
            <v-combobox
              :items="jobStatesThemes"
              v-model="jobStatesTheme"
              label="Job States Theme"
            />
            <v-combobox
              :items="languages"
              v-model="language"
              label="Language"
            />
            <v-btn color="success" @click="onSaveSettings" :disabled="isLoading">Save</v-btn>
          </v-form>
        </material-card>
      </v-flex>
      <v-flex xs12 md12>
        <material-card
            color="green"
            title="Your Profile"
            text="This is a read-only view of your user"
        >
          <v-form v-if="user !== null">
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
          <v-progress-linear v-else :indeterminate="true" />
        </material-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { UserService } from 'user-service'
import { mapState } from 'vuex'
import Settings from '@/model/Settings.model'
export default {
  computed: {
    ...mapState('user', ['user', 'settings', 'applicationThemes', 'jobStatesThemes', 'languages']),
    ...mapState(['isLoading'])
  },
  mounted () {
    this.applicationTheme = this.settings.applicationTheme
    this.jobStatesTheme = this.settings.jobStatesTheme
    this.language = this.settings.language
  },
  data: () => {
    return {
      applicationTheme: null,
      jobStatesTheme: null,
      language: null
    }
  },
  metaInfo () {
    return {
      title: 'Cylc UI | User Profile'
    }
  },
  methods: {
    onSaveSettings () {
      const settings = new Settings(this.applicationTheme, this.jobStatesTheme, this.language)
      UserService.saveSettings(settings)
    }
  }
}
</script>
