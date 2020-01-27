<template>
  <v-list
   dense
   one-line
  >
    <v-list-item-title>{{ label }}</v-list-item-title>
      <v-list-item
        dense
        v-for="(item, index) in value"
        :key="index"
      >
        <v-list-item-content>
          <!-- The input -->
          <component
           v-model="value[index]"
           :propOverrides="{'dense': true}"
           :gqlType="gqlType.ofType"
           :types="types"
           :is="FormInput"
           label=""
          >
            <template v-slot:append-outer>
              <v-icon
               @click="remove(index)"
              >
                mdi-close-circle
              </v-icon>
            </template>
          </component>
          <!--
            NOTE: we use :is here due to a nested component
            registration issue.
          -->
        </v-list-item-content>
      </v-list-item>
      <v-list-item
       dense
      >
        <v-btn
         @click="add()"
         text
        >
          <v-icon>mdi-plus-circle</v-icon>
          Add Item
        </v-btn>
      </v-list-item>
  </v-list>
</template>

<script>
import { formElement } from '@/components/graphqlFormGenerator/mixins'
import { getNullValue } from '@/utils/graphql'

export default {
  name: 'g-list',

  mixins: [
    formElement
  ],

  methods: {
    /* Add an item to the list. */
    add () {
      this.value.push(
        getNullValue(this.gqlType.ofType, this.types)
      )
    },

    /* Remove the item at `index` from the list. */
    remove (index) {
      console.log('remove', index)
      this.value.splice(index, 1)
    }
  }
}
</script>
