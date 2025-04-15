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
 * Function to determine if a task should be displayed given a certain filter
 * Checks the name includes a search string and if the platform is equal to
 * that chosen
 *
 * @export
 * @param {Record<string,Object[]>} tasks - Mapping of task names to their jobs.
 * @param {{ name: string[], platformOption: string|-1 }} tasksFilter - The filter to apply to the tasks
 * @return {Record<string,Object[]>} An Object with the tasks that made it through the filter
 */
export function matchTasks (tasks, tasksFilter) {
  const { name, platformOption } = tasksFilter
  return Object.fromEntries(Object.entries(tasks).filter(
    ([taskName, value]) => (
      (
        !name.length || name.includes(taskName)
      ) && (
        platformOption === -1 || value.some(({ platform }) => platform === platformOption)
      )
    )
  ))
}

/**
 * Function to find the unique platforms in an object of tasks
 *
 * @export
 * @param {object} tasks - The tasks to search for unique platforms
 * @return {array} - An array of unique platform objects
 */
export function platformOptions (tasks) {
  const platformOptions = [{ value: -1, title: 'All' }]
  const platforms = []
  for (const jobs of Object.values(tasks)) {
    for (let i = 0; i < jobs.length; i++) {
      if (!platforms.includes(jobs[i].platform)) {
        platforms.push(jobs[i].platform)
        platformOptions.push({
          value: jobs[i].platform,
          title: jobs[i].platform,
        })
      }
    }
  }
  return platformOptions
}
