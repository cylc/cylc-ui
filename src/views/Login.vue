<template>
  <v-container
    fill-height
    fluid
    grid-list-xl>
    <v-layout justify-center>
      <v-flex
        xs12
        sm10
        md8
        lg6>
        <v-card ref="form">
          <v-card-text>
            <v-text-field
              ref="username"
              v-model="username"
              :rules="[() => !!username || 'This field is required']"
              :error-messages="errorMessages"
              label="User name"
              placeholder="john.doe"
              required
            ></v-text-field>
            <v-text-field
              ref="password"
              v-model="password"
              :rules="[() => !!password || 'This field is required']"
              :error-messages="errorMessages"
              label="Password"
              placeholder="*********"
              required
            ></v-text-field>
          </v-card-text>
          <v-divider class="mt-5"></v-divider>
          <v-card-actions>
            <v-btn flat>Cancel</v-btn>
            <v-spacer></v-spacer>
            <v-slide-x-reverse-transition>
              <v-tooltip
                v-if="formHasErrors"
                left
              >
                <v-btn
                  slot="activator"
                  icon
                  class="my-0"
                  @click="resetForm"
                >
                  <v-icon>refresh</v-icon>
                </v-btn>
                <span>Refresh form</span>
              </v-tooltip>
            </v-slide-x-reverse-transition>
            <v-btn
              color="primary"
              flat
              @click="submit">Submit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data: function () {
    return {
      username: '',
      password: '',
      errorMessages: '',
      formHasErrors: false
    }
  },
  computed: {
    form() {
      return {
        username: this.username,
        password: this.password
      }
    }
  },
  methods: {
    submit: function () {
      this.formHasErrors = false

      Object.keys(this.form).forEach(f => {
        if (!this.form[f]) {
          this.formHasErrors = false
        }

        this.$refs[f].validate(true)
      })
    }
  },
  metaInfo () {
    return {
      title: 'Cylc Web | Login'
    }
  }
}
</script>
