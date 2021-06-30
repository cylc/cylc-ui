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
 * @typedef {Object} GraphQLResponseData
 * @property {Deltas} deltas
 */

/**
 * @typedef {Object} Deltas
 * @property {string} id
 * @property {boolean} shutdown
 * @property {?DeltasAdded} added
 * @property {?DeltasUpdated} updated
 * @property {?DeltasPruned} pruned
 */

/**
 * @typedef {Object} WorkflowGraphQLData
 * @property {string} id
 */

/**
 * @typedef {Object} DeltasAdded
 * @property {WorkflowGraphQLData} workflow
 * @property {Array<Object>} cyclePoints
 * @property {Array<Object>} familyProxies
 * @property {Array<Object>} taskProxies
 * @property {Array<Object>} jobs
 */

/**
 * @typedef {Object} DeltasUpdated
 * @property {Object} workflow
 * @property {Array<Object>} familyProxies
 * @property {Array<Object>} taskProxies
 * @property {Array<Object>} jobs
 */

/**
 * @typedef {Object} DeltasPruned
 * @property {Array<string>} workflows
 * @property {Array<string>} taskProxies - IDs of task proxies removed
 * @property {Array<string>} familyProxies - IDs of family proxies removed
 * @property {Array<string>} jobs - IDs of jobs removed
 */
