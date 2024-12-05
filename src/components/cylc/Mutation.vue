<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

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
  <!-- Have to repeat these defaults as the ones set in App.vue don't make it through
  the parent v-dialog - see https://github.com/vuetifyjs/vuetify/issues/18123 -->
  <v-defaults-provider :defaults="vuetifyDefaults">
    <v-card>
      <!-- the mutation title -->
      <v-card-title class="py-3">
          {{ mutation._title }}
      </v-card-title>
      <v-card-text class="card-text py-0 px-4">
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
                  cursor: 'default'
                }
              }"
            >
              <Markdown :markdown="shortDescription"/>
            </v-expansion-panel-title>
            <v-expansion-panel-text v-if="extendedDescription">
              <Markdown :markdown="extendedDescription"/>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-divider />
        <EditRuntimeForm
          v-if="mutation.name === 'editRuntime'"
          v-bind="{
            cylcObject,
            types
          }"
          ref="form"
          v-model="isValid"
        />
        <FormGenerator
          v-else
          v-bind="{
            mutation,
            types,
            initialData
          }"
          ref="form"
          v-model="isValid"
        />
      </v-card-text>
      <v-card-actions class="pa-3">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          @click="close()"
          variant="text"
          data-cy="cancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="orange"
          @click="$refs.form.reset()"
          variant="text"
          data-cy="reset"
        >
          Reset
        </v-btn>
        <v-btn
          variant="text"
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
              {{ $options.icons.close }}
            </v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </v-defaults-provider>
</template>

<script>
import FormGenerator from '@/components/graphqlFormGenerator/FormGenerator.vue'
import EditRuntimeForm from '@/components/graphqlFormGenerator/EditRuntimeForm.vue'
import Markdown from '@/components/Markdown.vue'
import {
  getMutationShortDesc,
  getMutationExtendedDesc,
  mutationStatus
} from '@/utils/aotf'
import { mdiClose } from '@mdi/js'
import { useDynamicVuetifyDefaults } from '@/plugins/vuetify'

export default {
  name: 'mutation',

  components: {
    EditRuntimeForm,
    FormGenerator,
    Markdown
  },

  emits: [
    'close',
    'success',
  ],

  props: {
    mutation: {
      // graphql mutation object as returned by introspection query
      type: Object,
      required: true
    },
    cylcObject: {
      // data store node
      type: Object,
      required: true
    },
    types: {
      // list of all graphql types as returned by introspection query
      // (required for resolving InputType objects
      type: Array
    },
    initialData: {
      type: Object,
      required: false,
      default: () => {}
    },
  },

  setup () {
    const vuetifyDefaults = useDynamicVuetifyDefaults()

    return {
      vuetifyDefaults,
    }
  },

  data: () => ({
    isValid: false,
    submitting: false,
    warningMsg: null
  }),

  computed: {
    /* Return the first line of the description. */
    shortDescription () {
      return getMutationShortDesc(this.mutation.description)
    },
    /* Return the subsequent lines of the description */
    extendedDescription () {
      return getMutationExtendedDesc(this.mutation.description)
    },
    showWarning: {
      get () {
        return Boolean(this.warningMsg)
      },
      set (val) {
        if (!val) this.warningMsg = null
      }
    }
  },

  methods: {
    close () {
      this.$emit('close')
    },

    /* Execute the GraphQL mutation */
    submit () {
      this.submitting = true
      this.$refs.form.submit().then(response => {
        this.submitting = false
        if (response.status === mutationStatus.SUCCEEDED) {
          // Close the form on success
          this.close()
          this.$emit('success')
        } else if (response.status === mutationStatus.WARN) {
          this.warningMsg = response.message
        }
        // else if error, an alert is generated by AOTF
      })
    },
  },

  // Misc options
  icons: {
    close: mdiClose
  }
}
</script>

<style scoped>
.card-text{
  overflow-y:auto
}
</style>
