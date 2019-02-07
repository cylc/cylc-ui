<template>
  <v-container
    fill-height
    fluid
    grid-list-xl>
    <v-layout
      align-center
      justify-center>
      <v-flex
        xs12
        sm10
        md8
        lg6>
        <v-card
          ref="form"
          class="elevation-12">
          <v-card-text>
            <v-form>
              <v-text-field
                ref="username"
                v-model="username"
                :rules="[() => !!username || 'This field is required']"
                :error-messages="errorMessages"
                label="User name"
                placeholder="john.doe"
                required
              />
              <v-text-field
                ref="password"
                v-model="password"
                :rules="[() => !!password || 'This field is required']"
                :error-messages="errorMessages"
                label="Password"
                placeholder="*********"
                required
              />
            <!--<v-text-field-->
              <!--v-model="password"-->
              <!--:append-icon="showPassword ? 'visibility_off' : 'visibility'"-->
              <!--:rules="[rules.required, rules.min]"-->
              <!--:type="showPassword ? 'text' : 'password'"-->
              <!--name="password"-->
              <!--label="Normal with hint text"-->
              <!--hint="Try to use a strong password"-->
              <!--counter-->
              <!--@click:append="showPassword = !showPassword"-->
            <!--&gt;</v-text-field>-->
            </v-form>
          </v-card-text>
          <v-divider class="mt-5" />
          <v-card-actions>
            <v-btn flat>Cancel</v-btn>
            <v-spacer />
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
      formHasErrors: false,
      showPassword: false
    }
  },
  computed: {
    form () {
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
