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

// we mount the tree to include the TreeItem component and other vuetify children components
import { mount } from '@vue/test-utils'
import { expect } from 'chai'
// import vuetify here so that we do not have warnings in the console output
// eslint-disable-next-line no-unused-vars
import * as vuetify from '@/plugins/vuetify'
import { simpleWorkflowTree4Nodes } from './tree.data'
import TreeView from '@/views/Tree'

/// vue-observe-visibility transitive dependency requires it
global.IntersectionObserver = class IntersectionObserver {
  // eslint-disable-next-line no-useless-constructor
  constructor () {}

  observe () {
    return null
  }

  unobserve () {
    return null
  }
}

describe('Tree component', () => {
  it('should display the tree with valid data', () => {
    // eslint-disable-next-line no-unused-vars
    const parent = mount(TreeView, {
      propsData: {
        workflowName: simpleWorkflowTree4Nodes[0].id
      }
    })
    const tree = parent.vm.$data.tree
    // add the workflow to the tree, this is the root node now
    tree.setWorkflow(simpleWorkflowTree4Nodes[0])
    expect(parent.props().workflowName).to.equal(simpleWorkflowTree4Nodes[0].id)
    const treeComponent = parent.vm.$refs.tree0
    expect(treeComponent).to.not.equal(undefined)
  })
})
