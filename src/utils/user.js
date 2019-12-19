/**
 * Return the Hub URL for the currently logged in user. The Vue app when created
 * uses a route guard to load the user information from JupyterHub REST API.
 *
 * This stored information contains the `server` parameter that includes the
 * base URL. We use the base URL in this function to create the Hub URL. Otherwise
 * we would end up with 404 errors for users that have a value set for the
 * base URL (which is blank by default).
 *
 * @param {User} user - a Cylc user
 * @link https://github.com/cylc/cylc-ui/issues/258
 * @returns {string}
 */
export function getHubUrl (user) {
  let hubUrl = '/hub/home'
  if (user) {
    let baseUrl = ''
    const server = user.server
    const userTokenIdx = server.lastIndexOf('/user')
    if (userTokenIdx > 0) {
      baseUrl = server.substring(0, userTokenIdx)
    }
    hubUrl = `${baseUrl}${hubUrl}`
  }
  return hubUrl
}
