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

import Alert from '@/model/Alert.model'

const getStore = () => cy.window().its('app.$store')

describe('Alert component', () => {
  it('Is displayed when an alert is present in the central data store', () => {
    cy.visit('/#/')
    cy.get('.c-header').should('exist')
    const errorMessage = 'Error displayed'
    getStore().then(store => {
      store.dispatch('setAlert', new Alert(errorMessage, 'error'))
    })
    cy
      .get('[data-cy="alert-snack"]')
      .should('contain', errorMessage)
  })
  it('Uses the right colors for different alert severities', () => {
    cy.visit('/#/')
    cy.get('.c-header').should('exist')
    getStore().then(store => {
      cy.get('[data-cy=alert-snack]')
        .should('not.exist')
        .then(() => store.commit('SET_ALERT', new Alert('Success alert', 'success')))
        .get('[data-cy=alert-snack]')
        .find('.bg-success')
        .should('be.visible')
        .then(() => store.commit('SET_ALERT', new Alert('Warning alert', 'warning')))
        .get('[data-cy=alert-snack]')
        .find('.bg-warning')
        .should('be.visible')
        .then(() => store.commit('SET_ALERT', new Alert('Error alert', 'error')))
        .get('[data-cy=alert-snack]')
        .find('.bg-error')
        .should('be.visible')
    })
  })
  it('Removes the alert from the central data store when it is dismissed by the user', () => {
    cy.visit('/#/')
    cy.get('.c-header').should('exist')
    const errorMessage = 'Error displayed'
    getStore().then(store => {
      store.dispatch('setAlert', new Alert(errorMessage, 'error'))
    })
    cy
      .get('[data-cy="alert-snack"]')
      .should('contain', errorMessage)
    cy
      .get('[data-cy="alert-snack"]')
      .get('button')
      .click({ force: true, multiple: true })
    cy
      .get('[data-cy="alert-snack"]--active')
      .should('not.exist')
    getStore().then(store => {
      expect(store.state.alert).to.equal(null)
    })
  })
})
