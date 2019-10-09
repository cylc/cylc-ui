export default class User {
  constructor (username, groups, created, admin, server) {
    this.username = username
    this.groups = groups
    this.created = created
    this.admin = admin
    /**
     * @type {string} - server URL
     */
    this.server = server
  }

  /**
   * Return the Hub URL for the currently logged in user. The Vue app when created
   * uses a route guard to load the user information from JupyterHub REST API.
   *
   * This stored information contains the `server` parameter that includes the
   * base URL. We use the base URL in this function to create the Hub URL. Otherwise
   * we would end up with 404 errors for users that have a value set for the
   * base URL (which is blank by default).
   *
   * @link https://github.com/cylc/cylc-ui/issues/258
   * @returns {string}
   */
  getHubUrl () {
    const hubUrl = '/hub/home'
    let baseUrl = ''
    const server = this.server
    const userTokenIdx = server.lastIndexOf('/user')
    if (userTokenIdx > 0) {
      baseUrl = server.substring(0, userTokenIdx)
    }
    return `${baseUrl}${hubUrl}`
  }
}
