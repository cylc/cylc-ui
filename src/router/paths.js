/**
 * Define all of your application routes here
 * for more information on routes, see the
 * official documentation https://router.vuejs.org/en/
 */
export default [
  {
    path: '/dashboard',
    view: 'Dashboard',
    meta: {
      layout: 'default'
    },
    alias: ['/']
  },
  {
    path: '/graph',
    view: 'Graph',
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/suites',
    view: 'Suites',
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/workflows',
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
    path: '/suites/:name',
    view: 'Suite',
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/user-profile',
    name: 'User Profile',
    view: 'UserProfile',
    meta: {
      layout: 'default'
    }
  },
  {
    path: '/notifications',
    view: 'Notifications',
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
