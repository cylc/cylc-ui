<template>
  <div class="c-mutations">
    <div v-if="!loaded">
      Loading...
    </div>
    <div v-if="loaded">
      <v-select
        v-if="mutations"
        v-model="selectedMutation"
        :items="mutationNames"
        label="Mutation"
      />
      <v-card
        v-if="selectedMutation"
        class="mx-auto d-inline-block"
        max-width="500"
        outlined
      >
        <FormGenerator
         :mutation='getMutation(selectedMutation)'
         :types='types'
        />
      </v-card>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { introspectionQuery, print } from 'graphql'

import FormGenerator from '@/components/graphqlFormGenerator/FormGenerator'

export default {
  components: {
    FormGenerator
  },

  data: () => ({
    loaded: false,
    selectedMutation: 'sampleMutation',
    types: [],
    mutations: {}
  }),

  computed: {
    mutationNames () {
      const names = []
      if (!this.mutations) {
        return names
      }
      for (const mutation of this.mutations) {
        names.push(mutation.name)
      }
      return names
    },

    sampleMutation () {
      // create a mutation with one argument per input type
      const args = []
      for (const type of this.types) {
        if (
          type.kind !== 'OBJECT' &&
          type.name[0] !== '_'
        ) {
          args.push({
            name: type.name,
            type: {
              name: type.name,
              kind: type.kind
            }
          })
        }
      }

      // add a nested NonNull component
      args.push({
        name: 'NonNull<String>',
        defaultValue: '"Can\'t null this"',
        type: {
          name: null,
          kind: 'NON_NULL',
          ofType: {
            name: 'String',
            kind: 'SCALAR'
          }
        }
      })

      // add a nested List component
      args.push({
        name: 'List<String>',
        defaultValue: '["abc"]',
        type: {
          name: null,
          kind: 'LIST',
          ofType: {
            name: 'String',
            kind: 'SCALAR'
          }
        }
      })

      // add a double nested NonNull, List component
      args.push({
        name: 'NonNull<List<NonNull<String>>>',
        defaultValue: '["abc"]',
        type: {
          name: null,
          kind: 'NON_NULL',
          ofType: {
            name: null,
            kind: 'LIST',
            ofType: {
              name: null,
              kind: 'NON_NULL',
              ofType: {
                name: 'String',
                kind: 'SCALAR'
              }
            }
          }
        }
      })

      // add a triple nested Object, List component
      args.push({
        name: 'List<BroadcastSetting>',
        defaultValue: '[{"key": "[env]FOO", "value": "foo"}]',
        type: {
          name: null,
          kind: 'LIST',
          ofType: {
            name: 'BroadcastSetting',
            kind: 'INPUT_OBJECT'
          }
        }
      })

      // add a quintuple nested Object just for fun
      // (if this works all is good!)
      // NOTE: always debug from the lowest level of nesting
      // NOTE: BroadcastSetting = NonNull<String>, NonNull<String>
      args.push({
        name: 'NonNull<List<NonNull<BroadcastSetting>>>',
        defaultValue: '[{"key": "[env]FOO", "value": "foo"}]',
        type: {
          name: null,
          kind: 'NON_NULL',
          ofType: {
            name: null,
            kind: 'LIST',
            ofType: {
              name: null,
              kind: 'NON_NULL',
              ofType: {
                name: 'BroadcastSetting',
                kind: 'INPUT_OBJECT'
              }
            }
          }
        }
      })

      return {
        name: 'Sample Mutation',
        description: 'Example containing all data types present in the schema.',
        args: args
      }
    }
  },

  created () {
    this.getSchema()
  },

  methods: {
    getIntrospectionQuery () {
      // we are only interested in mutations so can make our life
      // a little easier by restricting the scope of the default
      // introspection query
      const fullIntrospection = gql(introspectionQuery)
      const mutationQuery = gql(`
        query {
          __schema {
            mutationType {
              ...FullType
            }
            types {
              ...FullType
            }
          }
        }
      `)
      // TODO: this returns all types, we only need certain ones

      // NOTE: we are converting to string form then re-parsing
      // back to a query, as something funny happens when you
      // try to modify the gql objects by hand.
      return gql(
        // the query we actually want to run
        print(mutationQuery.definitions[0]) +
        // the fragments which power it
        print(fullIntrospection.definitions[1]) +
        print(fullIntrospection.definitions[2]) +
        print(fullIntrospection.definitions[3])
      )
    },

    getSchema () {
      this.$workflowService.apolloClient.query({
        query: this.getIntrospectionQuery(),
        fetchPolicy: 'no-cache'
      }).then((response) => {
        this.mutations = response.data.__schema.mutationType.fields
        this.types = response.data.__schema.types
        this.loaded = true
      })
    },

    getMutation (name) {
      if (name === 'sampleMutation') {
        return this.sampleMutation
      }
      for (const mutation of this.mutations) {
        if (mutation.name === name) {
          return mutation
        }
      }
    }
  }

}
</script>
