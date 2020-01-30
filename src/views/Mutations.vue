<template>
  <div class="c-mutations">
    <div v-if="!loaded">
      Loading...
    </div>
    <div v-if="loaded">
      <h1>Form Generator</h1>
      <v-select
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
      <h1>Associator</h1>
      <v-select
        v-model="selectedAssociation"
        :items="Object.keys(cylcObjects)"
        label="Cylc Object"
      />
      <ul
        v-if="selectedAssociation"
      >
        <li
          v-for="association in filterAssociations(selectedAssociation)"
          v-bind:key="association.name"
        >
          <span><b>{{ association.name }}</b></span>
          <span
            v-if="association.multiple"
          > (list)</span>
          <span><i> - {{ association.argument }}</i></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { introspectionQuery, print } from 'graphql'

import FormGenerator from '@/components/graphqlFormGenerator/FormGenerator'

export function associate (mutations, objects) {
  const associations = {}
  for (const mutation of mutations) {
    associations[mutation.name] = []
    let pointer = null
    let multiple = null
    let flag = null
    for (const argument of mutation.args) {
      pointer = argument.type
      multiple = false
      flag = false
      while (pointer) {
        // walk down the nested type tree
        if (pointer.kind === 'LIST') {
          multiple = true
        } else if (pointer.name) {
          for (const objectName in objects) {
            for (
              const [type, impliesMultiple] of objects[objectName]
            ) {
              if (pointer.name === type) {
                associations[mutation.name].push({
                  argument: argument.name,
                  cylcObject: objectName,
                  multiple: multiple || impliesMultiple
                })
                flag = true
                break
              }
            }
            if (flag) { break }
          }
          if (flag) { break }
        }
        pointer = pointer.ofType
      }
    }
  }
  return associations
}

export default {
  components: {
    FormGenerator
  },

  data: () => ({
    loaded: false,
    mutations: {},
    selectedMutation: null,
    associations: {},
    selectedAssociation: null,
    cylcObjects: {
      // object: [[typeName: String, impliesMultiple: Boolean]]
      Workflow: [
        ['WorkflowID', false]
      ],
      CyclePoint: [
        ['CyclePoint', false],
        ['CyclePointGlob', true]
      ],
      Namespace: [
        ['NamespaceName', false],
        ['NamespaceIDGlob', true]
      ],
      Task: [
        ['TaskID', false]
      ],
      Job: [
        ['JobID', false]
      ]
    },
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
        this.associate()
        this.loaded = true
      })
    },

    getMutation (name) {
      for (const mutation of this.mutations) {
        if (mutation.name === name) {
          return mutation
        }
      }
    },

    /* Associate mutations with cylc objects (e.g. workflows, cyclepoints) */
    associate (mutations, objects) {
      this.associations = associate(this.mutations, this.cylcObjects)
    },

    /* Return names of mutations which relate to the provided object type.
     *
     * Returns a dictionary: {
     *   // mutation name
     *   name,
     *   // the argument of the mutation which relates to the type.
     *   argument,
     *   // true if more than one object can be provided
     *   // (i.e. the argument accepts a glob, list or list of globs)
     *   multiple
     * }
     */
    filterAssociations (cylcObject) {
      const ret = []
      let association
      for (const mutationName in this.associations) {
        association = this.associations[mutationName]
        for (const entry of association) {
          if (entry.cylcObject === cylcObject) {
            ret.push({
              name: mutationName,
              argument: entry.argument,
              multiple: entry.multiple
            })
            break
          }
        }
      }
      return ret
    }
  }

}
</script>
