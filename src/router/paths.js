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

import { i18n } from '@/i18n'

const workflowTitle = ({ workflowName: name }) => i18n.global.t('App.workflow', { name })

/**
 * Define all of your application routes here
 * for more information on routes, see the
 * official documentation https://router.vuejs.org/en/
 *
 * @type {import('vue-router').RouteRecordRaw[]} - except the `name` and
 * `component` fields which are automatically added in @/src/router/index.js
 */
export default [
  {
    path: '/',
    view: 'Dashboard',
    meta: {
      title: i18n.global.t('App.dashboard'),
      layout: 'default',
    },
  },
  {
    path: '/workflow-table',
    view: 'WorkflowsTable',
    meta: {
      title: 'Workflow Table',
      layout: 'default',
    },
  },
  {
    path: '/workspace/:workflowName(.*)',
    view: 'Workspace',
    meta: {
      getTitle: workflowTitle,
      layout: 'default',
      toolbar: true,
    },
    props: true,
  },
  {
    path: '/user-profile',
    view: 'UserProfile',
    meta: {
      title: i18n.global.t('App.userProfile'),
      layout: 'default',
    },
  },
  {
    path: '/guide',
    view: 'Guide',
    meta: {
      title: i18n.global.t('App.guide'),
      layout: 'default',
    },
  },
  {
    path: '/graphiql',
    view: 'GraphiQL',
    meta: {
      title: 'GraphiQL',
      layout: 'empty',
    },
  },
  {
    path: '/:catchAll(.*)',
    view: 'NotFound',
    meta: {
      title: i18n.global.t('App.notFound'),
      layout: 'empty',
    },
  },

  // the standalone views
  {
    path: '/workflows',
    view: 'Workflows',
    meta: {
      title: i18n.global.t('App.workflows'),
      layout: 'default',
      toolbar: false,
      showSidebar: false,
    },
  },
  {
    path: '/tree/:workflowName(.*)',
    view: 'Tree',
    meta: {
      getTitle: workflowTitle,
      layout: 'default',
      toolbar: true,
      showSidebar: false,
    },
    props: true,
  },
  {
    path: '/table/:workflowName(.*)',
    view: 'Table',
    meta: {
      getTitle: workflowTitle,
      layout: 'default',
      toolbar: true,
      showSidebar: false,
    },
    props: true,
  },
  {
    path: '/graph/:workflowName(.*)',
    view: 'Graph',
    meta: {
      getTitle: workflowTitle,
      layout: 'default',
      toolbar: true,
      showSidebar: false,
    },
    props: true,
  },
  {
    path: '/log/:workflowName(.*)',
    view: 'Log',
    meta: {
      getTitle: workflowTitle,
      layout: 'default',
      toolbar: true,
      showSidebar: false,
    },
    props: true,
  },
  {
    path: '/analysis/:workflowName(.*)',
    view: 'Analysis',
    meta: {
      getTitle: workflowTitle,
      layout: 'default',
      toolbar: true,
      showSidebar: false,
    },
    props: true,
  },
  {
    path: '/gantt/:workflowName(.*)',
    view: 'Gantt',
    meta: {
      getTitle: workflowTitle,
      layout: 'default',
      toolbar: true,
      showSidebar: false,
    },
    props: true,
  },
  {
    path: '/noAuth',
    view: 'NoAuth',
    meta: {
      title: 'Unauthorized',
      layout: 'noAuth',
    },
  },
]
