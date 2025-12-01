/*
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
import { eventBus } from '@/services/eventBus'

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
export class LuminoWidget extends Widget {
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

  onBeforeAttach (msg) {
    // Set tab title as this is not handled automatically for some reason.
    // NOTE: We do this in the onBeforeAttach hook rather than in the constructor
    // because the constructor does not get called when we restore layout to the
    // dock panel.
    // Setting these properties are handled by setters in the @lumino/widgets code
    // which cause the tab panel to be updated.
    this.title.label = this.name
    this.title.closable = this.closable
    eventBus.on(`lumino:update-tab:${this.id}`, ({ title, caption }) => {
      this.title.label = title
      this.title.caption = caption
    })
    super.onBeforeAttach(msg)
  }

  // // TODO: currently unused, but leaving it here for future reference
  // onActivateRequest (msg) {
  //   // Emit an event so that the Vue component knows that it was activated
  //   eventBus.emit('lumino:activated', this._getEventDetails())
  //   super.onActivateRequest(msg)
  // }

  onCloseRequest (msg) {
    // Emit an event so that the Vue component knows that it needs to be removed too
    eventBus.emit('lumino:deleted', this.id)
    eventBus.off(`lumino:update-tab:${this.id}`)
    super.onCloseRequest(msg)
  }

  onAfterShow (msg) {
    // Emit an event so that the Vue component knows that this widget is visible again
    eventBus.emit(`lumino:show:${this.id}`)
    super.onAfterShow(msg)
  }

  toJSON () {
    // Allow the widget to be serialized.
    // We only need to store this limited info when saving the layout,
    // allowing us to entirely recreate the widget when restoring the layout.
    return {
      name: this.name,
      id: this.id,
      closable: this.closable,
    }
  }

  /**
   * JSON.parse reviver function for reconstructing a serialized Lumino ILayoutConfig.
   */
  static layoutReviver (key, value) {
    if (key === 'widgets') {
      return value.map((w) => new LuminoWidget(w.id, w.name, w.closable))
    }
    return value
  }
}
