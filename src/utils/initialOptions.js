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

/* The `initialOptions` prop is used by views to specify any options such as
filters, inputs, toggles etc. that can be loaded when creating the view.
This is used for saving the view state along with the tab layout. */

import { ref, watch } from 'vue'

/**
 * @callback emitter
 * @param {updateInitialOptionsEvent} event
 * @param {...any} args
 */

/** initialOptions prop */
export const initialOptions = {
  type: Object,
  required: false,
  default: () => ({}),
}

export const updateInitialOptionsEvent = 'update:initialOptions'

/**
 * Return a ref that is bound to a sub-property of the initialOptions prop for a view.
 *
 * When the ref's value changes, the initialOptions prop is updated with the new value.
 *
 * @param {string} name
 * @param {{
 *   props: { initialOptions: Record<string,T> },
 *   emit: emitter,
 * }} param1 - component context
 * @param {T=} defaultValue
 * @returns {import('vue').Ref<T>}
 */
export function useInitialOptions (name, { props, emit }, defaultValue) {
  const _ref = ref(props.initialOptions[name] ?? defaultValue)
  watch(
    _ref,
    (val, old) => emit(
      updateInitialOptionsEvent,
      { ...props.initialOptions, [name]: val }
    ),
    { deep: true }
  )
  return _ref
}
