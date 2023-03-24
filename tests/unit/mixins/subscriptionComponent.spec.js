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

import { mount } from '@vue/test-utils'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'

describe('Subscription Component mixin', () => {
  let $workflowService
  beforeEach(() => {
    $workflowService = {
      subscribe (componentOrView) {
        componentOrView.subscribed = true
      },
      unsubscribe (componentOrView) {
        componentOrView.subscribed = false
      }
    }
  })
  it('should provide a hook for when the component is created', () => {
    const Component = {
      mixins: [subscriptionComponentMixin],
      render () { }
    }
    const component = mount(Component, {
      global: {
        mocks: { $workflowService }
      }
    })
    expect(component.vm.subscribed).to.equal(true)
  })
  it('should provide a hook for when the component is destroyed', () => {
    const Component = {
      mixins: [subscriptionComponentMixin],
      render () { }
    }
    const component = mount(Component, {
      global: {
        mocks: { $workflowService }
      }
    })
    expect(component.vm.subscribed).to.equal(true)
    component.unmount()
    expect(component.vm.subscribed).to.equal(false)
  })
})
