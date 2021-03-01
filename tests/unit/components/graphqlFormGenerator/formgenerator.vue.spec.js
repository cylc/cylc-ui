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
import FormGenerator from '@/components/graphqlFormGenerator/FormGenerator'
import { expect } from 'chai'
import cloneDeep from 'lodash/cloneDeep'
import Vue from 'vue'
import Vuetify from 'vuetify'

// suppress "ReferenceError: requestAnimationFrame is not defined" errors
global.requestAnimationFrame = cb => cb()

const BASIC_MUTATION = {
  name: 'My Mutation',
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
  ]
}

const INPUT_OBJECT = {
  name: 'MyInputObject',
  kind: 'INPUT_OBJECT',
  inputFields: [
    {
      name: 'MyString',
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
  ]
}

const NESTED_TYPES = [
  // [<GraphQL Type (from introspection query)>, defaultNullValue]
  [
    {
      // start with something simple
      name: 'NonNull<String>',
      defaultValue: '"Can\'t null this"',
      type: {
        name: null,
        kind: 'NON_NULL',
        ofType: {
          name: 'String',
          kind: 'SCALAR'
        }
      }
    },
    null
  ],
  [
    {
      // still just one level of nesting
      name: 'List<String>',
      defaultValue: '["abc"]',
      type: {
        name: null,
        kind: 'LIST',
        ofType: {
          name: 'String',
          kind: 'SCALAR'
        }
      }
    },
    []
  ],
  [
    {
      // input objects are a little more interesting
      name: 'List<MyInputObject>',
      defaultValue: '[{"key": "[env]FOO", "value": "foo"}]',
      type: {
        name: null,
        kind: 'LIST',
        ofType: {
          name: 'MyInputObject',
          kind: 'INPUT_OBJECT'
        }
      }
    },
    [{}]
  ],
  [
    {
      // okay time to go deep
      name: 'NonNull<List<NonNull<String>>>',
      defaultValue: '["abc"]',
      type: {
        name: null,
        kind: 'NON_NULL',
        ofType: {
          name: null,
          kind: 'LIST',
          ofType: {
            name: null,
            kind: 'NON_NULL',
            ofType: {
              name: 'String',
              kind: 'SCALAR'
            }
          }
        }
      }
    },
    []
  ],
  [
    {
      // too deep dammit
      name: 'NonNull<List<NonNull<MyInputObject>>>',
      defaultValue: '[{"key": "[env]FOO", "value": "foo"}]',
      type: {
        name: null,
        kind: 'NON_NULL',
        ofType: {
          name: null,
          kind: 'LIST',
          ofType: {
            name: null,
            kind: 'NON_NULL',
            ofType: {
              name: 'MyInputObject',
              kind: 'INPUT_OBJECT'
            }
          }
        }
      }
    },
    [{}]
  ]
]

const localVue = createLocalVue()

Vue.use(Vuetify)

describe('FormGenerator Component', () => {
  /**
   * @param {*} options
   * @returns {Wrapper<FormGenerator>}
   */
  const mountFunction = options => {
    const vuetify = new Vuetify()
    return mount(FormGenerator, {
      localVue,
      vuetify,
      ...options
    })
  }
  it('should display mutation name and description', () => {
    const wrapper = mountFunction({
      propsData: {
        mutation: BASIC_MUTATION
      }
    })
    const html = wrapper.html()
    expect(html).to.contain('My Mutation')
    expect(html).to.contain('Test example.')
  })

  it('should parse default values from the schema for simple types', () => {
    const wrapper = mountFunction({
      propsData: {
        mutation: BASIC_MUTATION
      }
    })
    expect(wrapper.vm.$data.model).to.deep.equal({
      MyString: 'MyDefault',
      MyInteger: null
    })
  })

  it('should parse default values from the schema for nested types', () => {
    NESTED_TYPES.forEach(([type, defaultValue]) => {
      const wrapper = mountFunction({
        propsData: {
          mutation: {
            name: type.name + 'Mutation',
            description: 'Beef Wellington',
            args: [type]
          },
          types: [INPUT_OBJECT]
        }
      })
      const expected = {}
      expected[type.name] = JSON.parse(type.defaultValue)
      expect(wrapper.vm.$data.model).to.deep.equal(expected)
    })
  })

  it('should provide appropriate null types where no default is provided', () => {
    NESTED_TYPES.forEach(([type, defaultValue]) => {
      type = cloneDeep(type)
      delete type.defaultValue
      const wrapper = mountFunction({
        propsData: {
          mutation: {
            name: type.name + 'Mutation',
            description: 'Beef Wellington',
            args: [type]
          },
          types: [INPUT_OBJECT]
        }
      })
      const expected = {}
      expected[type.name] = defaultValue
      expect(wrapper.vm.$data.model).to.deep.equal(expected)
    })
  })

  it('should handle initial data', () => {
    const wrapper = mountFunction({
      propsData: {
        mutation: BASIC_MUTATION,
        initialData: {
          MyString: 'Foo'
        }
      }
    })
    expect(wrapper.vm.$data.model).to.deep.equal({
      MyString: 'Foo',
      MyInteger: null
    })
  })

  it('should reset to initial conditions', () => {
    const wrapper = mountFunction({
      propsData: {
        mutation: BASIC_MUTATION,
        initialData: {
          MyString: 'Foo'
        }
      }
    })
    const before = wrapper.vm.$data.model
    wrapper.vm.reset()
    expect(wrapper.vm.$data.model).to.deep.equal(before)
  })
})
