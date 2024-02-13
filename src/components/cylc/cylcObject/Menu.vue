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
    <component :is="menuTransition" :target="target">
      <v-card
        ref="menuContent"
        v-if="node"
        v-show="showMenu"
        @show-mutations-menu="showMutationsMenu"
        :key="node.id"
        v-click-outside="{ handler: onClickOutside, closeConditional: () => !dialog }"
        class="c-mutation-menu elevation-10 overflow-y-auto"
        max-height="90vh"
        width="max-content"
        max-width="min(600px, 100%)"
        theme="dark"
        position="absolute"
        :style="{
          left: `${x}px`,
          top: `${y}px`,
          // Set transition origin relative to clicked target:
          '--v-overlay-anchor-origin': 'bottom right',
        }"
      >
        <v-card-title class="pb-1 pt-3">
          {{ node.id }}
        </v-card-title>
        <v-card-subtitle class="pt-0 pb-2">
          {{ typeAndStatusText }}
        </v-card-subtitle>
        <v-divider v-if="primaryMutations.length || displayMutations.length" />
        <v-skeleton-loader
          v-if="isLoadingMutations && primaryMutations.length"
          type="list-item-avatar-two-line@3"
          min-width="400"
          class="my-2"
          data-cy="skeleton"
        />
        <v-list
          v-if="displayMutations.length"
          class="c-mutation-menu-list pt-0"
          :lines="false"
        >
          <v-list-item
            v-for="{ mutation, requiresInfo, authorised } in displayMutations"
            :key="mutation.name"
            :disabled="isDisabled(mutation, authorised)"
            @click.stop="enact(mutation, requiresInfo)"
            class="c-mutation py-2 pr-2"
            :title="mutation._title"
            :subtitle="mutation._shortDescription"
          >
            <template v-slot:prepend>
              <v-icon
                :icon="mutation._icon"
                size="large"
              />
            </template>
            <template v-slot:append>
              <v-btn
                icon
                variant="text"
                :disabled="isEditable(authorised, mutation)"
                @click.stop="openDialog(mutation)"
                data-cy="mutation-edit"
                class="ml-2"
              >
                <v-icon>{{ $options.icons.mdiPencil }}</v-icon>
              </v-btn>
            </template>
          </v-list-item>
          <v-list-item v-if="canExpand">
            <v-btn
              id="less-more-button"
              @click="expandCollapse"
              block
              variant="tonal"
            >
              {{ expanded ? 'See Less' : 'See All' }}
            </v-btn>
          </v-list-item>
        </v-list>
      </v-card>
    </component>
    <v-dialog
      v-if="dialogMutation"
      v-model="dialog"
      width="700px"
      max-width="100%"
      content-class="c-mutation-dialog mx-0"
      persistent
      no-click-animation
    >
      <Mutation
        :mutation="dialogMutation"
        :cylcObject="node"
        :initialData="initialData(dialogMutation, node.tokens)"
        @close="closeDialog"
        @success="closeMenu"
        :types="types"
        :key="dialogKey /* Enables re-render of component each time dialog opened */"
        ref="mutationComponent"
      />
    </v-dialog>
  </div>
</template>

