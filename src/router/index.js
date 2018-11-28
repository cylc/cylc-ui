import Vue from 'vue'
import Router from 'vue-router'
import MainPage from '@/components/MainPage'
import HelpPage from '@/components/HelpPage'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'MainPage',
      component: MainPage
    },
    {
      path: '/help',
      name: 'HelpPage',
      component: HelpPage
    }
  ]
})
