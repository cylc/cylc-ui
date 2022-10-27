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
  <div>
    <!-- dropdown menu -->
    <v-menu
      offset-y
      content-class="c-mutation-menu"
      v-model="showMenu"
      :position-x="x"
      :position-y="y"
      @show-mutations-menu="showMutationsMenu"
      :disabled="!interactive"
      :close-on-content-click="false"
      :close-on-click="false"
      v-click-outside="{ handler: onClickOutside, include: clickOutsideInclude }"
      dark
    >
      <!-- NOTE: because the `attach` prop is not true, the actual DOM element
      containing the stuff below is not the `.v-menu` div, but a completely
      separate `.v-menu__content` div created by vuetify
      (the `.v-menu` div is actually empty). -->
      <v-card ref="menuContent">
        <v-card-title class="text-h6">
          {{ id }}
        </v-card-title>
        <v-card-subtitle>
          {{ typeAndStatusText }}
        </v-card-subtitle>
        <v-divider v-if="primaryMutations.length || displayMutations.length"></v-divider>
        <v-skeleton-loader
          v-if="isLoadingMutations && primaryMutations.length"
          type="list-item-avatar-two-line@3"
          min-width="400"
        >
        </v-skeleton-loader>
        <v-list
          v-if="displayMutations.length"
          class="c-mutation-menu-list"
        >
          <v-list-item
            v-for="{ mutation, requiresInfo, authorised } in displayMutations"
            :key="mutation.name"
            :disabled=!authorised
            @click.stop="enact(mutation, requiresInfo)"
            class="c-mutation"
          >
            <v-list-item-avatar>
              <v-icon :disabled=!authorised large>{{ mutation._icon }}</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ mutation._title }}</v-list-item-title>
              <!--
              don't use v-list-item-description here, vuetify will standardise
              line heights and cuts off text that overspills this way we can
              have the required number of lines of text.
              -->
              <span class="c-description">{{ mutation._shortDescription }}</span>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                icon
                :disabled=!authorised
                x-large
                class="float-right"
                @click.stop="openDialog(mutation)"
                data-cy="mutation-edit"
              >
                <v-icon>{{ icons.pencil }}</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-list-item
            v-if="canExpand"
          >
            <v-list-item-content
              @click="expandCollapse"
              @click.stop.prevent
            >
              <v-btn id="less-more-button"
                rounded
              >
                {{ expanded ? 'See Less' : 'See More' }}
              </v-btn>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
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
  filterAssociations,
  getMutationArgsFromTokens,
  getType,
  mutate,
  tokenise
} from '@/utils/aotf'
import Mutation from '@/components/cylc/Mutation'
import {
  mdiPencil
} from '@mdi/js'
import { mapState } from 'vuex'

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
      dialog: false,
      dialogMutation: null,
      expanded: false,
      id: '',
      node: {},
      mutations: [],
      isLoadingMutations: true,
      showMenu: false,
      tokens: [],
      types: [],
      type: '',
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
    primaryMutations () {
      return this.$workflowService.primaryMutations[this.type] || []
    },
    canExpand () {
      return this.primaryMutations.length && this.mutations.length > this.primaryMutations.length
    },
    ...mapState('user', ['user']),
    displayMutations () {
      if (!this.mutations.length || this.user.permissions.length < 2) {
        return []
      }
      const shortList = this.primaryMutations
      if (!this.expanded && shortList.length) {
        return this.mutations.filter(
          x => shortList.includes(x.mutation.name)
        ).sort(
          (x, y) => shortList.indexOf(x.mutation.name) - shortList.indexOf(y.mutation.name)
        )
      }
      return this.mutations
    },
    typeAndStatusText () {
      let ret = this.type
      if (ret === 'task' && !('isHeld' in this.node)) {
        // TODO: better way of checking if a 'task' is actually a family?
        ret = 'family'
      }
      ret += ' - '
      if (this.type === 'workflow') {
        ret += this.node.statusMsg || 'state unknown'
      } else {
        ret += this.node.state || 'state unknown'
        if (this.node.isHeld) {
          ret += ' (held)'
        }
        if (this.node.isQueued) {
          ret += ' (queued)'
        }
        if (this.node.isRunahead) {
          ret += ' (runahead)'
        }
      }
      return ret
    }
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

    /**
     * Handler for clicking outside menu (close it).
     *
     * We override vuetify default handling because we don't want to
     * close when clicking on another cylc object.
     *
     * @param {Event} e - the click event
     */
    onClickOutside (e) {
      this.showMenu = false
      this.expanded = false
      if (e.target?.classList.contains('c-interactive')) {
        this.$nextTick(() => {
          // Wait until next tick so that the menu briefly closes + reopens
          // giving more indication to user that it has changed
          this.showMenu = true
        })
      }
    },

    /**
     * Return array of elements that count as "inside" for the
     * close-on-click-outside functionality.
     *
     * @returns {Array<HTMLElement>}
     */
    clickOutsideInclude () {
      // Need this to tell vuetify what the actual content DOM element is
      // instead of the empty `this.$el` (see note at top).
      const el = this.$refs.menuContent?.$el
      // (Return empty array if element not yet loaded)
      return el ? [el] : []
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

    showMutationsMenu ({ id, node, event }) {
      this.id = id
      this.tokens = tokenise(id)
      this.type = getType(this.tokens)
      this.node = node.node
      this.x = event.clientX
      this.y = event.clientY
      // await graphql query to get mutations
      this.$workflowService.mutationsAndTypes.then(({ mutations, types }) => {
        // if mutations are slow to load then there will be a delay before they are reactively
        // displayed in the menu (this is what the skeleton-loader is for)
        this.isLoadingMutations = false
        this.types = types
        this.mutations = filterAssociations(
          this.type,
          this.tokens,
          mutations,
          this.user.permissions
        ).sort(
          (a, b) => a.mutation.name.localeCompare(b.mutation.name)
        )
      })
      this.$nextTick(() => {
        this.showMenu = true
        // reset the mutation component if present
        // (this is because we re-use the same component)
        this.$refs?.mutationComponent?.reset()
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
