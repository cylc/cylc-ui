import { config } from '@vue/test-utils'
import { User } from '@/model/User.model'

config.global.provide = {
  user: new User({ username: 'cylc', permissions: [], owner: 'owner' }),
  versionInfo: { },
}

// Stub APIs not provided by happy-dom:
window.visualViewport ??= new EventTarget()
