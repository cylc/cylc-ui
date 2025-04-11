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

import axios from 'axios'
import User from '@/model/User.model'
import { createUrl, getCylcHeaders } from '@/utils/urls'

/**
 * Gets the user profile from the backend server.
 * @returns {Promise<User>}
 */
export async function getUserProfile () {
  const { data } = await axios.get(
    createUrl('userprofile'),
    { headers: getCylcHeaders() }
  )
  return new User(data)
}
