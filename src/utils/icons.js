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
export const taskRetry = 'm14.7 2.5c-0.179-0.0044-0.358-0.0037-0.538 0.0021-0.958 0.031-1.92 0.208-2.86 0.539-3.3 1.17-5.65 4.05-6.2 7.44l-5.13-1.23 6.86 9.23 6.86-9.23-5.35 1.19c0.511-2.02 2-3.69 4.02-4.41 2.5-0.886 5.28-0.124 6.98 1.91 1.7 2.04 1.95 4.91 0.625 7.21-1.32 2.3-3.93 3.53-6.54 3.09a1.58 1.58 0 0 0-1.82 1.3 1.58 1.58 0 0 0 1.3 1.82c3.91 0.661 7.84-1.19 9.81-4.63 1.98-3.44 1.6-7.76-0.938-10.8-1.79-2.14-4.39-3.35-7.07-3.41z'
export const taskHeld = 'm12 0.5c-6.34 0-11.5 5.17-11.5 11.5-1.9e-7 6.33 5.16 11.5 11.5 11.5 6.34 0 11.5-5.17 11.5-11.5 0-6.33-5.16-11.5-11.5-11.5zm0 2.74c4.85 0 8.76 3.9 8.76 8.76 0 4.85-3.9 8.76-8.76 8.76-4.85 0-8.76-3.9-8.76-8.76 0-4.85 3.9-8.76 8.76-8.76zm-3.2 2.36a2.05 2.05 0 0 0-2.05 2.05v8.7a2.05 2.05 0 0 0 2.05 2.05 2.05 2.05 0 0 0 2.05-2.05v-8.7a2.05 2.05 0 0 0-2.05-2.05zm6.4 0a2.05 2.05 0 0 0-2.05 2.05v8.7a2.05 2.05 0 0 0 2.05 2.05 2.05 2.05 0 0 0 2.05-2.05v-8.7a2.05 2.05 0 0 0-2.05-2.05z'
