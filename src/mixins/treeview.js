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

import { mapActions, mapState } from 'vuex'
import { applyDeltas } from '@/components/cylc/tree/deltas'
import Alert from '@/model/Alert.model'
/* eslint-disable no-unused-vars */
import User from '@/model/User.model'
/* eslint-enable no-unused-vars */

const treeview = {
  computed: {
    /**
     * We use the user from the store to compute the workflow ID. The view
     * has only the workflow name from the Vue route. We then combine it
     * with the user name and the default divider '|' to create the workflow
     * ID.
     * @return {User}
     */
    ...mapState('user', ['user']),
    /**
     * Compute the workflow ID using the Vue route parameter
     * `workflowName` and the user from the store.
     * @return {string} - the Workflow ID used in this view
     */
    workflowId () {
      return `${this.user.username}|${this.workflowName}`
    },
    /**
     * GraphQL query variables.
     * @returns {{workflowId: string}}
     */
    variables () {
      return {
        workflowId: this.workflowId
      }
    },
    /**
     * Return the workflow hierarchical tree.
     * @return {Array} workflow tree
     */
    workflowTree () {
      return this.tree ? this.tree.root.children : []
    }
  },

  methods: {
    /**
     * Create a UI alert.
     */
    ...mapActions(['setAlert']),
    /**
     * Start view subscription. This initializes the `subscription` instance variable
     * of this view.
     * @return Promise<ZenObservable.Subscription>
     */
    startDeltasSubscription (query, variables, tree) {
      const vm = this
      // start the subscription query
      return this.$workflowService.startSubscription(query, variables, {
        /**
         * @param {{
         *   data: {
         *     deltas: {
         *       id: string,
         *       shutdown: boolean,
         *       added: {
         *         workflow: Object,
         *         cyclePoints: Object,
         *         familyProxies: Object,
         *         taskProxies: Object,
         *         jobs: Object
         *       },
         *       updated: {
         *         workflow: Object,
         *         cyclePoints: Object,
         *         familyProxies: Object,
         *         taskProxies: Object,
         *         jobs: Object
         *       },
         *       pruned: {
         *         taskProxies: [string],
         *         familyProxies: [string],
         *         jobs: [string]
         *       }
         *     }
         *   }
         * }} response
         */
        next: function next (response) {
          applyDeltas(response.data.deltas, tree)
        },
        error: function error (err) {
          vm.setAlert(new Alert(err.message, null, 'error'))
        }
      })
    }
  }
}

export {
  treeview
}
