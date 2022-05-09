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
      />
      <br />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          @click="cancel()"
          text
        >
          Cancel
        </v-btn>
        <v-btn
          color="orange"
          @click="$refs.formGenerator.reset()"
          text
        >
          Reset
        </v-btn>
        <v-btn
          color="blue"
          @click="$refs.formGenerator.submit()"
          text
        >
          Submit
        </v-btn>
      </v-card-actions>
      <p
       style="font-size:1.5em;"
       v-if="status !== 'waiting'"
      >
        <Task :status="status"/>
        {{ status }}
      </p>
      <pre v-if="status === 'failed'">{{ response }}</pre>
    </v-card>
</template>

<script>
import FormGenerator from '@/components/graphqlFormGenerator/FormGenerator.vue'
import Task from '@/components/cylc/Task.vue'
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

// the "data" function, defined here so we can easily reset the component
const initialState = () => ({
  response: '',
  status: status.waiting
})

export default {
  name: 'mutation',

  components: {
    FormGenerator,
    Task
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

  data: initialState,

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
      Object.assign(this.$data, initialState())
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
