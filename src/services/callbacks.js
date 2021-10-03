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

class DeltasCallback {
  /**
   * @param {Deltas} deltas
   * @param {Vuex} store
   * @param {Array<Object>} errors
   */
  before (deltas, store, errors) {}

  /**
   * @param {Deltas} deltas
   * @param {Vuex} store
   * @param {Array<Object>} errors
   */
  after (deltas, store, errors) {}

  /**
   * @param {Vuex} store - Vuex store
   * @param {Array<Object>} errors
   */
  tearDown (store, errors) {}

  /**
   * @param {DeltasAdded|Object} added
   * @param {Vuex} store
   * @param {Array<Object>} errors
   */
  onAdded (added, store, errors) {}

  /**
   * @param {DeltasUpdated|Object} updated
   * @param {Vuex} store
   * @param {Array<Object>} errors
   */
  onUpdated (updated, store, errors) {}

  /**
   * @param {DeltasPruned|Object} pruned -
   * @param {Vuex} store - Vuex store
   * @param {Array<Object>} errors
   */
  onPruned (pruned, store, errors) {}

  /**
   * @param {Vuex} store - Vuex store
   * @param {Array<Object>} errors
   */
  commit (store, errors) {}
}

export default DeltasCallback
