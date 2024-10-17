// ***********************************************************
// This example support/component.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import '@cypress/code-coverage/support'

// Import CSS
import '@/styles/index.scss'

import { createVuetify } from 'vuetify'
import { mount } from 'cypress/vue'
import { vuetifyOptions } from '@/plugins/vuetify'

// vanilla mount function
// e.g. cy.mount(MyComponent)
Cypress.Commands.add('mount', mount)

// mount function with Vuetify installed
// e.g. cy.mount(MyVuetifyComponent)
// see also addVuetifyStyles
Cypress.Commands.add('vmount', (component, options = {}) => {
  return mount(
    component,
    {
      global: {
        plugins: [createVuetify(vuetifyOptions)]
      },
      ...options
    }
  )
})

// add required classes to the Cypress root element
// e.g. cy.addVuetifyStyles(cy)
// use this if you need Vuetify styles to be applied
Cypress.Commands.add('addVuetifyStyles', (cy) => {
  cy
    .document()
    .then((foo) => {
      const classList = foo.children[0].classList
      if (!classList.contains('v-application')) {
        foo.children[0].classList.add(
          'v-application',
          'v-application--is-ltr',
          'theme--light',
          'job_theme--default'
        )
      }
    })
})
