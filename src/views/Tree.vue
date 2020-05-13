<!--
Copyright (C) NIWA & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <div>
    <div class="c-tree">
      <tree
        :workflows="workflowTree"
        :hoverable="false"
        :activable="false"
        :multiple-active="false"
        :min-depth="1"
        ref="tree0"
        key="tree0"
      ></tree>
    </div>
  </div>
</template>

<script>
import { mixin } from '@/mixins'
import { mapState } from 'vuex'
import Tree from '@/components/cylc/tree/Tree'
import { WORKFLOW_TREE_SUBSCRIPTION } from '@/graphql/queries'
import store from '@/store'
import Alert from '@/model/Alert.model'
import {
  convertGraphQLWorkflowToTree,
  createCyclePointNode,
  createFamilyProxyNode, createJobNode,
  createTaskProxyNode
} from '@/components/cylc/tree'

export default {
  mixins: [mixin],

  props: {
    workflowName: {
      type: String,
      required: true
    }
  },

  components: {
    tree: Tree
  },

  metaInfo () {
    return {
      title: this.getPageTitle('App.workflow', { name: this.workflowName })
    }
  },

  data: () => ({
    viewID: '',
    subscriptions: {},
    isLoading: true,
    observable: null,
    /**
     * @type CylcTree
     */
    tree: null
  }),

  computed: {
    ...mapState('user', ['user']),
    workflowTree () {
      return this.tree !== null ? this.tree.root.children : []
    }
  },

  mounted () {
    this.viewID = `Tree(${this.workflowName}): ${Math.random()}`
    const workflowId = `${this.user.username}|${this.workflowName}`
    const variables = {
      workflowId
    }

    const vm = this
    this.observable = this.$workflowService.apolloClient.subscribe({
      query: WORKFLOW_TREE_SUBSCRIPTION,
      variables: variables,
      fetchPolicy: 'no-cache'
    }).subscribe({
      /**
       * @param {{
       *   data: {
       *     deltas: {
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
      next (response) {
        if (response.data && response.data.deltas) {
          const deltas = response.data.deltas
          if (vm.tree === null) {
            // no tree, this means we **MUST** get the data necessary in the initial burst of data, or fail
            if (!deltas.added.workflow) {
              // This is a fatal error, as we don't have a way to proceed
              vm.observable.unsubscribe()
              store.dispatch(
                'setAlert',
                new Alert('Workflow tree subscription did not return the right initial burst of data', null, 'error')
              )
            }
            const workflow = deltas.added.workflow
            // A workflow (e.g. five) may not have any families as 'root' is filtered
            Object.assign(workflow.familyProxies, workflow.familyProxies || {})
            vm.tree = convertGraphQLWorkflowToTree(workflow)
          } else {
            // the tree was created, and now the next messages should contain
            // 1. new data added under deltas.added (but not in deltas.added.workflow)
            // 2. data updated in deltas.updated
            // 3. data pruned in deltas.pruned
            if (deltas.pruned) {
              vm.applyDeltasPruned(deltas.pruned)
            }
            if (deltas.added) {
              vm.applyDeltasAdded(deltas.added)
            }
            if (deltas.updated) {
              vm.applyDeltasUpdated(deltas.updated)
            }
          }
        } else {
          throw Error('Workflow tree subscription did not return data.deltas')
        }
      },
      error (err) {
        store.dispatch(
          'setAlert',
          new Alert(err.message, null, 'error')
        )
      },
      complete () {
      }
    })
  },

  beforeRouteLeave (to, from, next) {
    if (this.observable !== null) {
      this.observable.unsubscribe()
    }
    next()
  },

  methods: {
    /** Toggle the isLoading state.
     * @param {bool} isActive - Are this views subs active.
     */
    setActive (isActive) {
      this.isLoading = !isActive
    },
    /**
     * Deltas pruned.
     *
     * @param {{
     *   taskProxies: [string],
     *   familyProxies: [string],
     *   jobs: [string]
     * }} pruned
     */
    applyDeltasPruned (pruned) {
      // jobs
      if (pruned.jobs) {
        for (const jobId of pruned.jobs) {
          this.tree.removeJob(jobId)
        }
      }
      // task proxies
      if (pruned.taskProxies) {
        for (const taskProxyId of pruned.taskProxies) {
          this.tree.removeTaskProxy(taskProxyId)
        }
      }
      // family proxies
      if (pruned.familyProxies) {
        for (const familyProxyId of pruned.familyProxies) {
          this.tree.removeFamilyProxy(familyProxyId)
        }
      }
    },
    /**
     * Deltas added.
     *
     * @param {{
     *   workflow: Object,
     *   cyclePoints: [Object],
     *   familyProxies: [Object],
     *   taskProxies: [Object],
     *   jobs: [Object]
     * }} added
     */
    applyDeltasAdded (added) {
      if (added.cyclePoints) {
        added.cyclePoints.forEach(cyclePoint => {
          const cyclePointNode = createCyclePointNode(cyclePoint)
          this.tree.addCyclePoint(cyclePointNode)
        })
      }
      if (added.familyProxies) {
        added.familyProxies.forEach(familyProxy => {
          const familyProxyNode = createFamilyProxyNode(familyProxy)
          this.tree.addFamilyProxy(familyProxyNode)
        })
      }
      if (added.taskProxies) {
        added.taskProxies.forEach(taskProxy => {
          const taskProxyNode = createTaskProxyNode(taskProxy)
          this.tree.addTaskProxy(taskProxyNode)
        })
      }
      if (added.jobs) {
        added.jobs.forEach(job => {
          const jobNode = createJobNode(job, '')
          this.tree.addJob(jobNode)
        })
      }
    },
    /**
     * Deltas updated.
     *
     * @param updated {{
     *   familyProxies: [Object],
     *   taskProxies: [Object],
     *   jobs: [Object]
     * }} updated
     */
    applyDeltasUpdated (updated) {
      if (updated.familyProxies) {
        updated.familyProxies.forEach(familyProxy => {
          const familyProxyNode = createFamilyProxyNode(familyProxy)
          this.tree.updateFamilyProxy(familyProxyNode)
        })
      }
      if (updated.taskProxies) {
        updated.taskProxies.forEach(taskProxy => {
          const taskProxyNode = createTaskProxyNode(taskProxy)
          this.tree.updateTaskProxy(taskProxyNode)
        })
      }
      if (updated.jobs) {
        updated.jobs.forEach(job => {
          const jobNode = createJobNode(job, '')
          this.tree.updateJob(jobNode)
        })
      }
    }
  }
}
</script>
