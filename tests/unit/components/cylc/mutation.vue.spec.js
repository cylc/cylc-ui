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

import { createLocalVue, mount } from '@vue/test-utils'
import Mutation from '@/components/cylc/Mutation'
import { expect } from 'chai'
import Vue from 'vue'
import Vuetify from 'vuetify'

const BASIC_MUTATION = {
  name: 'myMutation',
  description: 'Test example.',
  args: [
    {
      name: 'MyString',
      defaultValue: '"MyDefault"',
      type: {
        name: 'String',
        kind: 'SCALAR'
      }
    },
    {
      name: 'MyInteger',
      type: {
        name: 'Int',
        kind: 'SCALAR'
      }
    }
  ],
  _title: 'My Mutation'
}

const localVue = createLocalVue()
Vue.use(Vuetify)

describe('Mutation Component', () => {
  /**
   * @param {*} options
   * @returns {Wrapper<FormGenerator>}
   */
  const mountFunction = (options) => {
    const vuetify = new Vuetify()
    return mount(Mutation, {
      localVue,
      vuetify,
      ...options
    })
  }

  it('should display mutation name and description', () => {
    const wrapper = mountFunction({
      propsData: {
        mutation: BASIC_MUTATION,
        cancel: () => {}
      }
    })
    const html = wrapper.html()
    expect(html).to.contain('My Mutation')
    expect(html).to.contain('Test example.')
  })

  describe('Mutation descriptions', () => {
    const mountWithDescription = (desc) => mountFunction({
      propsData: {
        mutation: {
          name: 'Darmok',
          description: desc,
          args: [],
          _title: 'Darmok'
        },
        cancel: () => {}
      }
    })
    describe('For a single line description', () => {
      const desc = 'Lorem ipsum.'
      const wrapper = mountWithDescription(desc)
      describe('.shortDescription', () => {
        it('should be the whole description', () => {
          expect(wrapper.vm.shortDescription).to.equal(desc)
        })
      })
      describe('.extendedDescription', () => {
        it('should be empty', () => {
          expect(wrapper.vm.extendedDescription).to.equal('')
        })
      })
    })
    describe('For a multiline description', () => {
      const shortDesc = 'Darmok and Jalad at\nTanagra.'
      const extendedDesc = 'Shaka when the\nwalls fell.\n\nTemba, his arms wide.'
      const desc = `${shortDesc}\n\n${extendedDesc}`
      const wrapper = mountWithDescription(desc)
      describe('.shortDescription', () => {
        it('should be the bit before the first double newline', () => {
          expect(wrapper.vm.shortDescription).to.equal(shortDesc)
        })
      })
      describe('.extendedDescription', () => {
        it('should be everything after the first double newline', () => {
          expect(wrapper.vm.extendedDescription).to.equal(extendedDesc)
        })
      })
    })
  })
})
