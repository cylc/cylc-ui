/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Widget } from '@lumino/widgets'

/**
 * This is a valid Lumino widget, that contains only a dummy div
 * element.
 *
 * It will be created and added to the Lumino panel, then a Vue component
 * will be created elsewhere, and attached to the div.
 *
 * Events in the widget will be propagated to the Vue component. Event
 * listeners much be attached to the DOM element with the widget ID.
 */
export default class LuminoWidget extends Widget {
  /**
   * Create a LuminoWidget object.
   * @param {string} id - unique ID of the widget
   * @param {string} name - text displayed in the widget tab
   * @param {boolean} closable - flag that controls whether the tab can be
   * closed or not
   */
  constructor (id, name, closable = true) {
    super({ node: LuminoWidget.createNode(id) })
    this.id = id
    this.name = name
    this.closable = closable
    // classes and flags
    this.setFlag(Widget.Flag.DisallowLayout)
    this.addClass('content')
    // tab title
    this.title.label = name
    this.title.closable = closable
  }

  /**
   * Return a dummy div to be used as parent for the Vue component element.
   * @param {string} id - widget id
   * @return {HTMLElement}
   */
  static createNode (id) {
    const div = document.createElement('div')
    div.setAttribute('id', id)
    return div
  }

  onActivateRequest (msg) {
    // Emit an event so that the Vue component knows that it was activated
    const event = new CustomEvent('lumino:activated', this._getEventDetails())
    document.getElementById(this.id).dispatchEvent(event)
    // call super method
    super.onActivateRequest(msg)
  }

  onCloseRequest (msg) {
    // Emit an event so that the Vue component knows that it needs to be removed too
    const event = new CustomEvent('lumino:deleted', this._getEventDetails())
    document.getElementById(this.id).dispatchEvent(event)
    // call super method
    super.onCloseRequest(msg)
  }

  /**
   * Event details returned for a `CustomEvent`.
   *
   * @link https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
   * @returns {{
   *   detail: {
   *     id: string,
   *     name: string,
   *     closable: boolean
   *   }
   * }}
   * @private
   */
  _getEventDetails () {
    return {
      detail: {
        id: this.id,
        name: this.name,
        closable: this.closable
      }
    }
  }
}
