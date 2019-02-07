<template>
  <v-container
    fill-height
    fluid>
    <v-layout
      align-center
      justify-center>
      <v-flex
        xs12
        sm8
        md4>
        <v-card
          class="elevation-12">
          <v-toolbar
            dark
            color="primary">
            <v-toolbar-title>Cylc {{ appVersion }}</v-toolbar-title>
            <v-spacer />
          </v-toolbar>
          <v-card-text>
            <v-form>
              <v-text-field
                ref="username"
                v-model="username"
                :rules="[() => !!username || 'This field is required']"
                :error-messages="errorMessages"
                prepend-icon="person"
                label="User name"
                placeholder="john.doe"
                required
              />
              <v-text-field
                ref="password"
                v-model="password"
                :rules="[() => !!password || 'This field is required']"
                :error-messages="errorMessages"
                :append-icon="showPassword ? 'visibility_off' : 'visibility'"
                :type="showPassword ? 'text' : 'password'"
                prepend-icon="lock"
                label="Password"
                placeholder="*********"
                counter
                required
                @click:append="showPassword = !showPassword"
              />
            <!--<v-text-field-->
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
            <v-btn
              align-center
              justify-center
              color="green"
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
    },
    appVersion: function () {
      return this.$store.getters.appVersion
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
