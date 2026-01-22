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

const IntrospectionQuery = require('./IntrospectionQuery.json')
const taskProxy = require('./taskProxy.json')
const familyProxy = require('./familyProxy.json')
const { one, workflows, Workflow } = require('./workflows/index.cjs')
const { LogData } = require('./logData.cjs')
const { LogFiles, Jobs } = require('./logFiles.cjs')
const analysisQuery = require('./analysisQuery.json')
const ganttQuery = require('./ganttQuery.json')
const InfoViewSubscription = require('./infoView.json')

module.exports = {
  IntrospectionQuery,
  taskProxy,
  familyProxy,
  LogData,
  LogFiles,
  Jobs,
  App: workflows,
  Workflow,
  GraphIQLTest: one,
  analysisTaskQuery: analysisQuery.taskQuery,
  analysisJobQuery: analysisQuery.jobQuery,
  analysisQuery,
  ganttQuery,
  InfoViewSubscription,
}
