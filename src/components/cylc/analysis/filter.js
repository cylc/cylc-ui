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
  let ret = true
  if (tasksFilter.name?.trim()) {
    ret &&= task.name.includes(tasksFilter.name)
  }
  if (tasksFilter.platformOption?.trim()) {
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
  const platformOptions = [{ text: 'All', value: null }]
  const platforms = []
  for (const task of Object.values(tasks)) {
    if (!platforms.includes(task.platform)) {
      platforms.push(task.platform)
      platformOptions.push({ text: task.platform, value: task.platform })
    }
  }
  return platformOptions
}
