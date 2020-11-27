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
  <div class="c-mutation">
    <!-- dropdown menu -->
    <v-menu
      v-model="showMenu"
      :position-x="x"
      :position-y="y"
      v-on:show-mutations-menu="showMutationsMenu"
      offset-y
      :disabled="!interactive"
    >
      <v-list dense dark>
        <v-subheader>
          <h2>
            {{id}}
          </h2>
        </v-subheader>
        <v-list-item-group
          color="primary"
          v-if="mutations"
        >
          <v-list-item two-line
            v-for="[mutation, requiresInfo] in mutations"
            :key="mutation.name"
            @click.stop="enact(mutation, requiresInfo)"
          >
            <!--@click="callMutationFromContext(mutation)"-->
            <v-list-item-icon>
              <div style="font-size:0.5rem;">
                <v-icon medium>{{ mutation._icon }}</v-icon>
              </div>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                <span>{{mutation._title}}</span>
              </v-list-item-title>
              <v-list-item-subtitle>
                <span>{{mutation._shortDescription}}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
            <!-- This is how to add buttons for standard operations later -->
            <v-list-item-action>
              <v-btn
                small rounded
                color="primary"
                dark
                @click.stop="openDialog(mutation)"
              >
                Edit
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>
    <v-dialog
      v-model="dialog"
      max-width="500"
      v-if="dialogMutation"
    >
      <Mutation
        :mutation="dialogMutation"
        :initialData="initialData(dialogMutation, tokens)"
        :cancel="closeDialog"
        :types="types"
        ref="mutationComponent"
      />
    </v-dialog>
  </div>
</template>

<script>
import {
  getMutationArgsFromTokens,
  mutate
} from '@/utils/aotf'
import Mutation from '@/components/cylc/Mutation'

export default {
  name: 'CylcObjectMenu',

  components: {
    Mutation
  },

  props: {
    interactive: {
      type: Boolean,
      required: false,
      default: true
    }
  },

  data () {
    return {
      showMenu: false,
      id: '',
      mutations: [],
      tokens: [],
      x: 0,
      y: 0,
      dialog: false,
      dialogMutation: null,
      types: []
    }
  },

  mounted () {
    this.$eventBus.on('show-mutations-menu', this.showMutationsMenu)
  },

  beforeDestroy () {
    this.$eventBus.off('show-mutations-menu', this.showMutationsMenu)
  },

  methods: {
    openDialog (mutation) {
      this.dialog = mutation
      this.dialogMutation = mutation
    },

    closeDialog () {
      this.dialog = null
      this.dialogMutation = null
    },

    /* Call a mutation using only the tokens for args. */
    callMutationFromContext (mutation) {
      // eslint-disable-next-line no-console
      console.debug(`mutation: ${mutation._title} ${this.id}`)
      mutate(
        mutation,
        getMutationArgsFromTokens(mutation, this.tokens),
        this.$workflowService.apolloClient
      )
      this.showMenu = false
    },

    showMutationsMenu ({ id, types, tokens, mutations, event }) {
      this.id = id
      this.types = types
      this.tokens = tokens
      this.mutations = mutations
      this.x = event.clientX
      this.y = event.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },

    initialData (mutation, tokens) {
      return getMutationArgsFromTokens(mutation, tokens)
    },

    enact (mutation, requiresInfo) {
      if (requiresInfo) {
        this.openDialog(mutation)
      } else {
        this.callMutationFromContext(mutation)
      }
    }
  }
}
</script>
