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
 * @param {object} task - The task to evaluate
 * @param {object} tasksFilter - The filter to apply to the task
 * @return {boolean} Boolean determining if task should be displayed
 */
export function matchTask (task, tasksFilter) {
  // Split the filter into individual words and conduct a search for each one
  const filter = tasksFilter.name.split(/(\s+)/).filter(
    function (e) { return e.trim().length > 0 }
  )
  let ret = false
  // If the filter is empty, return true
  if (!filter.length) {
    ret = true
  } else {
    for (const element of filter) {
      if (task.name.includes(element)) {
        ret = true
      }
    }
  }
  if (tasksFilter.platformOption.trim?.()) {
    ret &&= task.platform === tasksFilter.platformOption
  }
  return ret
}

/**
 * Function to find the unique platforms in an array of tasks
 *
 * @export
 * @param {array} tasks - The tasks to search for unique platforms
 * @return {array} - An array of unique platform objects
 */
export function platformOptions (tasks) {
  const platformOptions = [{ value: -1, title: 'All' }]
  const platforms = []
  for (const task of tasks) {
    if (!platforms.includes(task.platform)) {
      platforms.push(task.platform)
      platformOptions.push({ value: task.platform, title: task.platform })
    }
  }
  return platformOptions
}
