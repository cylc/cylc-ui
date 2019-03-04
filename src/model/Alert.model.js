export default class Alert {
  constructor(text, icon, type) {
    this.text = text;
    this.icon = icon;
    this.type = type;
  }

  getText() {
    return this.text;
  }

  getIcon() {
    return this.icon;
  }

  getType() {
    return this.type;
  }
}
