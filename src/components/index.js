import Vue from 'vue'
import { VueAdsTable } from 'vue-ads-table-tree'
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

const requireComponent = require.context(
  '@/components', true, /\.vue$/
)

requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName)

  const componentName = upperFirst(
    camelCase(fileName.replace(/^\.\//, '').replace(/\.\w+$/, ''))
  )

  Vue.component(componentName, componentConfig.default || componentConfig)
})

Vue.component('vue-ads-table', VueAdsTable)
