import { createLocalVue, mount } from '@vue/test-utils'
import FormGenerator from '@/components/graphqlFormGenerator/FormGenerator'
import { expect } from 'chai'

// suppress "ReferenceError: requestAnimationFrame is not defined" errors
global.requestAnimationFrame = cb => cb()

const BASIC_MUTATION = {
  name: 'My Mutation',
  description: 'Test example.',
  args: [
    {
      name: 'MyString',
      defaultValue: 'MyDefault',
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

  it('should handle default values from the GraphQL schema', () => {
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

  it('should pick appropriate default types', () => {
    [
      [ // String => null
        {
          type: 'String',
          kind: 'SCALAR'
        },
        null
      ],
      [ // NON_NULL<String> => null
        {
          type: null,
          kind: 'NON_NULL',
          ofType: {
            type: 'String',
            kind: 'SCALAR'
          }
        },
        null
      ],
      [ // LIST<String> => []
        {
          type: null,
          kind: 'LIST',
          ofType: {
            type: 'String',
            kind: 'SCALAR'
          }
        },
        []
      ],
      [ // NON_NULL<LIST<String>> => []
        {
          type: null,
          kind: 'NON_NULL',
          ofType: {
            type: null,
            kind: 'LIST',
            ofType: {
              type: 'String',
              kind: 'SCALAR'
            }
          }
        },
        []
      ]
    ].forEach((item) => {
      expect(
        FormGenerator.methods.getNullValue(item[0])
      ).to.deep.equal(
        item[1]
      )
    })
  })
})
