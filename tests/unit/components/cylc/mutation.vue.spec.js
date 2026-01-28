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
import Mutation from '@/components/cylc/Mutation.vue'
import { createVuetify } from 'vuetify'

const cylcObject = { id: '~u/w//1/t', isFamily: false }

const BASIC_MUTATION = {
  name: 'myMutation',
  description: 'Test example.',
  args: [
    {
      name: 'MyString',
      defaultValue: '"MyDefault"',
      type: {
        name: 'String',
        kind: 'SCALAR',
      },
    },
    {
      name: 'MyInteger',
      type: {
        name: 'Int',
        kind: 'SCALAR',
      },
    },
  ],
  _title: 'My Mutation',
}

describe('Mutation Component', () => {
  /**
   * @param {*} options
   * @returns {Wrapper<FormGenerator>}
   */
  const mountFunction = (options) => {
    const vuetify = createVuetify()
    return mount(Mutation, {
      global: {
        plugins: [vuetify],
      },
      ...options,
    })
  }

  it('should display mutation name and description', () => {
    const wrapper = mountFunction({
      props: {
        initialOptions: {
          cylcObject,
          mutation: BASIC_MUTATION,
        },
        cancel: () => {},
      },
    })
    const html = wrapper.html()
    expect(html).to.contain('My Mutation')
    expect(html).to.contain('Test example.')
  })

  describe('Mutation descriptions', () => {
    const mountWithDescription = (desc) => mountFunction({
      props: {
        initialOptions: {
          cylcObject,
          mutation: {
            name: 'Darmok',
            description: desc,
            args: [],
            _title: 'Darmok',
          },
        },
        cancel: () => {},
      },
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
