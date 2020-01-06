<template>
  <div class="c-mutations">
    <h1>{{ mutationName }}</h1>
    <h2>JSON Schema</h2>
    <pre>{{ mutations[mutationName] }}</pre>
    <h2>Form</h2>
    <FormSchema
      class="form"
      :schema="mutations[mutationName]"
      v-model="model"
      v-if="mutations[mutationName]"
    >
      <div class="buttons">
        <button type="submit">Submit</button>
      </div>
    </FormSchema>
  </div>
</template>

<style>
  .c-mutations > h1, .c-mutations > h2 {
    color: blue
  }
</style>

<script>
import gql from 'graphql-tag'
import { buildClientSchema } from 'graphql/utilities/buildClientSchema'
import { graphqlSync, introspectionQuery } from 'graphql'
import { fromIntrospectionQuery } from 'graphql-2-json-schema'
import FormSchema from '@formschema/native'

export default {
  components: {
    FormSchema
  },

  data: () => ({
    mutationName: 'nudgeWorkflow',
    mutations: [],
    model: {}
  }),

  created () {
    this.getMutations()
  },

  methods: {
    getGraphqlSchema (introspection) {
      // graphql introspectionQuery
      return graphqlSync(
        buildClientSchema(introspection['data']),
        introspectionQuery
      ).data
    },

    getJsonSchema (graphqlSchema) {
      return fromIntrospectionQuery(graphqlSchema)
    },

    extractMutations (jsonSchema) {
      const mutations = jsonSchema.properties.Mutation.properties
      const ret = {}
      var mutation = {}
      for (let mutationName in mutations) {
        // turn these into valid json schema forms
        // (the translation doesn't work well with mutation types)
        mutation = {
          type: 'object',
          title: mutationName,
          properties: mutations[mutationName].properties.arguments.properties
        }
        // add default metadata (not generated in translation)
        for (let argumentName in mutation.properties) {
          mutation.properties[argumentName].attrs = {
            placeholder: argumentName,
            title: argumentName
          }
        }
        ret[mutationName] = mutation
      }
      return ret
    },

    getMutations () {
      this.$workflowService.apolloClient.query({
        query: gql(introspectionQuery),
        fetchPolicy: 'no-cache'
      }).then((response) => {
        // extract graphql schema via introspection
        const graphqlSchema = this.getGraphqlSchema(response)

        // translate graphql schema to json schema
        const jsonSchema = this.getJsonSchema(graphqlSchema)

        // extract mutations from json schema
        const mutations = this.extractMutations(jsonSchema)

        this.mutations = mutations
      })
    }
  }

}
</script>
