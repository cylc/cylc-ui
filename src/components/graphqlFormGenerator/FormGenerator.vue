<template>
  <v-form>
    <h3>{{ mutation.name }}</h3>
    <p>{{ mutation.description }}</p>
    <component
     v-for="arg in getArguments(mutation)"
     v-bind:key="arg.label"
     v-model="model[arg.label]"
     :is="arg.component"
     :label="arg.label"
    >
      <component
       v-if="arg.ofType"
       :is="derive(arg.ofType).component"
      >
        <component
         v-if="arg.ofType.ofType"
         :is="derive(arg.ofType.ofType).component"
        >
        </component>
      </component>
    </component>
    <v-btn
      @click="meh"
    >
      Done
    </v-btn>
    <pre>{{ model }}</pre>
  </v-form>
</template>

<script>
import Vue from 'vue'

import { VTextField } from 'vuetify/lib/components/VTextField'
import { VForm } from 'vuetify/lib/components/VForm'
import GList from '@/components/graphqlFormGenerator/components/List'
import GNonNull from '@/components/graphqlFormGenerator/components/NonNull'

const FORM_COMPONENTS = {
  Form: {
    component: VForm,
  }
}

const TYPE_COMPONENTS = {
  String: {
    component: VTextField,
  }
}

const KIND_COMPONENTS = {
    LIST: {
      component: GList
    },
    NON_NULL: {
      component: GNonNull
    }
}

export default {
  components: {
  },

  props: {
    mutation: {
      type: Object,
      required: true
    }
  },

  data: () => ({
    model: {}
  }),

  created () {
    // TEST DATA
    this.mutation = {
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
            kind:' SCALAR'
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
        }
      ]
    }
  },

  methods: {
    derive (type) {
      const name = type.name
      const kind = type.kind
      if (TYPE_COMPONENTS[name]) {
        return TYPE_COMPONENTS[name]
      }
      if (KIND_COMPONENTS[kind]) {
        return KIND_COMPONENTS[kind]
      }
      return TYPE_COMPONENTS['String']
    },

    processType (type) {
      return {
        component: this.derive(type).component,
        ofType: type.ofType
      }
    },

    getArguments (mutations) {
      const ret = []
      for (let argument of mutations.args) {
        const arg = this.processType(argument.type)
        arg.label = argument.name
        ret.push(arg)
        // spin up the model
        this.model[argument.name] = (
          argument.defaultValue
          ? argument.defaultValue
          : null
        )
      }
      return ret
    },

    meh () {console.log(this.model)}
  }
}
</script>
