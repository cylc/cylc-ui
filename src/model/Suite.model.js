export default class Suite {
  constructor(name, user, host, port) {
    this.name = name;
    this.user = user;
    this.host = host;
    this.port = port
  }

  getName() {
    return this.name
  }

  getUser() {
    return this.user
  }

  getHost() {
    return this.host
  }

  getPort() {
    return this.port
  }
}
