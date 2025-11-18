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

function addView (view) {
  cy.get('[data-cy=add-view-btn]').click()
  cy.get(`#toolbar-add-${view}-view`).click()
    // wait for menu to close
    .should('not.be.exist')
}

describe('Workspace view and component/widget', () => {
  beforeEach(() => {
    cy.visit('/#/workspace/one')
    cy.title().should('eq', 'Cylc UI | Workflow one')
  })

  afterEach(() => {
    cy.get('.v-alert')
      .should('not.exist')
  })

  it('Displays the Lumino component in the Workspace view, with a Tree widget', () => {
    cy.get('.lm-TabBar-tabLabel')
      .should('have.length', 1)
    cy.get('.lm-Widget')
      .should('be.visible')
  })

  it('Can add two widgets of the same type', () => {
    // there should be one widget open by default (tree)
    cy.get('.lm-TabBar-tabLabel')
      // there should be a tab representing the widget
      .should('have.length', 1)
    cy.get('.lm-DockPanel-widget')
      .should('have.length', 1)
      .first().as('firstWidget')
      // the tab should be active (that is to say on top)
      .should('be.visible')

    addView('Tree')
    cy.get('.lm-TabBar-tabLabel')
      .should('have.length', 2)
    cy.get('.lm-DockPanel-widget')
      .should('have.length', 2)
      // the new tab should be last
      .last()
      .should('be.visible')
    cy.get('@firstWidget')
      .should('not.be.visible')
  })

  it('Can add two widgets of different types', () => {
    cy.get('.lm-TabBar-tabLabel')
      .should('have.length', 1)
      // the tab should contain the name of the widget
      .contains('Tree')
    cy.get('.c-tree')
      .should('be.visible')

    addView('Table')
    cy.get('.lm-TabBar-tabLabel')
      // there should be two tabs (tree + table)
      .should('have.length', 2)
      .last()
      .contains('Table')
      // the new tab should be active (that is to say on top)
      .parent()
      .should('have.class', 'lm-mod-current')
    cy.get('.c-tree')
      .should('not.be.visible')
    cy.get('.c-table')
      .should('be.visible')
  })

  it('Can remove widgets by clicking close icon in tab', () => {
    cy.get('.lm-TabBar-tabLabel')
      .should('have.length', 1)
    addView('Tree')
    // ensure we have 2 widgets now
    cy.get('.lm-TabBar-tabLabel')
      .should('have.length', 2)
    cy.get('.lm-DockPanel-widget')
      .should('have.length', 2)
    // close all widgets
    cy.get('.lm-TabBar-tabCloseIcon').each(($el) => {
      cy.wrap($el).click()
    })
    // ensure we have no widgets now
    cy.get('.lm-TabBar-tabLabel')
      .should('not.exist')
    cy.get('.lm-DockPanel-widget')
      .should('not.exist')
  })

  it('Saves and restores layout when navigating', () => {
    // We will drag tab to the right to split into 2 panes
    const dragOptions = { clientX: 950, clientY: 330, force: true }

    // Assert there are 2 panes each with their own tab bar and widget
    function expectRememberedLayout () {
      cy.get('.lm-TabBar')
        .should('have.length', 2)
      cy.get('.lm-DockPanel-widget')
        .should('have.length', 2)
      cy.get('.c-tree')
        .should('be.visible')
        .find('[data-cy=control-taskIDFilter] input')
        .should('have.value', 'GOOD')
      cy.get('.c-table')
        .should('be.visible')
    }

    cy.get('.lm-DockPanel-widget')
      .should('be.visible')
    addView('Table')
    // ensure we have 2 widgets now
    cy.get('.lm-DockPanel-widget')
      .should('have.length', 2)
    cy.get('.c-tree')
      .should('not.be.visible')
    // Drag widget into split pane
    cy.get('.lm-TabBar-tabLabel')
      .last()
      .trigger('pointerdown', { button: 0 })
      .trigger('pointermove', dragOptions)
      .trigger('pointerup', { button: 0, ...dragOptions })
    // (It takes a moment for the split pane to render properly - should('be.visible') does not wait for this unfortunately)
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(100)
    cy.get('.c-tree')
      .find('[data-cy=control-taskIDFilter] input')
      .type('GOOD')
    expectRememberedLayout()

    // Navigate to another workflow
    cy.visit('/#/workspace/two')
    cy.get('.lm-TabBar-tabLabel')
      .should('have.length', 1)
    cy.get('.c-tree')
      .should('be.visible')
    cy.get('.c-table')
      .should('not.exist')

    // Navigate back to original workflow
    cy.visit('/#/workspace/one')
    expectRememberedLayout()

    // Navigate to non-workspace view (unmounts Lumino)
    cy.visit('/#/')
    cy.get('.c-dashboard')
    cy.get('.lm-TabBar-tabLabel')
      .should('not.exist')

    // Navigate back to original workflow
    cy.visit('/#/workspace/one')
    expectRememberedLayout()

    cy.window().then((win) => {
      if (win.caches) {
        // Test page refresh
        cy.reload()
        expectRememberedLayout()
      } else {
        cy.log('Cache API not supported; skipping page refresh test.')
      }
    })
  })

  it('Resets layout', () => {
    cy.get('.lm-TabBar-tabCloseIcon').click()
    cy.get('.c-tree')
      .should('not.exist')
    addView('Table')
    addView('Table')
    cy.get('.lm-DockPanel-widget')
      .should('have.length', 2)

    cy.get('[data-cy=add-view-btn]').click()
      .get('[data-cy=reset-layout-btn]').click()
    cy.get('.lm-DockPanel-widget')
      .should('have.length', 1)
    cy.get('.c-tree')
      .should('be.visible')
  })

  it('Does not suffer uncaught errors in Lumino backend after restoring layout', () => {
    /* Ensure "Widget is not contained in the dock panel" does not get raised.
    This error caused dragging tags into a split pane to fail after restoring
    a layout. It was caused by restoring a proxied layout object instead of
    the layout object directly. */

    // We will drag tab to the right to split into 2 panes
    const dragOptions = { clientX: 950, clientY: 330, force: true }
    addView('Table')
    cy.get('.lm-DockPanel-widget')
      .should('have.length', 2)
    cy.get('.c-table')
      .should('be.visible')
    // Navigate away to unmount Lumino component
    cy.visit('/#')
    cy.get('.c-dashboard')
    // Navigate back to original workflow
    cy.visit('/#/workspace/one')
    // Drag widget into split pane
    cy.get('.lm-TabBar-tabLabel')
      .last()
      .trigger('pointerdown', { button: 0 })
      .trigger('pointermove', dragOptions)
      .trigger('pointerup', { button: 0, ...dragOptions })
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(100)
    cy.get('.c-tree')
      .should('be.visible')
    cy.get('.c-table')
      .should('be.visible')
  })
})
