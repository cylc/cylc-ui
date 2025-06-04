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

// JSON utilities.

/**
 * Custom replacer function for JSON.stringify to handle JS objects that
 * cannot otherwise be serialized.
 */
export function replacer (key, value) {
  if (value instanceof Map) {
    return { _jsonType: 'Map', _val: Array.from(value) }
  }
  if (value instanceof Set) {
    return { _jsonType: 'Set', _val: Array.from(value) }
  }
  return value
}

/**
 * Custom reviver function for JSON.parse to handle JS objects that
 * cannot otherwise be serialized.
 */
export function reviver (key, value) {
  if (value?._jsonType === 'Map') {
    return new Map(value._val)
  }
  if (value?._jsonType === 'Set') {
    return new Set(value._val)
  }
  return value
}
