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
         :types="types"
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
import { formElement } from '@/components/graphqlFormGenerator/mixins'

export default {
  name: 'g-list',

  mixins: [formElement],

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
