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
    path: '/graph',
    view: 'Graph',
    name: i18n.t('App.graph'),
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
    path: '/workflows/:name',
    view: 'Tree',
    meta: {
      layout: 'default'
    }
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
    path: '*',
    view: 'NotFound',
    meta: {
      layout: 'empty'
    }
  },
  {
    path: '/tree2',
    name: i18n.t('App.workflows'),
    view: 'Tree2',
    meta: {
      layout: 'default'
    }
  }
]
