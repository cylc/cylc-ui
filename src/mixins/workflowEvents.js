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

import { computed } from 'vue'
import { useStore } from 'vuex'
import { createSharedComposable } from '@vueuse/core'

function logLevelSortIndex (level) {
  switch (level) {
    case 'CRITICAL': return 1
    case 'ERROR': return 2
    case 'WARNING': return 3
    case 'INFO': return 4
    case 'DEBUG': return 5
    default: return 6
  }
}

/** @type {import('vuetify').DataTableHeader[]} */
export const headers = [
  {
    title: 'Level',
    key: 'level',
    sort: (a, b) => logLevelSortIndex(b) - logLevelSortIndex(a),
  },
  {
    title: 'Workflow',
    key: 'workflow',
  },
  {
    title: 'Message',
    key: 'message',
    sortable: false,
  },
]

export const useWorkflowEvents = createSharedComposable(() => {
  const store = useStore()

  const workflows = computed(() => store.getters['workflows/getNodes']('workflow'))

  const events = computed(
    () => workflows.value.flatMap(
      ({ node, tokens }) => node?.logRecords?.map(
        (record) => ({ workflow: tokens.workflow, ...record })
      ) ?? []
    ).reverse()
  )

  return {
    events,
  }
})

// For testing:
/**
 * (E2E) The table in the events view should be above this height,
 * but in the dashboard it should be below this height.
 */
export const __heightThreshold = 400
