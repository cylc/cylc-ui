<template>
  <div class="c-mutations">
    <h1>Mutations</h1>
    <ul>
      <li v-for="mutation in mutations">{{ mutation['name'] }}</li>
    </ul>
    <h1>Form</h1>
    <div v-if="mutations[4]">
      <v-card
        class="mx-auto"
        max-width="500"
        outlined
      >
        <FormGenerator :mutation='mutations[4]' />
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
    mutations: {}
  }),

  created () {
    this.getSchema()
  },

  methods: {
    getIntrospectionQuery () {
      // we are only interested in mutations so can make our life
      // a little easier by restricting the scope of the default
      // introspection query
      var fullIntrospection = gql(introspectionQuery)
      var mutationQuery = gql(`
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
      })
    }

    /*
    getGraphqlSchema (introspection) {
      return graphqlSync(
        buildClientSchema(introspection['data']),
        introspectionQuery
      ).data
    },

    getSchema () {
      // extract graphql schema via introspection
      this.$workflowService.apolloClient.query({
        query: gql(introspectionQuery),
        fetchPolicy: 'no-cache'
      }).then((response) => {
        const graphqlSchema = this.getGraphqlSchema(response)
        this.schema = graphqlSchema
      })
    }
    */
  }

}
</script>
