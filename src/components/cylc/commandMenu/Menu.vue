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
      <v-card-title class="text-title-medium pb-1 pt-3">
        {{ title }}
        <CopyBtn :text="title"/>
      </v-card-title>
      <v-card-subtitle class="pb-2">
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
          class="c-mutation-menu-item py-2 pr-2"
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
              <v-icon>{{ mdiPencil }}</v-icon>
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
    <v-dialog
      v-if="dialogMutation"
      v-model="dialog"
      :width="dialogMutation._dialogWidth ?? '700px'"
      max-width="100%"
      theme="light"
      content-class="c-mutation-dialog mx-0"
    >
      <Mutation
        :initialOptions="{
          mutation: dialogMutation,
          cylcObject: node,
          data: initialData(dialogMutation, node.tokens),
          types: types,
        }"
        @close="() => dialog = false"
        @success="() => showMenu = false"
        :key="dialogKey /* Enables re-render of component each time dialog opened */"
      />
    </v-dialog>
  </v-menu>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import {
  filterAssociations,
  getMutationArgsFromTokens,
  mutate,
} from '@/utils/aotf'
import Mutation from '@/components/cylc/Mutation.vue'
import {
  mdiPencil,
} from '@mdi/js'
import WorkflowState from '@/model/WorkflowState.model'
import { eventBus } from '@/services/eventBus'
import CopyBtn from '@/components/core/CopyBtn.vue'
import { upperFirst } from 'lodash-es'
import { formatFlowNums } from '@/utils/tasks'
import { getLogFileForNode } from '@/model/JobState.model'
import { useUserService } from '@/services/user.service'

const router = useRouter()
const store = useStore()
const workflowService = inject('workflowService')

const { user } = useUserService()

const dialog = ref(false)
const dialogMutation = ref(null)
const dialogKey = ref(false)
const expanded = ref(false)
const node = ref(null)
const mutations = ref([])
const isLoadingMutations = ref(true)
const showMenu = ref(false)
const types = ref([])
const target = ref(null)

onMounted(() => {
  eventBus.on('show-mutations-menu', showMutationsMenu)
})

onBeforeUnmount(() => {
  eventBus.off('show-mutations-menu', showMutationsMenu)
})

const getNodes = store.getters['workflows/getNodes']

const primaryMutations = computed(() => {
  return workflowService.primaryMutations[node.value.type] || []
})

const canExpand = computed(() => {
  return primaryMutations.value.length && mutations.value.length > primaryMutations.value.length
})

const displayMutations = computed(() => {
  if (!mutations.value.length) {
    return []
  }
  const shortList = primaryMutations.value
  if (!expanded.value && shortList.length) {
    return mutations.value
      .filter(x => shortList.includes(x.mutation.name) && !isDisabled(x.mutation, true))
    // sort by definition order
      .sort(
        (x, y) => shortList.indexOf(x.mutation.name) - shortList.indexOf(y.mutation.name)
      )
  }
  return mutations.value
})

const title = computed(() => {
  return node.value.tokens.clone({ user: undefined }).id
})

const typeAndStatusText = computed(() => {
  if (!node.value) {
    // can happen briefly when switching workflows
    return
  }
  let ret = upperFirst(node.value.type)
  if (node.value.type !== 'cycle') {
    // NOTE: cycle point nodes don't have associated node data at present
    ret += ' • '
    if (node.value.type === 'workflow') {
      ret += upperFirst(node.value.node.statusMsg || node.value.node.status || 'state unknown')
      if (node.value.node.cylcVersion) {
        ret += ` • Cylc ${node.value.node.cylcVersion}`
      }
    } else {
      ret += upperFirst(node.value.node.state || 'state unknown')
      if (node.value.node.isHeld) ret += ' (held)'
      if (node.value.node.isRunahead) ret += ' (beyond runahead limit)'
      if (node.value.node.runtime?.runMode === 'Skip') ret += ' (skip mode)'
      if (node.value.node.isQueued) ret += ' (queued)'
      if (node.value.node.isRetry) ret += ' (awaiting retry)'
      else if (node.value.node.isWallclock) ret += ' (awaiting wallclock)'
      else if (node.value.node.isXtriggered) ret += ' (awaiting xtrigger)'
      if (node.value.node.flowNums) {
        ret += ` • Flows: ${formatFlowNums(node.value.node.flowNums)}`
      }
    }
  }
  return ret
})

function isEditable (mutation, authorised) {
  return mutation.name !== 'log' && mutation.name !== 'info' && !isDisabled(mutation, authorised)
}

function isDisabled (mutation, authorised) {
  if (!authorised) {
    return true
  }
  let status = node.value.node?.status
  if (node.value.type !== 'workflow') {
    const nodeReturned = getNodes('workflow', [node.value.tokens.workflowID])
    status = nodeReturned.length
      ? nodeReturned[0].node.status
      : WorkflowState.RUNNING.name
  }
  return !mutation._validStates.includes(status)
}

function openDialog (mutation) {
  dialog.value = true
  dialogMutation.value = mutation
  // Tell Vue to re-render the dialog component:
  dialogKey.value = !dialogKey.value
}

/* Call a mutation using only the tokens for args. */
function callMutationFromContext (mutation) {
  showMenu.value = false
  // eslint-disable-next-line no-console
  console.debug(`mutation: ${mutation._title} ${node.value.id}`)

  if (mutation.name === 'log') {
    // Navigate to the corresponding workflow then open the log view
    // (no nav occurs if already on the correct workflow page)
    router.push({
      name: 'Workspace',
      params: {
        workflowName: node.value.tokens.workflow,
      },
    }).then(() => {
      eventBus.emit(
        'add-view',
        {
          name: 'Log',
          initialOptions: {
            relativeID: node.value.tokens.relativeID || null,
            file: getLogFileForNode(node.value),
          },
        }
      )
    })
  } else if (mutation.name === 'info') {
    router.push({
      name: 'Workspace',
      params: {
        workflowName: node.value.tokens.workflow,
      },
    }).then(() => {
      eventBus.emit(
        'add-view',
        {
          name: 'Info',
          initialOptions: {
            requestedTokens: node.value.tokens || undefined,
          },
        }
      )
    })
  } else {
    mutate(
      mutation,
      getMutationArgsFromTokens(mutation, node.value.tokens),
      workflowService.apolloClient
    )
  }
}

async function showMutationsMenu (e) {
  target.value = e.target
  node.value = e.node
  expanded.value = false
  // show the menu after it's rendered to ensure animation works properly
  await nextTick()
  showMenu.value = true
  // ensure graphql query to get mutations has completed
  // const i = await workflowService.introspection
  const introspection = await workflowService.introspection
  // if mutations are slow to load then there will be a delay before they are reactively
  // displayed in the menu (this is what the skeleton-loader is for)
  isLoadingMutations.value = false
  types.value = introspection.types
  mutations.value = filterAssociations(
    e.node.type,
    e.node.tokens,
    introspection.mutations,
    user.permissions
  ).sort(
    (a, b) => a.mutation.name.localeCompare(b.mutation.name)
  )
}

function initialData (mutation, tokens) {
  return getMutationArgsFromTokens(mutation, tokens)
}

function enact (mutation, requiresInfo) {
  if (requiresInfo) {
    openDialog(mutation)
  } else {
    callMutationFromContext(mutation)
  }
}
</script>
