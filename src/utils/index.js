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

import { i18n } from '@/i18n'

/**
 * i18n-enabled operation, to get the title respecting the locale used
 * in the application settings.
 * @param {string} key - i18n key
 * @param {Object} params - optional object key=value used in the i18n message
 * @returns {string}
 */
export const getPageTitle = (key, params = {}) => {
  return `${i18n.global.t('App.name')} | ${i18n.global.t(key, params)}`
}
