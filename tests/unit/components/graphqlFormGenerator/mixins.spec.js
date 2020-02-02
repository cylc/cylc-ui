import { formModel } from '@/components/graphqlFormGenerator/mixins'
import { expect } from 'chai'

describe('FormModel Mixin', () => {
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
        [null]
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
        [null]
      ]
    ].forEach((item) => {
      expect(
        formModel.methods.getNullValue(item[0])
      ).to.deep.equal(
        item[1]
      )
    })
  })
})
