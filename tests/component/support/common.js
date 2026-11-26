/*
 * Common Cypress utilities and functions for both E2E and component tests.
 */

/**
 * Enable any browser permissions needed for Cypress E2E & Component testing.
 */
export function enableBrowserPermissions () {
  if (Cypress.browser.family === 'chromium') {
    Cypress.automation('remote:debugger:protocol', {
      command: 'Browser.grantPermissions',
      params: {
        permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
        origin: window.location.origin,
      },
    })
  }
}
