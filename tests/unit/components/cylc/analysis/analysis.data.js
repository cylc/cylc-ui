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

const analysisTasks = [
  {
    name: 'succeeded',
    platform: 'platform_1',
    count: 42,
    meanTotalTime: 32,
    stdDevTotalTime: 0,
    minTotalTime: 32,
    firstQuartileTotal: 32,
    secondQuartileTotal: 32,
    thirdQuartileTotal: 32,
    maxTotalTime: 32,
    meanRunTime: 21,
    stdDevRunTime: 0,
    minRunTime: 21,
    firstQuartileRun: 21,
    secondQuartileRun: 21,
    thirdQuartileRun: 21,
    maxRunTime: 21,
    meanQueueTime: 11,
    stdDevQueueTime: 0,
    minQueueTime: 11,
    firstQuartileQueue: 11,
    secondQuartileQueue: 11,
    thirdQuartileQueue: 11,
    maxQueueTime: 11
  },
  {
    name: 'eventually_succeeded',
    platform: 'platform_2',
    count: 42,
    meanTotalTime: 30,
    stdDevTotalTime: 0,
    minTotalTime: 30,
    firstQuartileTotal: 30,
    secondQuartileTotal: 30,
    thirdQuartileTotal: 30,
    maxTotalTime: 30,
    meanRunTime: 20,
    stdDevRunTime: 0,
    minRunTime: 20,
    firstQuartileRun: 20,
    secondQuartileRun: 20,
    thirdQuartileRun: 20,
    maxRunTime: 20,
    meanQueueTime: 10,
    stdDevQueueTime: 0,
    minQueueTime: 10,
    firstQuartileQueue: 10,
    secondQuartileQueue: 10,
    thirdQuartileQueue: 10,
    maxQueueTime: 10
  },
  {
    name: 'waiting',
    platform: 'platform_1',
    count: 41,
    meanTotalTime: 34,
    stdDevTotalTime: 0,
    minTotalTime: 34,
    firstQuartileTotal: 34,
    secondQuartileTotal: 34,
    thirdQuartileTotal: 34,
    maxTotalTime: 34,
    meanRunTime: 22,
    stdDevRunTime: 0,
    minRunTime: 22,
    firstQuartileRun: 22,
    secondQuartileRun: 22,
    thirdQuartileRun: 22,
    maxRunTime: 22,
    meanQueueTime: 12,
    stdDevQueueTime: 0,
    minQueueTime: 12,
    firstQuartileQueue: 12,
    secondQuartileQueue: 12,
    thirdQuartileQueue: 12,
    maxQueueTime: 12
  }
]

export {
  analysisTasks
}
