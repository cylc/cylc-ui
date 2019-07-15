export default class User {
  constructor (username, groups, created, admin) {
    this.username = username
    this.groups = groups
    this.created = created
    this.admin = admin
  }

  getUserName () {
    return this.username
  }

  getGroups () {
    return this.groups
  }

  getCreated () {
    return this.created
  }

  isAdmin () {
    return this.admin
  }
}
