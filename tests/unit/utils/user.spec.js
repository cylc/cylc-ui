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
