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

import { expect } from 'chai'
import User from '@/model/User.model'
import { getHubUrl } from '@/utils/user'

describe('Hub URL', () => {
  describe('Hub URL', () => {
    const user = new User('', [], '', false, '')
    expect(getHubUrl(user)).to.equal('/hub/home')
    user.server = '/user/john.foo/'
    expect(getHubUrl(user)).to.equal('/hub/home')
    user.server = '/cylc/user/john.foo/'
    expect(getHubUrl(user)).to.equal('/cylc/hub/home')
    user.server = '/cylc/flow/workflow/engine/user/john.foo/'
    expect(getHubUrl(user)).to.equal('/cylc/flow/workflow/engine/hub/home')
    // who knows right? no idea if the configurable-http-proxy would still work with these URLs, but just in case...
    user.server = '/user/user/john.foo/'
    expect(getHubUrl(user)).to.equal('/user/hub/home')
    user.server = '/cylc/flow/user/workflow/engine/user/john.foo/'
    expect(getHubUrl(user)).to.equal('/cylc/flow/user/workflow/engine/hub/home')
  })
})
