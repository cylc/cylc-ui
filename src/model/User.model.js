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

/**
 * @typedef {object} User
 * @property {string} username - user name
 * @property {string[]} groups - user groups
 * @property {string} created - date when the user was created
 * @property {boolean} admin - whether the user is an administrator or not
 * @property {string} server - server URL
 * @property {string} owner - UIS owner
 * @property {string[]} permissions - list of permissions
 * @property {string} mode - single or multi user mode
 */
export default class User {
  constructor(
    username,
    groups,
    created,
    admin,
    server,
    owner,
    permissions,
    mode
  ) {
    // the authenticated user
    // (full info only available when authenticated via the hub)
    this.username = username
    this.groups = groups
    this.created = created
    this.admin = admin
    this.server = server || '?' // server can be unset
    // the UIS owner
    // (i.e. the user who's workflows we are looking at)
    // (this might not be the authenticated user for multi-user setups)
    this.owner = owner
    this.permissions = permissions
    this.mode = mode
  }
}
