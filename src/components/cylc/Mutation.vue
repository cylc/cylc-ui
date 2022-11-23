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
    <v-card
      class="mx-auto d-inline-block"
      style="padding: 1em;"
      outlined
    >
      <!-- the mutation title -->
      <h3
      style="text-transform: capitalize;"
      >
        {{ mutation._title }}
      </h3>

      <!-- the mutation description -->
      <v-expansion-panels
      accordion
      flat
      v-bind="extendedDescription ? { hover: true } : { readonly: true }"
      >
        <v-expansion-panel
          class="mutation-desc"
        >
          <v-expansion-panel-header
            v-bind="extendedDescription ? {} : {
              expandIcon: null,
              style: {
                cursor: 'default'
              }
            }"
          >
            <Markdown :markdown="shortDescription"/>
          </v-expansion-panel-header>
          <v-expansion-panel-content
            v-if="extendedDescription"
          >
            <Markdown :markdown="extendedDescription"/>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-divider/>
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
      <br />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          @click="cancel()"
          text
          data-cy="cancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="orange"
          @click="$refs.form.reset()"
          text
          data-cy="reset"
        >
          Reset
        </v-btn>
        <v-tooltip
          top
          color="error"
          :disabled="isValid"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              text
              :color="isValid ? 'primary' : 'error'"
              @click="submit"
              :loading="submitting"
              v-bind="attrs"
              v-on="on"
              data-cy="submit"
            >
              Submit
            </v-btn>
          </template>
          <span>Form contains invalid or missing values!</span>
        </v-tooltip>
      </v-card-actions>
      <v-snackbar
        v-model="showSnackbar"
        v-bind="snackbarProps"
        data-cy="response-snackbar"
      >
        {{ response.msg }}
        <template v-slot:action="{ attrs }">
          <v-btn
            @click="showSnackbar = false"
            icon
            v-bind="attrs"
            data-cy="snackbar-close"
          >
            <v-icon>
              {{ $options.icons.close }}
            </v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </v-card>
</template>

<script>
import FormGenerator from '@/components/graphqlFormGenerator/FormGenerator.vue'
import EditRuntimeForm from '@/components/graphqlFormGenerator/EditRuntimeForm.vue'
import Markdown from '@/components/Markdown'
import {
  getMutationShortDesc,
  getMutationExtendedDesc
} from '@/utils/aotf'
import { mdiClose } from '@mdi/js'

export default {
  name: 'mutation',

  components: {
    EditRuntimeForm,
    FormGenerator,
    Markdown
  },

  props: {
    mutation: {
      // graphql mutation object as returned by introspection query
      type: Object,
      required: true
    },
    cylcObject: {
      // { id, isFamily }
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
    cancel: {
      type: Function,
      required: true
    }
  },

  data: () => ({
    isValid: false,
    submitting: false,
    response: {
      msg: null,
      level: 'warn'
    }
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
    showSnackbar: {
      get () {
        return Boolean(this.response.msg)
      },
      set (val) {
        if (!val) this.response.msg = null
      }
    },
    snackbarProps () {
      return this.response.level === 'error'
        ? {
          timeout: -1,
          color: 'red accent-2',
          dark: true
        }
        : {
          timeout: 4e3,
          color: 'amber accent-2',
          light: true
        }
    }
  },

  methods: {
    /* Execute the GraphQL mutation */
    submit () {
      this.submitting = true
      this.$refs.form.submit().then(response => {
        this.submitting = false
        if (response.status.name.includes('failed')) {
          this.response.msg = response.message
          this.response.level = 'error'
        } else if (response.status.name === 'warn') {
          this.response.msg = response.message
          this.response.level = 'warn'
        } else {
          // Close the form on success
          this.cancel()
        }
      })
    }
  },

  // Misc options
  icons: {
    close: mdiClose
  }
}
</script>
