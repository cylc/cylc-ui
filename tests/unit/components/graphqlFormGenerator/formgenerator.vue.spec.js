import { createLocalVue, mount } from '@vue/test-utils'
import FormGenerator from '@/components/graphqlFormGenerator/FormGenerator'
import { expect } from 'chai'
import cloneDeep from 'lodash/cloneDeep'

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
    [null]
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
    [null]
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

describe('FormGenerator Component', () => {
  it('should display mutation name and description', () => {
    const localVue = createLocalVue()
    const wrapper = mount(FormGenerator, {
      localVue,
      propsData: {
        mutation: BASIC_MUTATION
      }
    })
    const html = wrapper.html()
    expect(html).to.contain('My Mutation')
    expect(html).to.contain('Test example.')
  })

  it('should parse default values from the schema for simple types', () => {
    const localVue = createLocalVue()
    const wrapper = mount(FormGenerator, {
      localVue,
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
      const localVue = createLocalVue()
      const wrapper = mount(FormGenerator, {
        localVue,
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
      const localVue = createLocalVue()
      const wrapper = mount(FormGenerator, {
        localVue,
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
    const localVue = createLocalVue()
    const wrapper = mount(FormGenerator, {
      localVue,
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
    const localVue = createLocalVue()
    const wrapper = mount(FormGenerator, {
      localVue,
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
