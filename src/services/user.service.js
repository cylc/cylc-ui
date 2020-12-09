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
import axios from 'axios'
import store from '@/store/'
import Alert from '@/model/Alert.model'

class UserService {
  /**
   * Gets the user profile from the backend server.
   * @returns {Promise<*>} - a promise that dispatches Vuex action
   */
  getUserProfile () {
    return axios.get(`${window.location.pathname}/userprofile`).then((response) => {
      const user = new User(response.data.name, response.data.groups, response.data.created, response.data.admin, response.data.server)
      return store.dispatch('user/setUser', user)
    }).catch((error) => {
      const alert = new Alert(error.response.statusText, null, 'error')
      return store.dispatch('setAlert', alert)
    })
  }
}

export default UserService
