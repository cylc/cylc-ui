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

export default class User {
  constructor ({ username, owner, permissions, mode, initials, color, extensions }) {
    /**
     * @type {string}
     */
    this.username = username
    /**
     * the UIS owner (i.e. the user who's workflows we are looking at)
     * (this might not be the authenticated user for multi-user setups)
     * @type {string}
     */
    this.owner = owner
    /**
     * list of permissions
     * @type {string[]}
     */
    this.permissions = permissions
    /**
     * single or multi user mode
     * @type {string}
     */
    this.mode = mode
    /**
     * user initials
     * @type {string}
     */
    this.initials = initials
    /**
     * user avatar color if set
     * @type {string | null}
     */
    this.color = color
    /**
      * Jupyter server extensions.
      */
    this.extensions = extensions
  }
}
