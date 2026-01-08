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
    class="c-mutation"
    variant="flat"
  >
    <!-- the mutation title -->
    <template v-slot:title>
      {{ mutation._title }}
    </template>

    <!-- the open in new tab button -->
    <template v-slot:append v-if="!isView">
      <v-icon
        v-if="mutation.name !== 'editRuntime'"
        data-cy="open-in-new-tab"
        @click="openInTab"
      >
        {{ $options.icons.mdiOpenInNew }}
      </v-icon>
      <v-tooltip>
        Open in new tab
      </v-tooltip>
    </template>

    <v-card-text class="card-text py-0 px-4">
      <!-- Have to repeat these defaults as the ones set in App.vue don't make it through
      the parent v-dialog - see https://github.com/vuetifyjs/vuetify/issues/18123 -->
      <v-defaults-provider :defaults="vuetifyDefaults">
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

        <!-- the form -->
        <v-divider />
        <EditRuntimeForm
          v-if="mutation.name === 'editRuntime'"
          v-bind="{
            cylcObject,
            types,
            data,
          }"
          ref="form"
          v-model="isValid"
        />
        <FormGenerator
          v-else
          v-bind="{
            mutation,
            types,
            data,
            initialData,
          }"
          ref="form"
          v-model="isValid"
        />
      </v-defaults-provider>
    </v-card-text>

    <!-- the actions -->
    <v-card-actions class="pa-3">
      <v-spacer></v-spacer>
      <v-btn
        color="grey"
        @click="close()"
        variant="text"
        data-cy="cancel"
        v-if="!isView"
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
import Markdown from '@/components/Markdown.vue'
import {
  getMutationShortDesc,
  getMutationExtendedDesc,
  mutationStatus
} from '@/utils/aotf'
import { mdiClose, mdiOpenInNew } from '@mdi/js'
import { useDynamicVuetifyDefaults } from '@/plugins/vuetify'
import { inputDefaults } from '@/components/graphqlFormGenerator/components/vuetify'
import { eventBus } from '@/services/eventBus'
import { store } from '@/store/index'
import { Alert } from '@/model/Alert.model'
import { cloneDeep } from 'lodash-es'

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
    initialOptions: {
      type: Object,
      required: true,
    },
    /** ID of widget if the log view is in a Lumino tab. */
    widgetID: {
      type: String,
      required: false,
      default: null,
    },
  },

  setup (props) {
    const vuetifyDefaults = useDynamicVuetifyDefaults(inputDefaults)

    if (props.initialOptions.isView) {
      // set the tab title to something informative
      eventBus.emit(
        `lumino:update-tab:${props.widgetID}`,
        { title: `Command: ${props.initialOptions.mutation._title}` },
      )
    }

    return {
      vuetifyDefaults,

      // properties extracted from initialOptions...

      // graphql mutation object as returned by introspection query
      mutation: props.initialOptions.mutation,

      // data store node
      cylcObject: props.initialOptions.cylcObject,

      // list of all graphql types as returned by introspection query
      // (required for resolving InputType objects
      types: props.initialOptions.types,

      // the form data
      data: props.initialOptions.data,

      // make a copy of the form data so we can reset edits on request later
      initialData: props.initialOptions.initialData || cloneDeep(props.initialOptions.data),

      // true if this view is open in a Lumino tab
      isView: props.initialOptions.isView || false,
    }
  },

  data: () => ({
    isValid: false,
    submitting: false,
    warningMsg: null,
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
    async submit () {
      this.submitting = true
      this.$refs.form.submit().then(async response => {
        this.submitting = false
        if (response.status === mutationStatus.SUCCEEDED) {
          if (this.isView) {
            // form is open in a tab -> provide an alert to let the user know
            // the command succeeded
            await store.dispatch(
              'setAlert',
              new Alert('Command succeeded', 'green')
            )
          } else {
            // form is open in a dialogue -> close the form on success
            this.close()
            this.$emit('success')
          }
        } else if (response.status === mutationStatus.WARN) {
          this.warningMsg = response.message
        }
        // else if error, an alert is generated by AOTF
      })
    },

    openInTab () {
      // Navigate to the corresponding workflow then open the log view
      // (no nav occurs if already on the correct workflow page)
      this.$router.push({
        name: 'Workspace',
        params: {
          workflowName: this.cylcObject.tokens.workflow
        }
      }).then(() => {
        // open the command editor in a new tab
        // (re-initialises this component preserving state)
        eventBus.emit(
          'add-view',
          {
            name: 'Command',
            initialOptions: {
              ...this.initialOptions,
              initialData: this.initialData,
              isView: true,
            },
          }
        )

        // and close this menu
        this.close()
        this.$emit('success')
      })
    },
  },

  // Misc options
  icons: {
    close: mdiClose,
    mdiOpenInNew,
  }
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
