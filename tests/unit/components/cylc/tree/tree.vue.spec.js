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
import { shallowMount } from '@vue/test-utils'
import { expect } from 'chai'
// import vuetify here so that we do not have warnings in the console output
// eslint-disable-next-line no-unused-vars
import * as vuetify from '@/plugins/vuetify'
import Tree from '@/components/cylc/tree/Tree'
import { simpleWorkflowTree4Nodes } from './tree.data'

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
    const wrapper = shallowMount(Tree, {
      propsData: {
        treeData: simpleWorkflowTree4Nodes[0].children
      }
    })
    expect(wrapper.props().treeData[0].node.__typename).to.equal('CyclePoint')
  })
})
