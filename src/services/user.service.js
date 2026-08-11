/*
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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

import { createUrl } from '@/utils/urls'
import { inject } from 'vue'

export function useUserService () {
  /** @type {import('@/model/User.model').User} */
  const user = inject('user')

  const multiUserMode = user.mode === 'multi user'

  const hubURL = multiUserMode ? createUrl('/hub/home', { baseOnly: true }) : null

  const versionInfo = inject('versionInfo')

  return {
    user,
    multiUserMode,
    hubURL,
    versionInfo,
  }
}
