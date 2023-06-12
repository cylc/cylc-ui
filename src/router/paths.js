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

import { i18n } from '@/i18n'

/**
 * Define all of your application routes here
 * for more information on routes, see the
 * official documentation https://router.vuejs.org/en/
 */
export default [
  {
    path: '/',
    view: 'Dashboard',
    name: i18n.global.t('App.dashboard'),
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/workflow-table',
    name: 'Workflow Table',
    view: 'WorkflowsTable',
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/workspace/:workflowName(.*)',
    view: 'Workspace',
    name: 'workspace',
    meta: {
      layout: 'default',
      toolbar: true
    },
    props: true
  },
  {
    path: '/user-profile',
    name: i18n.global.t('App.userProfile'),
    view: 'UserProfile',
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/guide',
    name: 'Guide',
    view: 'Guide',
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/graphiql',
    view: 'GraphiQL',
    meta: {
      layout: 'empty'
    }
  },
  {
    path: '/:catchAll(.*)',
    view: 'NotFound',
    meta: {
      layout: 'empty'
    }
  },

  // the standalone views
  {
    path: '/workflows',
    name: i18n.global.t('App.workflows'),
    view: 'Workflows',
    meta: {
      layout: 'default',
      toolbar: false,
      showSidebar: false
    }
  },
  {
    path: '/tree/:workflowName(.*)',
    view: 'Tree',
    name: 'tree',
    meta: {
      layout: 'default',
      toolbar: true,
      showSidebar: false
    },
    props: true
  },
  {
    path: '/table/:workflowName(.*)',
    view: 'Table',
    name: 'table',
    meta: {
      layout: 'default',
      toolbar: true,
      showSidebar: false
    },
    props: true
  },
  {
    path: '/graph/:workflowName(.*)',
    view: 'Graph',
    name: 'graph',
    meta: {
      layout: 'default',
      toolbar: true,
      showSidebar: false
    },
    props: true
  },
  {
    path: '/log/:workflowName(.*)',
    view: 'Log',
    name: 'log',
    meta: {
      layout: 'default',
      toolbar: true,
      showSidebar: false
    },
    props: true
  },
  {
    path: '/analysis/:workflowName(.*)',
    view: 'Analysis',
    name: 'analysis',
    meta: {
      layout: 'default',
      toolbar: true,
      showSidebar: false
    },
    props: true
  }
]
