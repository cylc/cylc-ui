<!--
Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <v-card
    class="c-mutation"
    variant="flat"
  >
    <!-- the mutation title -->
    <template v-slot:title>
      {{ mutation._title }}
    </template>

    <template v-slot:append>
      <slot name="append"/>
    </template>

    <v-card-text class="card-text py-0 px-4">
      <v-defaults-provider :defaults="inputDefaults">
        <!-- the mutation description -->
        <v-expansion-panels
          v-bind="extendedDescription ? { hover: true } : { readonly: true }"
        >
          <v-expansion-panel
            class="mutation-desc"
            elevation="0"
          >
            <v-expansion-panel-title
              v-bind="extendedDescription ? {} : {
                expandIcon: null,
                style: {
                  cursor: 'default',
                },
              }"
            >
              <Markdown :markdown="shortDescription"/>
            </v-expansion-panel-title>
            <v-expansion-panel-text v-if="extendedDescription">
              <Markdown :markdown="extendedDescription"/>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- the form -->
        <v-divider />
        <EditRuntimeForm
          v-if="mutation.name === 'editRuntime'"
          v-bind="{
            cylcObject,
            types,
          }"
          ref="form"
          v-model="isValid"
        />
        <FormGenerator
          v-else
          v-bind="{
            mutation,
            cylcObject,
            types,
          }"
          v-model:data="data"
          ref="form"
          v-model="isValid"
        />
      </v-defaults-provider>
    </v-card-text>

    <!-- the actions -->
    <v-card-actions class="pa-3">
      <v-spacer></v-spacer>
      <v-btn
        v-if="onCancel"
        @click="$emit('cancel')"
        color="grey"
        data-cy="cancel"
      >
        Cancel
      </v-btn>
      <v-btn
        color="orange"
        @click="form.reset()"
        data-cy="reset"
      >
        Reset
      </v-btn>
      <v-btn
        :color="isValid ? 'primary' : 'error'"
        @click="submit"
        :loading="submitting"
        data-cy="submit"
      >
        Submit
        <v-tooltip
          location="top"
          content-class="bg-error"
          :disabled="isValid"
        >
          <span>Form contains invalid or missing values!</span>
        </v-tooltip>
      </v-btn>
    </v-card-actions>

    <!-- the warnings -->
    <v-snackbar
      v-model="showWarning"
      timeout="4e3"
      color="amber-accent-2"
      data-cy="warning-snack"
    >
      {{ warningMsg }}
      <template v-slot:actions>
        <v-btn
          @click="showWarning = false"
          icon
          data-cy="snack-close"
        >
          <v-icon>
            {{ mdiClose }}
          </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, computed, useTemplateRef } from 'vue'
import FormGenerator from '@/components/graphqlFormGenerator/FormGenerator.vue'
import EditRuntimeForm from '@/components/graphqlFormGenerator/EditRuntimeForm.vue'
import Markdown from '@/components/Markdown.vue'
import {
  getMutationShortDesc,
  getMutationExtendedDesc,
  mutationStatus,
} from '@/utils/aotf'
import { mdiClose } from '@mdi/js'
import { inputDefaults } from '@/components/graphqlFormGenerator/components/vuetify'

const form = useTemplateRef('form')

const emit = defineEmits([
  'cancel',
  'success',
])

const props = defineProps({
  mutation: {
    // graphql mutation object as returned by introspection query
    type: Object,
    required: true,
  },
  cylcObject: {
    // data store node
    type: Object,
    required: true,
  },
  types: {
    // list of all graphql types as returned by introspection query
    // (required for resolving InputType objects
    type: Array,
  },
  // Explicitly include so we can detect if the parent is providing a listener:
  onCancel: {
    type: Function,
  },
})

const data = defineModel({ type: Object })

const isValid = ref(false)
const submitting = ref(false)
const warningMsg = ref()

/* Return the first line of the description. */
const shortDescription = computed(
  () => getMutationShortDesc(props.mutation.description)
)
/* Return the subsequent lines of the description */
const extendedDescription = computed(
  () => getMutationExtendedDesc(props.mutation.description)
)

const showWarning = computed({
  get () {
    return Boolean(warningMsg.value)
  },
  set (val) {
    if (!val) warningMsg.value = null
  },
})

/* Execute the GraphQL mutation */
async function submit () {
  submitting.value = true
  form.value.submit().then(async response => {
    submitting.value = false
    if (response.status === mutationStatus.SUCCEEDED) {
      emit('success')
    } else if (response.status === mutationStatus.WARN) {
      warningMsg.value = response.message
    }
    // else if error, an alert is generated by AOTF
  })
}
</script>

<style scoped lang="scss">
/* the body should scroll, the title and actions should remain fixed */
.c-mutation {
  display: flex;
  flex-direction: column;

  .card-text {
    overflow-y: auto;
  }
}
</style>
