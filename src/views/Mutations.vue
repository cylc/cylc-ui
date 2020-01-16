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
        <!--FormGenerator :mutation='sampleMutation' /-->
        <FormGenerator :mutation='getMutation(selectedMutation)' />
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
    selectedMutation: null,
    mutations: {},
    sampleMutation: {
      name: 'My Mutation',
      description: 'Test example.',
      args: [
        {
          name: 'MyString',
          type: {
            name: 'String',
            kind: 'SCALAR'
          }
        },
        {
          name: 'MyInteger',
          type: {
            name: 'Int',
            kind: 'SCALAR'
          }
        },
        {
          name: 'MyNonNull',
          defaultValue: 'cant null this',
          type: {
            name: null,
            kind: 'NON_NULL',
            ofType: {
              name: 'String',
              kind: 'SCALAR'
            }
          }
        },
        {
          name: 'MyStringList',
          defaultValue: ['a', 'b', 'c'],
          type: {
            name: null,
            kind: 'LIST',
            ofType: {
              name: 'String',
              kind: 'SCALAR'
            }
          }
        }
      ]
    }
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
          }
        }
      `)
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
        this.loaded = true
      })
    },

    getMutation (name) {
      for (const mutation of this.mutations) {
        if (mutation.name === name) {
          return mutation
        }
      }
    }
  }

}
</script>
