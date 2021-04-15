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
  <div class="c-mutation-menu-holder">
    <!-- dropdown menu -->
    <v-menu
      offset-y
      class="c-mutation-menu"
      v-model="showMenu"
      :position-x="x"
      :position-y="y"
      v-on:show-mutations-menu="showMutationsMenu"
      :disabled="!interactive"
      @input="closeMenu"
    >
      <v-list
        dark
        class="c-mutation-menu-list"
      >
        <v-list-item
          v-for="[mutation, requiresInfo] in displayMutations"
          :key="mutation.name"
          @click.stop="enact(mutation, requiresInfo)"
          class="c-mutation"
        >
          <v-list-item-avatar>
            <v-icon large>{{ mutation._icon }}</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-html="mutation._title" />
            <!--
            don't use v-list-item-description here, vuetify will standardise
            line heights and cuts off text that overspills this way we can
            have the required number of lines of text
            -->
            <span class="c-description">{{ mutation._shortDescription }}</span>
          </v-list-item-content>
          <v-list-item-action>
            <v-icon
             medium
             class="float-right"
             @click.stop="openDialog(mutation)"
            >
              {{ icons.pencil }}
            </v-icon>
          </v-list-item-action>
        </v-list-item>
        <v-list-item
          v-if="canExpand"
        >
          <v-list-item-content
            @click="expandCollapse"
            @click.stop.prevent
          >
            <v-btn
              rounded
            >
              {{ expanded ? 'See Less' : 'See More' }}
            </v-btn>
          </v-list-item-content>
        </v-list-item>
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
import {
  mdiPencil
} from '@mdi/js'

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
      allMutations: [],
      dialog: false,
      dialogMutation: null,
      expanded: false,
      id: '',
      mutations: [],
      showMenu: false,
      tokens: [],
      types: [],
      x: 0,
      y: 0,
      icons: {
        pencil: mdiPencil
      }
    }
  },

  mounted () {
    this.$eventBus.on('show-mutations-menu', this.showMutationsMenu)
  },

  beforeDestroy () {
    this.$eventBus.off('show-mutations-menu', this.showMutationsMenu)
  },

  computed: {
    canExpand () {
      if (!this.mutations) {
        return false
      }
      if (this.$workflowService.primaryMutations[this.type]) {
        return true
      }
      return false
    },

    displayMutations () {
      if (!this.mutations) {
        return []
      }
      const shortList = this.$workflowService.primaryMutations[this.type]
      if (!this.expanded && shortList) {
        return this.mutations.filter(
          (x) => {
            return shortList.includes(x[0].name)
          }
        ).sort(
          (x, y) => {
            return shortList.indexOf(x[0].name) - shortList.indexOf(y[0].name)
          }
        )
      }
      return this.mutations
    }
  },

  methods: {
    openDialog (mutation) {
      this.dialog = mutation
      this.dialogMutation = mutation
    },

    closeMenu () {
      this.expanded = false
    },

    closeDialog () {
      this.dialog = null
      this.dialogMutation = null
    },

    expandCollapse () {
      this.expanded = !this.expanded
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

    showMutationsMenu ({ id, type, types, tokens, mutations, event }) {
      this.id = id
      this.type = type
      this.types = types
      this.tokens = tokens
      this.mutations = mutations.sort(
        (a, b) => a[0].name.localeCompare(b[0].name)
      )
      this.x = event.clientX
      this.y = event.clientY
      this.$nextTick(() => {
        this.showMenu = true
        if (this.$refs && this.$refs.mutationComponent) {
          // reset the mutation component if present
          // (this is because we re-use the same component)
          this.$refs.mutationComponent.reset()
        }
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
