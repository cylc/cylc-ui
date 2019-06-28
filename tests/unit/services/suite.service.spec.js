import { expect } from 'chai'
import { SuiteService } from '@/services/suite.service'
import store from '@/store'
import Suite from "@/model/Suite.model"

describe('SuiteService', () => {
  const suiteService = new SuiteService()
  beforeEach(() => {
    store.dispatch("suites/setSuites", [])
    store.dispatch('clearAlerts')
  })
  describe('getSuites returns the list of suites', () => {
    it('should return list of suites', () => {
      // we have fake data until the graphql backend is ready
      const suitesReturned = new Promise((r) => r({ data:
          {
            workflows:
              [
                {
                  id: "rob/localhost",
                  name: "suite 1",
                  owner: "rob",
                  host: "localhost",
                  port: 1234
                },
                {
                  id: "job/remotehost",
                  name: "suite 2",
                  owner: "john",
                  host: "remotehost",
                  port: 4321
                }
              ]
          }
      }))
      const stubClient = {
        uri: null,
        query: function() {
          return suitesReturned
          //return Promise.resolve(suitesReturned)
        }
      }
      suiteService.apolloClient = stubClient
      return suiteService.getSuites().then(function() {
        const suites = store.getters['suites/suites']
        expect(suites.length).to.equal(2)
        expect(suites[0].name).to.equal("suite 1")
      })
    })
    it('should add an alert on error', () => {
      expect(store.state.alerts.length).to.equal(0)
      const e = new Error('mock error')
      suiteService.apolloClient = {
        uri: null,
        query: function() {
          return Promise.reject(e)
        }
      }
      return suiteService.getSuites().finally(() => {
        expect(store.state.alerts.length).to.equal(1)
      })
    })
  })
  describe('getSuiteTasks returns the list of tasks of a suite', () => {
    it('should return list of tasks for a suite', () => {
      // we have fake data until the graphql backend is ready
      const tasksReturned = new Promise((r) => r({ data: {
          tasks: [
            {
              id: "id1",
              name: "speaker 1"
            },
            {
              id: "id2",
              name: "speaker 2"
            }
          ]
        }
      }))
      suiteService.apolloClient = {
        uri: null,
        query: function() {
          return tasksReturned
        }
      }

      return suiteService.getSuiteTasks(new Suite("suitename", "root", "localhost", 8080)).then(function() {
        const tasks = store.getters['suites/tasks']
        expect(tasks.length).to.equal(2)
        expect(tasks[0].name).to.equal("speaker 1")
      })
    })
    it('should add an alert on error', () => {
      expect(store.state.alerts.length).to.equal(0)
      const e = new Error('mock error')
      suiteService.apolloClient = {
        uri: null,
        query: function() {
          return Promise.reject(e)
        }
      }
      return suiteService.getSuiteTasks(new Suite("suitename", "root", "localhost", 8080)).finally(() => {
        expect(store.state.alerts.length).to.equal(1)
      })
    })
  })
  describe('fetchSuiteTree returns the suite tree view data structure', () => {
    it('should return suite tree view data', () => {
      const familyProxiesReturned = new Promise((r) => r({ data: {
          familyProxies: [
            {
              id: "id1",
              name: "speaker 1"
            },
            {
              id: "id2",
              name: "speaker 2"
            }
          ]
        }
      }))
      suiteService.apolloClient = {
        uri: null,
        query: function() {
          return familyProxiesReturned
        }
      }
      return suiteService.fetchSuiteTree(3).then(function() {
        const tree = store.getters['suites/tree']
        expect(tree.length).to.equal(2)
        expect(tree[0].name).to.equal("speaker 1")
      })
    })
    it('should add an alert on error', () => {
      expect(store.state.alerts.length).to.equal(0)
      const e = new Error('mock error')
      suiteService.apolloClient = {
        uri: null,
        query: function() {
          return Promise.reject(e)
        }
      }
      return suiteService.fetchSuiteTree(3).finally(() => {
        expect(store.state.alerts.length).to.equal(1)
      })
    })
  })
})
