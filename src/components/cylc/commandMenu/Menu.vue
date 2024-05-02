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
      v-if="node"
      :key="target.dataset.cInteractive"
      v-model="showMenu"
      :target="target"
      :close-on-content-click="false"
      content-class="c-mutation-menu"
      max-width="600px"
      theme="dark"
    >
      <v-card>
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
                :disabled="!isEditable(mutation, authorised)"
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
              @click="() => expanded = !expanded"
              block
              variant="tonal"
            >
              {{ expanded ? 'See Less' : 'See All' }}
            </v-btn>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
    <v-dialog
      v-if="dialogMutation"
      v-model="dialog"
      width="700px"
      max-width="100%"
      content-class="c-mutation-dialog mx-0"
    >
      <Mutation
        :mutation="dialogMutation"
        :cylcObject="node"
        :initialData="initialData(dialogMutation, node.tokens)"
        @close="() => dialog = false"
        @success="() => showMenu = false"
        :types="types"
        :key="dialogKey /* Enables re-render of component each time dialog opened */"
        ref="mutationComponent"
      />
    </v-dialog>
  </div>
</template>

<script>
import { nextTick } from 'vue'
import {
  filterAssociations,
  getMutationArgsFromTokens,
  mutate
} from '@/utils/aotf'
import Mutation from '@/components/cylc/Mutation.vue'
import {
  mdiPencil
} from '@mdi/js'
import { mapGetters, mapState } from 'vuex'
import WorkflowState from '@/model/WorkflowState.model'
import { eventBus } from '@/services/eventBus'

export default {
  name: 'CommandMenu',

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
      dialogKey: false,
      expanded: false,
      node: null,
      mutations: [],
      isLoadingMutations: true,
      showMenu: false,
      types: [],
      target: null,
    }
  },

  mounted () {
    eventBus.on('show-mutations-menu', this.showMutationsMenu)
  },

  beforeUnmount () {
    eventBus.off('show-mutations-menu', this.showMutationsMenu)
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
          ret += this.node.node.statusMsg || this.node.node.status || 'state unknown'
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
    isEditable (mutation, authorised) {
      return mutation.name !== 'log' && mutation.name !== 'info' && !this.isDisabled(mutation, authorised)
    },
    isDisabled (mutation, authorised) {
      if (!authorised) {
        return true
      }
      let status = this.node.node?.status
      if (this.node.type !== 'workflow') {
        const nodeReturned = this.getNodes('workflow', [this.node.tokens.workflowID])
        status = nodeReturned.length
          ? nodeReturned[0].node.status
          : WorkflowState.RUNNING.name
      }
      return !mutation._validStates.includes(status)
    },
    openDialog (mutation) {
      this.dialog = true
      this.dialogMutation = mutation
      // Tell Vue to re-render the dialog component:
      this.dialogKey = !this.dialogKey
    },

    /* Call a mutation using only the tokens for args. */
    callMutationFromContext (mutation) {
      this.showMenu = false
      // eslint-disable-next-line no-console
      console.debug(`mutation: ${mutation._title} ${this.node.id}`)

      if (mutation.name === 'log') {
        // Navigate to the corresponding workflow then open the log view
        // (no nav occurs if already on the correct workflow page)
        this.$router.push({
          name: 'Workspace',
          params: {
            workflowName: this.node.tokens.workflow
          }
        }).then(() => {
          eventBus.emit(
            'add-view',
            {
              name: 'Log',
              initialOptions: {
                relativeID: this.node.tokens.relativeID || null
              }
            }
          )
        })
      } else if (mutation.name === 'info') {
        this.$router.push({
          name: 'Workspace',
          params: {
            workflowName: this.node.tokens.workflow
          }
        }).then(() => {
          eventBus.emit(
            'add-view',
            {
              name: 'Info',
              initialOptions: {
                requestedTokens: this.node.tokens || undefined
              }
            }
          )
        })
      } else {
        mutate(
          mutation,
          getMutationArgsFromTokens(mutation, this.node.tokens),
          this.$workflowService.apolloClient
        )
      }
    },

    async showMutationsMenu ({ node, target }) {
      this.target = target
      this.node = node
      this.expanded = false
      // show the menu after it's rendered to ensure animation works properly
      await nextTick()
      this.showMenu = true
      // ensure graphql query to get mutations has completed
      const { mutations, types } = await this.$workflowService.introspection
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
