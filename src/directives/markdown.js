/*
 * Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.
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

import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

/** Render the bound markdown string as the element's HTML content. */
export const vMarkdown = {
  mounted (el, { value }) {
    el.classList.add('markdown')
    el.innerHTML = md.render(value)
  },

  updated (el, { value, oldValue }) {
    if (value !== oldValue) {
      el.innerHTML = md.render(value)
    }
  },
}
