import { config, disableAutoUnmount, enableAutoUnmount } from '@vue/test-utils'
import { User } from '@/model/User.model'
import { afterAll, afterEach } from 'vitest'

// Setup file for unit tests - this gets re-run before each spec file.

config.global.provide = {
  user: new User({ username: 'cylc', permissions: [], owner: 'owner' }),
  versionInfo: { },
}

// Unmount components after each test so that any shared state is disposed:
enableAutoUnmount(afterEach)
// `enableAutoUnmount` cannot be called more than once so we need to reset before the next spec file:
afterAll(disableAutoUnmount)
