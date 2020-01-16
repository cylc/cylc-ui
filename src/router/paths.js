import i18n from '@/i18n'

/**
 * Define all of your application routes here
 * for more information on routes, see the
 * official documentation https://router.vuejs.org/en/
 */
export default [
  {
    path: '/',
    view: 'Dashboard',
    name: i18n.t('App.dashboard'),
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/workflows',
    name: i18n.t('App.workflows'),
    view: 'GScan',
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/workflows/:workflowName',
    view: 'Workflow',
    name: 'workflow',
    meta: {
      layout: 'default'
    },
    props: true
  },
  {
    path: '/mutations',
    view: 'Mutations',
    name: 'mutations',
    meta: {
      layout: 'default'
    },
    props: true
  },
  {
    path: '/user-profile',
    name: i18n.t('App.userProfile'),
    view: 'UserProfile',
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/graph/:workflowName',
    view: 'Graph',
    name: 'graph',
    meta: {
      layout: 'default'
    },
    props: true
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
    path: '*',
    view: 'NotFound',
    meta: {
      layout: 'empty'
    }
  }
]
