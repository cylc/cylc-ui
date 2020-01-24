<template>
  <v-container>
    <v-card
      class="mx-auto d-inline-block"
      style="padding: 1em;"
      max-width="500"
      outlined
    >
      <FormGenerator
       :mutation='spec'
       :types='types'
       :callbackSubmit='call'
      />
    </v-card>
    <v-card
      max-width="500"
      outlined
    >
      <p>The mutation boilerplate</p>
      <pre>{{ gqlMutation }}</pre>
      <p>The server response</p>
      <pre>{{ response }}</pre>
    </v-card>
  </v-container>
</template>

<script>
import gql from 'graphql-tag'

import FormGenerator from '@/components/graphqlFormGenerator/FormGenerator'

export default {
  name: 'mutation',

  components: {
    FormGenerator
  },

  props: {
    spec: {
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
      try {
        const ret = await this.$workflowService.apolloClient.mutate({
          mutation: gql(this.gqlMutation),
          variables: args
        })
      } catch(err) {
        console.log(err)
      }
    },

    /* Return the GraphQL mutation interface representation of an arg
     * for use with composing mutation request strings.
     *
     * E.G: NonNull<List<String>>  =>  [String]!
     */
    formatArgType(arg) {
      const stack = []
      let pointer = arg.type
      while (pointer) {
        stack.push(pointer)
        if (
          (
            pointer.name == null &&
            pointer.kind == 'LIST'
          ) || (
            pointer.name == null &&
            pointer.kind == 'NON_NULL'
          )
        ) {
          pointer = pointer.ofType
        } else {
          break
        }
      }
      stack.reverse()
      console.log(stack)
      let ret = ''
      for (const pointer of stack) {
        if (
          pointer.name == null &&
          pointer.kind == 'LIST'
        ) {
          ret = `[${ret}]`
        } else if (
          pointer.name == null &&
          pointer.kind == 'NON_NULL'
        ) {
          ret = ret + '!'
        } else if (pointer.name) {
          ret = pointer.name
        } else {
          ret = pointer.kind
        }
      }
      return ret
    }
  },

  computed: {
    /* The GraphQL mutation request string for this mutation. */
    gqlMutation () {
      const argNames = []
      const argTypes = []
      for (const arg of this.spec.args) {
        argNames.push(`${arg.name}: $${arg.name}`)
        argTypes.push(`$${arg.name}: ${this.formatArgType(arg)}`)
      }

      return `
        mutation ${this.spec.name}(${argTypes.join(', ')}) {
          ${this.spec.name}(${argNames.join(', ')}) {
            result
          }
        }
      `
    }
  }
}
</script>
