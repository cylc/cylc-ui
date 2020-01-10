<template>
  <v-container>
    <!-- The title -->
    <v-row>
      {{label}}
    </v-row>
    <!-- The List -->
    <v-row
     v-for="(item, index) in value"
     :key="index"
    >
      <v-col cols="10">
        <!-- The input -->
        <component
         v-model="value[index]"
         :propOverrides="{'dense': true}"
         :gqlType="gqlType.ofType"
         :is="FormInput"
         label=""
        />
        <!--
          NOTE: we use :is here due to a nested component
          registration issue.
        -->
      </v-col>
      <v-col cols="2">
        <!-- The remove row button -->
        <v-btn
         class="mx-2"
         fab
         dark
         x-small
         color="primary"
         @click="remove(index)"
        >
          <v-icon dark>mdi-minus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="2">
        <!-- The add row button -->
        <v-btn
         class="mx-2"
         fab
         dark
         x-small
         color="primary"
         @click="add"
        >
          <v-icon dark>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FormInput from '@/components/graphqlFormGenerator/FormInput'

export default {
  name: 'non-null',

  components: {
    'form-input': FormInput
  },

  props: {
    // the GraphQL type this input represents
    gqlType: {
      type: Object,
      required: true
    },
    // the form label for this input
    label: {
      type: String,
      required: true
    },
    // the value (v-model is actually syntactic sugar for this)
    value: {
      required: true
    }
  },

  data: () => ({
    FormInput: FormInput
  }),

  computed: {
    /* The model we pass to the form input.
     *
     * Note the v-model approach does not work with nesting out of the box,
     * you need to capture and propagate "input" events up the component tree
     * to enable this nested structure of components to share the same model
     * and be managed by Vue correctly.
     */
    model: {
      get () {
        return this.value
      },

      set (val) {
        this.$emit('input', val)
      }
    }
  },

  methods: {
    /* Add an item to the list. */
    add () {
      this.value.push(null)
    },

    /* Remove the item at `index` from the list. */
    remove (index) {
      this.value.splice(index, 1)
    }
  }
}
</script>
