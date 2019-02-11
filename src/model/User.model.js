class User {
  constructor (data) {
    this.data = data
    console.log(data)
    this.username = data.username
    this.password = data.password
  }

  getUserName () {
    return this.username
  }

  getPassword () {
    return this.password
  }
}

export default User
