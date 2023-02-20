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
import { createLocalVue, shallowMount } from '@vue/test-utils'

import optionsMixin from '@/mixins/options'

const localVue = createLocalVue()

describe('options mixin', () => {
  it('should create the GraphQL Query variables', () => {
    // the mixin should auto-populate `data.options` using the configured
    // defaults and any provided `props.initialOptions`
    const Component = {
      mixins: [optionsMixin],
      defaults: { a: 1, b: 2 },
      render () {}
    }
    const component = shallowMount(Component, {
      localVue,
      propsData: { initialOptions: { b: 3, c: 4 } }
    })

    const options = component.vm.$data.options

    expect(options.a).to.equal(1)
    expect(options.b).to.equal(3)
    expect(options.c).to.equal(4)
  })
})
