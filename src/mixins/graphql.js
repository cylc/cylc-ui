/*
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
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

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'

/*
 * A mixin that contains data used for a GraphQL subscription, such as the
 * query variables.
 *
 * To be used in Views that are bound to Vue-Router routes that contain the
 * :workflowName param.
 */

export function useGraphQL () {
  const route = useRoute()
  const store = useStore()

  const workflowName = computed(() => route.params?.workflowName)

  /**
   * Compute the workflow ID using the Vue route parameter
   * `workflowName` and the user from the store.
   */
  const workflowID = computed(
    () => `~${store.state.user.user.owner}/${workflowName.value}`
  )

  /**
   * A list of the workflow IDs this view is "viewing"
   *
   * NOTE: we plan multi-workflow functionality so we are writing views
   * to be mult-workflow compatible in advance of this feature arriving
   */
  const workflowIDs = computed(() => [workflowID.value])

  /** GraphQL query variables. */
  const variables = computed(() => ({
    workflowID: workflowID.value,
  }))

  return {
    workflowName,
    workflowID,
    workflowIDs,
    variables,
  }
}
