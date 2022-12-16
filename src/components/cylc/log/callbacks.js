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

import isArray from 'lodash/isArray'
import Vue from 'vue'

class LogsCallback {
  constructor () {
    this.logs = null
  }

  tearDown (store, errors) {
    store.commit('workflows/SET_LOG', {})
    this.logs = null
  }

  onAdded (added, store, errors) {
    this.logs = Object.assign({}, store.state.workflows.logs)
    const logs = isArray(added) ? added : [added]
    try {
      if (!this.logs.scheduler_logs) {
        Vue.set(this.logs, 'scheduler_logs', logs)
      } else {
        this.logs.scheduler_logs.push(...logs)
      }
    } catch (error) {
      errors.push([
        'Error adding logs, see browser console logs for more.',
        error,
        logs,
        this.logs
      ])
    }
  }

  commit (store, errors) {
    store.commit('workflows/SET_LOG', this.logs)
  }
}

export default LogsCallback
