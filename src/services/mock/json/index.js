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

const DashboardSubscriptionQuery = require('./DashboardSubscriptionQuery.json')
const IntrospectionQuery = require('./IntrospectionQuery.json')
const GscanSubscriptionQuery = require('./GscanSubscriptionQuery.json')
const OnWorkflowTreeDeltasData = require('./OnWorkflowTreeDeltasData.json')
const WorkflowsTableQuery = require('./WorkflowsTableQuery.json')
const userProfile = require('./userprofile.json')

module.exports = {
  DashboardSubscriptionQuery,
  IntrospectionQuery,
  GscanSubscriptionQuery,
  OnWorkflowTreeDeltasData,
  WorkflowsTableQuery,
  userProfile
}