<script>
import { computed, nextTick } from 'vue'
import {
  filterAssociations,
  getMutationArgsFromTokens,
  mutate
} from '@/utils/aotf'
import { useReducedAnimation } from '@/composables/localStorage'
import Mutation from '@/components/cylc/Mutation.vue'
import {
  mdiPencil
} from '@mdi/js'
import { mapGetters, mapState } from 'vuex'
import WorkflowState from '@/model/WorkflowState.model'
import { VDialogTransition } from 'vuetify/components/transitions'

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

  setup () {
    const reducedAnimation = useReducedAnimation()
    return {
      menuTransition: computed(
        () => reducedAnimation.value ? 'slot' : VDialogTransition
      ),
    }
  },

  data () {
    return {
      dialog: false,
      dialogMutation: null,
      dialogKey: false,
      expanded: false,
      node: null,
      workflowStatus: null,
      mutations: [],
      isLoadingMutations: true,
      showMenu: false,
      types: [],
      x: 0,
      y: 0,
      target: null,
    }
  },

  mounted () {
    this.$eventBus.on('show-mutations-menu', this.showMutationsMenu)
    document.addEventListener('keydown', this.onKeydown)
  },

  beforeUnmount () {
    this.$eventBus.off('show-mutations-menu', this.showMutationsMenu)
    document.removeEventListener('keydown', this.onKeydown)
  },

  computed: {
    ...mapGetters('workflows', ['getNodes']),

    primaryMutations () {
      return this.$workflowService.primaryMutations[this.node.type] || []
    },

    canExpand () {
      return this.primaryMutations.length && this.mutations.length > this.primaryMutations.length
    },

    ...mapState('user', ['user']),

    displayMutations () {
      if (!this.mutations.length) {
        return []
      }
      const shortList = this.primaryMutations
      if (!this.expanded && shortList.length) {
        return this.mutations
          .filter(x => shortList.includes(x.mutation.name) && !this.isDisabled(x.mutation, true))
          // sort by definition order
          .sort(
            (x, y) => shortList.indexOf(x.mutation.name) - shortList.indexOf(y.mutation.name)
          )
      }
      return this.mutations
    },

    typeAndStatusText () {
      if (!this.node) {
        // can happen briefly when switching workflows
        return
      }
      let ret = this.node.type
      if (this.node.type !== 'cycle') {
        // NOTE: cycle point nodes don't have associated node data at present
        ret += ' - '
        if (this.node.type === 'workflow') {
          ret += this.node.node.statusMsg || 'state unknown'
        } else {
          ret += this.node.node.state || 'state unknown'
          if (this.node.node.isHeld) {
            ret += ' (held)'
          }
          if (this.node.node.isQueued) {
            ret += ' (queued)'
          }
          if (this.node.node.isRunahead) {
            ret += ' (runahead)'
          }
        }
      }
      return ret
    },
  },

  methods: {
    isEditable (authorised, mutation) {
      if (mutation.name === 'log' || this.isDisabled(mutation, authorised)) {
        return true
      } else {
        return false
      }
    },
    isDisabled (mutation, authorised) {
      if (this.node.type !== 'workflow') {
        const nodeReturned = this.getNodes(
          'workflow', [this.node.tokens.workflowID])
        if (nodeReturned.length) {
          this.workflowStatus = nodeReturned[0].node.status
        } else { this.workflowStatus = WorkflowState.RUNNING.name }
      } else {
        this.workflowStatus = this.node.node.status
      }
      if (
        (!mutation._validStates.includes(this.workflowStatus)) ||
          !authorised) {
        return true
      }
      return false
    },
    openDialog (mutation) {
      if (mutation.name === 'log') {
        this.$eventBus.emit(
          'add-view',
          {
            name: 'Log',
            initialOptions: {
              relativeID: this.node.tokens.relativeID || null
            }
          }
        )
        this.showMenu = false
        return
      }

      this.dialog = true
      this.dialogMutation = mutation
      // Tell Vue to re-render the dialog component:
      this.dialogKey = !this.dialogKey
    },

    closeMenu () {
      this.showMenu = false
      this.expanded = false
    },

    closeDialog () {
      this.dialog = false
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
      this.closeMenu()
      if (e.target?.getAttribute('data-c-interactive')) {
        this.showMenu = true
      }
    },

    onKeydown (e) {
      if (!this.dialog && e.key === 'Escape') {
        this.closeMenu()
      }
    },

    expandCollapse () {
      this.expanded = !this.expanded
      this.reposition()
    },

    /**
     * Place the menu in a way that prevents it overflowing off screen and
     * so it takes up the full width as needed on narrow viewports.
     *
     * @param {number} x - preferred x coordinate
     * @param {number} y - preferred y coordinate
     */
    reposition (x = null, y = null) {
      x ??= this.x
      y ??= this.y
      nextTick(() => {
        this.x = x + this.$refs.menuContent.$el.clientWidth > document.body.clientWidth
          ? document.body.clientWidth - this.$refs.menuContent.$el.clientWidth
          : x
        this.y = y + this.$refs.menuContent.$el.clientHeight > document.body.clientHeight
          ? document.body.clientHeight - this.$refs.menuContent.$el.clientHeight - 5
          : y
      })
    },

    /* Call a mutation using only the tokens for args. */
    callMutationFromContext (mutation) {
      // eslint-disable-next-line no-console
      console.debug(`mutation: ${mutation._title} ${this.node.id}`)
      mutate(
        mutation,
        getMutationArgsFromTokens(mutation, this.node.tokens),
        this.$workflowService.apolloClient
      )
      this.showMenu = false
    },

    showMutationsMenu ({ node, event }) {
      this.target = event.target
      this.node = node
      this.showMenu = true
      this.reposition(event.clientX, event.clientY)
      // await graphql query to get mutations
      this.$workflowService.introspection.then(({ mutations, types }) => {
        // if mutations are slow to load then there will be a delay before they are reactively
        // displayed in the menu (this is what the skeleton-loader is for)
        this.isLoadingMutations = false
        this.types = types
        let type = this.node.type
        if (type === 'family') {
          // show the same mutation list for families as for tasks
          type = 'task'
        }
        this.mutations = filterAssociations(
          type,
          this.node.tokens,
          mutations,
          this.user.permissions
        ).sort(
          (a, b) => a.mutation.name.localeCompare(b.mutation.name)
        )
        this.reposition(event.clientX, event.clientY)
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
  },

  icons: {
    mdiPencil,
  },
}
</script>
