/**
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

import { defineAsyncComponent } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import {
  mdiChartGantt,
  mdiChartLine,
  mdiFileDocumentMultipleOutline,
  mdiFileTree,
  mdiGraph,
  mdiHelp,
  mdiInformationOutline,
  mdiTable,
  mdiTree,
} from '@mdi/js'

// Use dynamic async components for lazy loading:
const TreeView = defineAsyncComponent(() => import('@/views/Tree.vue'))
const TableView = defineAsyncComponent(() => import('@/views/Table.vue'))
const GraphView = defineAsyncComponent(() => import('@/views/Graph.vue'))
const LogView = defineAsyncComponent(() => import('@/views/Log.vue'))
const AnalysisView = defineAsyncComponent(() => import('@/views/Analysis.vue'))
const GanttView = defineAsyncComponent(() => import('@/views/Gantt.vue'))
const SimpleTreeView = defineAsyncComponent(() => import('@/views/SimpleTree.vue'))
const InfoView = defineAsyncComponent(() => import('@/views/Info.vue'))
const MutationView = defineAsyncComponent(() => import('@/components/cylc/Mutation.vue'))
const GuideView = defineAsyncComponent(() => import('@/views/Guide.vue'))

/**
 * @typedef {Object} CylcView
 * @property {import('vue').DefineComponent} component - the dynamic async Vue component
 * @property {string} icon - the icon for this view
 */

export const TREE = 'Tree'

/**
 * A map of the views that can be opened for a workflow.
 *
 * Note, some views may require additional context to open.
 *
 * @type {Map<string, CylcView>}
 */
export const workflowViews = new Map([
  [TREE, { component: TreeView, icon: mdiFileTree }],
  ['Table', { component: TableView, icon: mdiTable }],
  ['Graph', { component: GraphView, icon: mdiGraph }],
  ['Log', { component: LogView, icon: mdiFileDocumentMultipleOutline }],
  ['Analysis', { component: AnalysisView, icon: mdiChartLine }],
  ['Gantt', { component: GanttView, icon: mdiChartGantt }],
  ['Guide', { component: GuideView, icon: mdiHelp }],
])

// Development views that we don't want in production:
if (import.meta.env.MODE !== 'production') {
  workflowViews.set('SimpleTree', { component: SimpleTreeView, icon: mdiTree })
}

/**
 * A map of Vue views or components.
 *
 * Each view in this map will be available from the Toolbar to be added as
 * a widget to the workspace view.
 *
 * Note for peformance reasons this should not be made reactive as they are
 * already Vue components.
 *
 * @type {Map<string, CylcView>}
 */
export const allViews = new Map([
  ...workflowViews,
  // For now, Info view cannot be opened for a workflow, but this will be resolved by
  // https://github.com/cylc/cylc-ui/issues/1898
  ['Info', { component: InfoView, icon: mdiInformationOutline }],
  ['Command', { component: MutationView, icon: mdiInformationOutline }],
])

export const useDefaultView = () => {
  const defaultView = useLocalStorage('defaultView', TREE)
  // Check if the view is implemented (in case we remove/rename a view in future)
  if (!allViews.has(defaultView.value)) {
    defaultView.value = TREE
  }
  return defaultView
}
