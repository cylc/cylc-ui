export default class Suite {
  constructor(id, name, owner, host, port) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.host = host;
    this.port = port
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name
  }

  getOwner() {
    return this.owner
  }

  getHost() {
    return this.host
  }

  getPort() {
    return this.port
  }
}
