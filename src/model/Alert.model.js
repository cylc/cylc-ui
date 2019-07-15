export default class Alert {
  constructor (text, icon, color) {
    this.text = text
    this.icon = icon
    this.color = color
  }

  getText () {
    return this.text
  }

  getIcon () {
    return this.icon
  }

  getColor () {
    return this.color
  }
}
