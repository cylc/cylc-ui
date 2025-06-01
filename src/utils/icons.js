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

/**
 * SVG icons for use in the Cylc UI:
 * - Centralise icons for use throughout multiple components.
 * - Define custom icons.
 * - Reformat icons for other source.
 *
 * Note, the `<v-icon>` component expects icons in the MDI format i.e.:
 * - A string representing an SVG path.
 * - Consisting of a bezier curve (e.g. `M 0,0 C 1,1 Z`).
 * - That fits within a 24px box.
 */

import { siJupyter } from 'simple-icons'

export const jupyterLogo = siJupyter.svg.replace(/.*d="(.*)".*/, '$1')
