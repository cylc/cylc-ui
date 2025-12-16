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

/* Centralised settings set in localStorage, with their defaults.

NOTE: by providing a default to useLocalStorage(), it automatically
deserializes to the correct type instead of just string.

These must be composables because otherwise useLocalStorage() gets executed at
import time and so can't pick up changes to localStorage in unit tests. */

import { useLocalStorage } from '@vueuse/core'

export const useCyclePointsOrderDesc = () => useLocalStorage('cyclePointsOrderDesc', true)

export const useJobTheme = () => useLocalStorage('jobTheme', 'default')

export const useReducedAnimation = () => useLocalStorage('reducedAnimation', false)

export const useWorkflowWarnings = () => useLocalStorage('useWorkflowWarnings', true)

export const useLogWordWrapDefault = () => useLocalStorage('logWordWrap', false)

export const useCompactMode = () => useLocalStorage('compactMode', false)
