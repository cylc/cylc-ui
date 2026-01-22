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
import FormGenerator from '@/components/graphqlFormGenerator/FormGenerator.vue'
import { cloneDeep } from 'lodash'
import { createVuetify } from 'vuetify'

const BASIC_MUTATION = {
  name: 'My Mutation',
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
}

const CUSTOM_OBJECT = {
  name: 'MyObject',
  kind: 'OBJECT',
  fields: [
    {
      name: 'MyString',
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
          kind: 'SCALAR',
        },
      },
    },
    null,
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
          kind: 'SCALAR',
        },
      },
    },
    [],
  ],
  [
    {
      // general objects are a little more interesting
      name: 'List<MyObject>',
      defaultValue: '[{"key": "[env]FOO", "value": "foo"}]',
      type: {
        name: null,
        kind: 'LIST',
        ofType: {
          name: 'MyObject',
          kind: 'OBJECT',
        },
      },
    },
    [{ MyString: null, MyInteger: null }],
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
              kind: 'SCALAR',
            },
          },
        },
      },
    },
    [],
  ],
  [
    {
      // too deep dammit
      name: 'NonNull<List<NonNull<MyObject>>>',
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
              name: 'MyObject',
              kind: 'OBJECT',
            },
          },
        },
      },
    },
    [{ MyString: null, MyInteger: null }],
  ],
]

/**
 * Return the data.model for a wrapper.
 *
 * NOTE: clones to avoid "TypeError: Cannot convert a Symbol value to a string"
 */
function getModel (wrapper) {
  return cloneDeep(wrapper.vm.$data.model)
}

describe('FormGenerator Component', () => {
  const vuetify = createVuetify()
  /**
   * @param {*} options
   * @returns {Wrapper<FormGenerator>}
   */
  const mountFunction = (options) => mount(FormGenerator, {
    global: {
      plugins: [vuetify],
    },
    ...options,
  })

  it('should parse default values from the schema for simple types', () => {
    const wrapper = mountFunction({
      props: {
        mutation: BASIC_MUTATION,
      },
    })
    expect(getModel(wrapper)).to.deep.equal({
      MyString: 'MyDefault',
      MyInteger: null,
    })
  })

  it('should parse default values from the schema for nested types', () => {
    NESTED_TYPES.forEach(([type, defaultValue]) => {
      const wrapper = mountFunction({
        props: {
          mutation: {
            name: type.name + 'Mutation',
            description: 'Beef Wellington',
            args: [type],
          },
          types: [CUSTOM_OBJECT],
        },
      })
      const expected = { [type.name]: JSON.parse(type.defaultValue) }
      expect(getModel(wrapper)).to.deep.equal(expected)
    })
  })

  it('should provide appropriate null types where no default is provided', () => {
    NESTED_TYPES.forEach(([type, defaultValue]) => {
      type = cloneDeep(type)
      delete type.defaultValue
      const wrapper = mountFunction({
        props: {
          mutation: {
            name: type.name + 'Mutation',
            description: 'Beef Wellington',
            args: [type],
          },
          types: [CUSTOM_OBJECT],
        },
      })
      const expected = { [type.name]: defaultValue }
      expect(getModel(wrapper)).to.deep.equal(expected)
    })
  })

  it('should handle initial data', () => {
    const wrapper = mountFunction({
      props: {
        mutation: BASIC_MUTATION,
        data: {
          MyString: 'Foo',
        },
      },
    })
    expect(getModel(wrapper)).to.deep.equal({
      MyString: 'Foo',
      MyInteger: null,
    })
  })

  it('should reset to initial state', () => {
    const wrapper = mountFunction({
      props: {
        mutation: BASIC_MUTATION,
        initialData: {
          MyString: 'before',
        },
        data: {
          MyString: 'after',
        },
      },
    })
    expect(getModel(wrapper).MyString).to.deep.equal('after')
    wrapper.vm.reset()
    expect(getModel(wrapper).MyString).to.deep.equal('before')
  })

  it('should reset to defaults', () => {
    const wrapper = mountFunction({
      props: {
        mutation: BASIC_MUTATION,
        data: {
          MyString: 'after',
        },
      },
    })
    expect(getModel(wrapper).MyString).to.deep.equal('after')
    wrapper.vm.reset()
    expect(getModel(wrapper).MyString).to.deep.equal('MyDefault')
  })
})
