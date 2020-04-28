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

import User from '@/model/User.model'
import store from '@/store/index'

export const UserService = {

  getUserProfile () {
    const username = 'cylc'
    const user = new User(
      username,
      ['cylc-developers', 'linux-users'],
      new Date(),
      true,
      `/user/${username}/`
    )
    return store.dispatch('user/setUser', user)
  }

}
