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

import { expect } from 'chai'
import sinon from 'sinon'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import subscriptionComponentMixin from '@/mixins/subscriptionComponent'
import WorkflowService from '@/services/workflow.service'

const localVue = createLocalVue()

describe('Subscription Component mixin', () => {
  let workflowService, Component
  beforeEach(() => {
    workflowService = sinon.createStubInstance(WorkflowService)
    localVue.prototype.$workflowService = workflowService

    Component = {
      mixins: [subscriptionComponentMixin],
      data: () => ({
        query: { foo: 1 }
      }),
      render () {
      }
    }
  })

  it('subscribes & unsubscribes when the component is mounted & destroyed', () => {
    const component = shallowMount(Component, {
      localVue
    })
    expect(workflowService.subscribe.calledOnceWith(component.vm)).to.equal(true)
    expect(workflowService.startSubscriptions.calledOnce).to.equal(true)
    expect(workflowService.unsubscribe.called).to.equal(false)
    component.vm.$destroy()
    expect(workflowService.unsubscribe.calledOnceWith(component.vm)).to.equal(true)
  })

  it('un- & re-subcribes when the query changes', () => {
    const component = shallowMount(Component, {
      localVue
    })
    component.vm.query = { foo: 2 }
    component.vm.$nextTick(() => {
      expect(workflowService.unsubscribe.calledOnceWith(component.vm)).to.equal(true)
      expect(workflowService.subscribe.calledTwice).to.equal(true)
      expect(workflowService.startSubscriptions.calledTwice).to.equal(true)
    })
  })
})
