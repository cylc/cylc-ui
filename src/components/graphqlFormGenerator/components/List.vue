<template>
  <v-container>
    <v-row>
      {{label}}
    </v-row>
    <v-row
     v-for="(item, index) in value"
     v-bind="index"
    >
      <v-col cols="10">
        <component
         v-model="value[index]"
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
import PassProps from 'vue-pass-props'
import FormInput from '@/components/graphqlFormGenerator/components/FormInput'

export default {
  name: 'non-null',

  components: {
    'form-input': FormInput
  },

  props: {
    'value': {
      required: true
    },
    'gqlType': {
      type: Object,
      required: true
    },
    'label': {
      type: String,
      required: true
    }
  },

  data: () => ({
    'FormInput': FormInput
  }),

  computed: {
    componentValue: {
      // v-model for the child components
      get () {
        return this.value
      },

      set (val) {
        this.$emit('input', val)
      }
    }
  },

  methods: {
    // add and remove elements from the list
    add() {
      this.value.push(null)
    },

    remove (index) {
      this.value.splice(index, 1)
    }
  }
}
</script>
