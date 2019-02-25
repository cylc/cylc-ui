class User {
  constructor (data) {
    this.username = data.name
    this.groups = data.groups
    this.created = data.created
    this.admin = data.admin
  }

  getUserName () {
    return this.username
  }

  getGroups () {
    return this.groups
  }

  getCreated() {
    return this.created
  }

  isAdmin() {
    return this.admin
  }
}

export default User
