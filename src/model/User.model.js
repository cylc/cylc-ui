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
}
