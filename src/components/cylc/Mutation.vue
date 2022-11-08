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
    <v-card
      class="mx-auto d-inline-block"
      style="padding: 1em;"
      outlined
    >
      <FormGenerator
       :mutation='mutation'
       :types='types'
       :callbackSubmit='call'
       :initialData='initialData'
       ref="formGenerator"
       v-model="isValid"
      />
      <br />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          @click="cancel()"
          text
          data-cy="cancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="orange"
          @click="$refs.formGenerator.reset()"
          text
          data-cy="reset"
        >
          Reset
        </v-btn>
        <v-tooltip
          top
          color="error"
          :disabled="isValid"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              text
              :color="isValid ? 'primary' : 'error'"
              @click="$refs.formGenerator.submit()"
              v-bind="attrs"
              v-on="on"
              data-cy="submit"
            >
              Submit
            </v-btn>
          </template>
          <span>Form contains invalid or missing values!</span>
        </v-tooltip>
      </v-card-actions>
      <p
       style="font-size:1.5em;"
       v-if="status !== 'waiting'"
      >
        {{ status }}
      </p>
      <pre v-if="status === 'failed'">{{ response }}</pre>
    </v-card>
</template>

<script>
import FormGenerator from '@/components/graphqlFormGenerator/FormGenerator.vue'
import { mutate } from '@/utils/aotf'

// enumeration for the mutation status, maps onto Cylc Task status
const status = {
  waiting: 'waiting',
  submitted: 'submitted',
  succeeded: 'succeeded',
  failed: 'failed',
  submitFailed: 'submit-failed'
}
Object.freeze(status)

// initial state defined here so we can easily reset the component data
const initialState = {
  response: '',
  status: status.waiting
}
Object.freeze(initialState)

export default {
  name: 'mutation',

  components: {
    FormGenerator
  },

  props: {
    mutation: {
      // graphql mutation object as returned by introspection query
      type: Object,
      required: true
    },
    types: {
      // list of all graphql types as returned by introspection query
      // (required for resolving InputType objects
      type: Array
    },
    initialData: {
      type: Object,
      required: false,
      default: () => {}
    },
    cancel: {
      type: Function,
      required: true
    }
  },

  data: () => ({
    ...initialState,
    isValid: false
  }),

  methods: {
    /* Execute the GraphQL mutation */
    async call (args) {
      this.status = status.submitted
      mutate(
        this.mutation,
        args,
        this.$workflowService.apolloClient
      ).then(response => {
        this.status = response.status.name.replace('_', '-')
      })
    },

    /* Reset this component to it's initial state. */
    reset () {
      this.$refs.formGenerator.reset()
      Object.assign(this.$data, initialState)
    }
  },

  watch: {
    mutation: function () {
      // reset the form if the mutation changes
      // (i.e. this component is being re-used)
      this.reset()
    }
  }

}
</script>
