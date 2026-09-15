/*
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { createSharedComposable } from '@vueuse/core'

/**
 * A composable that contains data used for a GraphQL subscription, such as the
 * query variables.
 *
 * To be used in Views that are bound to Vue-Router routes that contain the
 * :workflowName param.
 *
 * NOTE: The state of this composable is shared across all components that use it.
 * This is because the route and user are already shared state, and we want to avoid creating multiple
 * computed properties (one for each view) that are the same for all views anyway.
 * DO NOT add any state to this composable that is not shared across all views.
 */
export const useWorkflowVariables = createSharedComposable(() => {
  const route = useRoute()
  const store = useStore()
  const user = inject('user')

  const workflowName = computed(() => route.params?.workflowName)

  /**
   * Compute the workflow ID using the Vue route parameter
   * `workflowName` and the user.
   */
  const workflowID = computed(
    () => workflowName.value ? `~${user.owner}/${workflowName.value}` : undefined
  )

  /**
   * A list of the workflow IDs this view is "viewing"
   *
   * NOTE: we plan multi-workflow functionality in future, so this will no longer be shared state
   * (however it will need refactoring of subscriptions logic anyway before we can achieve this).
   */
  const workflowIDs = computed(
    () => workflowID.value ? [workflowID.value] : []
  )

  /** Data store nodes for the workflows this view is viewing. */
  const workflows = computed(
    () => workflowName.value
      ? store.getters['workflows/getNodes']('workflow', workflowIDs.value)
      : []
  )

  /** GraphQL query variables. */
  const variables = computed(() => ({
    workflowID: workflowID.value,
  }))

  return {
    workflowName,
    workflowID,
    workflowIDs,
    workflows,
    variables,
  }
})
