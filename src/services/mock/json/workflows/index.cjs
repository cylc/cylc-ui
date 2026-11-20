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

const one = require('./one')
const multi = require('./multi')
const linear = require('./linear.cjs')

const workflows = [one, ...multi, linear.initial]

/**
 * Continuously yield the deltas for a workflow subscription.
 *
 * Supports both a single static deltas object (yielded once, as in
 * one.json/multi.json), and an array of deltas to be yielded in sequence
 * (e.g. to simulate updates received over time).
 *
 * @param {{ workflowID: string }} variables
 */
async function* Workflow ({ workflowID }) {
  if (workflowID === linear.initial.deltas.id) {
    yield* linear.next()
  } else {
    yield workflows.find(({ deltas }) => deltas.id === workflowID) || {}
  }
}

module.exports = {
  one,
  workflows,
  Workflow,
}
