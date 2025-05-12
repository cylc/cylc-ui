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

import { Tokens } from '@/utils/uid'

describe('Universal ID (UID)', () => {
  describe('Tokens', () => {
    it('should tokenise string IDs', () => {
      // full ID
      expect(
        Object.assign({}, new Tokens('~user/workflow//cycle/task/01'))
      ).to.deep.equal({
        user: 'user',
        workflow: 'workflow',
        cycle: 'cycle',
        task: 'task',
        job: '01',
        id: '~user/workflow//cycle/task/01',
        workflowID: '~user/workflow',
        relativeID: 'cycle/task/01',
        namespace: undefined,
        edge: undefined
      })

      // workflow ID fragment
      expect(
        Object.assign({}, new Tokens('~user'))
      ).to.deep.equal({
        user: 'user',
        workflow: undefined,
        cycle: undefined,
        task: undefined,
        job: undefined,
        id: '~user',
        workflowID: '~user',
        relativeID: '',
        namespace: undefined,
        edge: undefined
      })

      // relative ID fragment
      expect(
        Object.assign({}, new Tokens('cycle', true))
      ).to.deep.equal({
        user: undefined,
        workflow: undefined,
        cycle: 'cycle',
        task: undefined,
        job: undefined,
        id: 'cycle',
        workflowID: '',
        relativeID: 'cycle',
        namespace: undefined,
        edge: undefined
      })
    })

    it('should tokenise data store IDs', () => {
      // namespaces (i.e. task/family definitions)
      expect(
        Object.assign({}, new Tokens('$namespace|foo', true))
      ).to.deep.equal({
        user: undefined,
        workflow: undefined,
        cycle: undefined,
        task: undefined,
        job: undefined,
        id: '$namespace|foo',
        workflowID: '',
        relativeID: '',
        namespace: 'foo',
        edge: undefined
      })

      // edges
      expect(
        Object.assign({}, new Tokens('$edge|1/a|1/b', true))
      ).to.deep.equal({
        user: undefined,
        workflow: undefined,
        cycle: undefined,
        task: undefined,
        job: undefined,
        id: '$edge|1/a|1/b',
        workflowID: '',
        relativeID: '',
        namespace: undefined,
        edge: [new Tokens('1/a', true), new Tokens('1/b', true)]
      })
    })

    it('should set its properties', () => {
      const a = new Tokens('~u/w//c/t/01')
      expect(a.user).to.equal('u')
      expect(a.workflow).to.equal('w')
      expect(a.cycle).to.equal('c')
      expect(a.task).to.equal('t')
      expect(a.job).to.equal('01')
    })

    it('should be mutable via the set method', () => {
      const a = new Tokens('w//c')
      const b = a.clone()
      b.set({ workflow: 'x', task: 't' })

      // "a" should be unchanged
      expect(
        Object.assign({}, a)
      ).to.deep.equal({
        user: undefined,
        workflow: 'w',
        cycle: 'c',
        task: undefined,
        job: undefined,
        id: 'w//c',
        workflowID: 'w',
        relativeID: 'c',
        namespace: undefined,
        edge: undefined
      })

      // "b" should be updated
      expect(
        Object.assign({}, b)
      ).to.deep.equal({
        user: undefined,
        workflow: 'x',
        cycle: 'c',
        task: 't',
        job: undefined,
        id: 'x//c/t',
        workflowID: 'x',
        relativeID: 'c/t',
        namespace: undefined,
        edge: undefined
      })

      // should be able to wipe tokens using "undefined"
      b.set({ task: undefined })
      expect(b.task).to.equal(undefined)
    })

    describe('Cloning', () => {
      it('clones and sets in the same operation', () => {
        expect(
          new Tokens('w//c').clone({ cycle: 'd', task: 't' })
        ).toMatchObject({
          user: undefined,
          workflow: 'w',
          cycle: 'd',
          task: 't',
          job: undefined,
          id: 'w//d/t',
          workflowID: 'w',
          relativeID: 'd/t',
          namespace: undefined,
          edge: undefined
        })
      })

      it.each([
        ['~U/W', 'c/t', '~U/W//c/t'],
        ['~U/W//C/T/01', 'w//c', '~U/w//c/T/01'],
        ['~U/W//C/T/01', '~u/w//c/t/02', '~u/w//c/t/02'],
        ['~U/W//C/T/01', 'c/t', '~U/W//c/t/01'],
      ])('%s clones %s -> %s', (left, right, expected) => {
        expect(
          new Tokens(left).clone(new Tokens(right, !right.includes('//')))
        ).toEqual(
          new Tokens(expected)
        )
      })

      it('unsets nullish values if object being cloned is not a Tokens instance', () => {
        expect(
          new Tokens('~u/w//c/t').clone({ cycle: null, task: undefined })
        ).toEqual(
          new Tokens('~u/w')
        )
      })

      it('throws if trying to clone with invalid keys', () => {
        expect(() => {
          new Tokens('~u/w//c/t').clone({ horse: 'value' })
        }).toThrow('Invalid key: horse')
      })

      it('throws if trying to clone with invalid types', () => {
        expect(() => {
          new Tokens('~u/w//c').clone({ cycle: true })
        }).toThrow('Invalid type for value: true')
      })
    })

    it('should iterate hierarchical workflows', () => {
      const tokens = new Tokens('~u/a/b/c/d')
      expect(tokens.workflowHierarchy()).to.deep.equal([
        ['a', new Tokens('~u/a')],
        ['b', new Tokens('~u/a/b')],
        ['c', new Tokens('~u/a/b/c')],
        ['d', new Tokens('~u/a/b/c/d')]
      ])
    })

    it('should return the lowest token', () => {
      // absolute
      expect(
        new Tokens('~u/w//c/t/01').lowestToken()
      ).to.equal('job')
      expect(
        new Tokens('~u/w//c/t').lowestToken()
      ).to.equal('task')
      expect(
        new Tokens('~u/w//c').lowestToken()
      ).to.equal('cycle')
      expect(
        new Tokens('~u/w').lowestToken()
      ).to.equal('workflow')
      expect(
        new Tokens('~u').lowestToken()
      ).to.equal('user')
      // relative
      expect(
        new Tokens('c/t/01', true).lowestToken()
      ).to.equal('job')
      expect(
        new Tokens('c/t', true).lowestToken()
      ).to.equal('task')
      expect(
        new Tokens('c', true).lowestToken()
      ).to.equal('cycle')
    })

    it('should yield the tree to this token', () => {
      expect(
        new Tokens('~u/w1/w2/w3//c/t/01').tree()
      ).to.deep.equal([
        [
          'user',
          'u',
          new Tokens('~u')
        ],
        [
          'workflow-part',
          'w1',
          new Tokens('~u/w1')
        ],
        [
          'workflow-part',
          'w2',
          new Tokens('~u/w1/w2')
        ],
        [
          'workflow',
          'w3',
          new Tokens('~u/w1/w2/w3')
        ],
        [
          'cycle',
          'c',
          new Tokens('~u/w1/w2/w3//c')
        ],
        [
          'task',
          't',
          new Tokens('~u/w1/w2/w3//c/t')
        ],
        [
          'job',
          '01',
          new Tokens('~u/w1/w2/w3//c/t/01')
        ]
      ])

      expect(
        new Tokens('~u/w//c').tree()
      ).to.deep.equal([
        [
          'user',
          'u',
          new Tokens('~u')
        ],
        [
          'workflow',
          'w',
          new Tokens('~u/w')
        ],
        [
          'cycle',
          'c',
          new Tokens('~u/w//c')
        ]
      ])

      expect(
        new Tokens('~u').tree()
      ).to.deep.equal([
        [
          'user',
          'u',
          new Tokens('~u')
        ]
      ])
    })

    describe('Invalid job IDs', () => {
      describe.each([true, false])('relative: %o', (relative) => {
        it.each([
          ['c/t/01', true],
          ['c/t/1', true],
          ['c/t/1000', true],
          ['c/t/', true],
          ['c/t', true],
          ['c/t/NN', true],
          ['c/t/nn', false],
          ['c/t/j', false],
          ['c/t/1f', false],
          ['c/t/*', false], // job glob not allowed currently, but could be needed in future
        ])('%s ok? %o', (id, ok) => {
          if (!relative) id = `~u/w//${id}`
          if (ok) {
            // eslint-disable-next-line no-new
            new Tokens(id, relative)
          } else {
            expect(() => new Tokens(id, relative)).toThrow('Invalid job ID')
          }
        })
      })
    })
  })

  it.each([
    ['w//c/t/01', undefined],
    ['w//c/t/j', 'Invalid job ID: j'],
  ])('Tokens.validate(%o) -> %o', (id, expected) => {
    expect(Tokens.validate(id)).toEqual(expected) // doesn't throw
  })
})
