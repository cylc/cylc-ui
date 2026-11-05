import { config, enableAutoUnmount } from '@vue/test-utils'
import { User } from '@/model/User.model'
import { afterEach } from 'vitest'

config.global.provide = {
  user: new User({ username: 'cylc', permissions: [], owner: 'owner' }),
  versionInfo: { },
}

if (!globalThis.VTUAutoUnmountEnabled) {
  enableAutoUnmount(afterEach)
  globalThis.VTUAutoUnmountEnabled = true
}
