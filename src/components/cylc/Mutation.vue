<template>
  <v-container>
    <v-card
      class="mx-auto d-inline-block"
      style="padding: 1em;"
      max-width="500"
      outlined
    >
      <FormGenerator
       :mutation='mutation'
       :types='types'
       :callbackSubmit='call'
      />
    </v-card>
    <v-card
      max-width="500"
      outlined
    >
    </v-card>
    <pre>{{ response }}</pre>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'

import FormGenerator from '@/components/graphqlFormGenerator/FormGenerator'
import { constructMutation } from '@/utils/graphql'

export default {
  name: 'mutation',

  components: {
    FormGenerator
  },

  props: {
    mutation: {
      type: Object,
      required: true
    },
    types: {
      type: Array
    }
  },

  data: () => ({
    response: null
  }),

  methods: {
    /* Submit this GraphQL mutation request. */
    async call (args) {
      let result = null
      try {
        result = await this.$workflowService.apolloClient.mutate({
          mutation: gql(constructMutation(this.mutation)),
          variables: args
        })
      } catch (err) {
        console.log(err)
        return false
      }
      let responses = result['data'][this.mutation.name]['result']
      if (responses) {
        this.response = responses[0].response
        return true
      }
      this.response = result['data'][this.mutation.name]
      return false
    }
  }
}
</script>
