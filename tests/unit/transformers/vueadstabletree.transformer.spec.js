import { expect } from 'chai'
import VueAdsTableTreeTransformer from '@/transformers/vueadstabletree.transformer'

const FAMILY_PROXIES_1 = [
  {
    "name": "root",
    "cyclePoint": "20130808T0000Z",
    "state": "held",
    "depth": 0,
    "childTasks": [
      {
        "id": "kinow/five/20130808T0000Z/prep",
        "task": {
          "name": "prep"
        },
        "state": "held",
        "latestMessage": "",
        "depth": 1,
        "jobs": []
      },
      {
        "id": "kinow/five/20130808T0000Z/foo",
        "task": {
          "name": "foo"
        },
        "state": "held",
        "latestMessage": "",
        "depth": 1,
        "jobs": []
      },
      {
        "id": "kinow/five/20130808T0000Z/bar",
        "task": {
          "name": "bar"
        },
        "state": "held",
        "latestMessage": "",
        "depth": 1,
        "jobs": []
      }
    ],
    "childFamilies": []
  }
]

const TRANSFORMED_VALUE_1 = [
  {
    "_children": [
      {
        "depth": 1,
        "id": "kinow/five/20130808T0000Z/prep",
        "jobs": [],
        "latestMessage": "",
        "name": "prep",
        "state": "held"
      },
      {
        "depth": 1,
        "id": "kinow/five/20130808T0000Z/foo",
        "jobs": [],
        "latestMessage": "",
        "name": "foo",
        "state": "held"
      },
      {
        "depth": 1,
        "id": "kinow/five/20130808T0000Z/bar",
        "jobs": [],
        "latestMessage": "",
        "name": "bar",
        "state": "held",
      }
    ],
    "_showChildren": true,
    "childFamilies": [],
    "childTasks": [
      {
        "depth": 1,
        "id": "kinow/five/20130808T0000Z/prep",
        "jobs": [],
        "latestMessage": "",
        "name": "prep",
        "state": "held"
      },
      {
        "depth": 1,
        "id": "kinow/five/20130808T0000Z/foo",
        "jobs": [],
        "latestMessage": "",
        "name": "foo",
        "state": "held",
      },
      {
        "depth": 1,
        "id": "kinow/five/20130808T0000Z/bar",
        "jobs": [],
        "latestMessage": "",
        "name": "bar",
        "state": "held"
      },
    ],
    "cyclePoint": "20130808T0000Z",
    "depth": 0,
    "name": "20130808T0000Z",
    "state": "held"
  }
]


describe('VueAdsTableTreeTransformer', () => {
  const vueAdsTableTreeTransformer = new VueAdsTableTreeTransformer()
  describe('VueAdsTableTreeTransformer should correctly transform a graphql response object to the VueAdsTableTree component format', () => {
    it('should return an empty list for a an empty family', () => {
      expect(vueAdsTableTreeTransformer.transform([])).to.eql([])
    })
    it('should return list of tasks for a suite', () => {
      const transformedValues = vueAdsTableTreeTransformer.transform(FAMILY_PROXIES_1)
      expect(transformedValues).to.eql(TRANSFORMED_VALUE_1)
    })
  })
})
