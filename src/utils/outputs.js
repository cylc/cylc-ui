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

/** Functionality relating to task output formatting. **/

/** Format a completion expression for display.
 *
 * @param {str} completion - The task's completion expression.
 * @param {Array} outputs - The task's outputs as obtained from GraphQL as an
 * array of objects with "label" and "satisfied" attributes.
 *
 * @returns {Array} - [isSatisfied, indentLevel, text]
 **/

export function formatCompletion (completion, outputs) {
  // the array to return
  const lines = []
  // indent level of the expression
  let indent = 0
  // text yet to be added to the return result
  let buffer = ''

  // break the completion expression down into parts and iterate over them
  for (let part of completion.split(/(and|or|\(|\))/)) {
    part = part.trim()

    if (!part) {
      continue
    }

    if (part === '(') {
      // open bracket
      lines.push([null, indent, `${buffer}(`])
      buffer = ''
      indent = indent + 1
    } else if (part === ')') {
      // close bracket
      indent = indent - 1
      lines.push([null, indent, `${buffer})`])
      buffer = ''
    } else if (part === 'and' || part === 'or') {
      // local operator
      buffer = `${part} `
    } else {
      // Cylc output -> look it up in the outputs Array
      for (const output of outputs) {
        if (output.label === part) {
          lines.push([output.satisfied, indent, `${buffer}${part}`])
          break
        }
      }
      buffer = ''
    }
  }

  return lines
}
