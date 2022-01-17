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

/* Universal ID (UID)
 *
 * This is a cut down version of `cylc.flow.id` for UI use.
 *
 * The regexes come from cylc-flow, the script etc/uid.py updates them
 * in the event they are changed in cylc-flow.
 */

/* eslint-disable */

const UNIVERSAL_ID = new RegExp(`
    (?=.)
        (?:
          (?:
            ~
            ([^\/:\n~]+)
            (\/|$)
          )
          |^
        )
        (?:
          (
            (?!//)
            [^:~\n\/]+
            (?:
              (?:
                \/
                [^:~\n\/]+
              )+
            )?

          )
          (?:
            :
            ([^\/:\n]+)
          )?
          (?:
            (?:
                //(?!/)
            )?
            (?:

    //
    ([^~\/:\n]+)
    (?:
      :
      ([^\/:\n]+)
    )?
    (?:
      /
      (?:
        ([^\/:\n]+)
        (?:
          :
          ([^\/:\n]+)
        )?
        (?:
          /
          (?:
            ([^\/:\n]+)
            (?:
              :
              ([^\/:\n]+)
            )?
          )?
        )?
      )?
    )?

            )?
          )?
        )?
        $
`.replace(/[\s\n\r]/g, ''))

const RELATIVE_ID = new RegExp(`
    ^
        //
        ([^~\/:\n]+)
        (?:
          :
          ([^\/:\n]+)
        )?
        (?:
          /
          (?:
            ([^\/:\n]+)
            (?:
              :
              ([^\/:\n]+)
            )?
            (?:
              /
              (?:
                ([^\/:\n]+)
                (?:
                  :
                  ([^\/:\n]+)
                )?
              )?
            )?
          )?
        )?
    $
`.replace(/[\s\n\r]/g, ''))

/* eslint-enable */

function detokenise (tokens, workflow = true, relative = true) {
  let parts = []
  let ret = ''

  if (workflow) {
    if (tokens.user) {
      parts.push(`~${tokens.user}`)
    }
    if (tokens.workflow) {
      parts.push(tokens.workflow)
    }
    if (parts) {
      ret = parts.join('/')
      parts = []
    }
  }

  if (relative) {
    if (tokens.cycle) {
      parts.push(tokens.cycle)
      if (tokens.task) {
        parts.push(tokens.task)
        if (tokens.job) {
          parts.push(tokens.job)
        }
      }
      if (ret) {
        ret += '//'
      }
      ret += parts.join('/')
    }
  }

  return ret
}

class Tokens {
  /* Represents a Cylc UID.
   *
   * Provides the interfaces for parsing to and from string IDs.
   *
   * Create with a string ID:
   *   new Tokens('workflow//cycle/task')
   *
   * Inspect the tokens:
   *   // primary components
   *   tokens.user
   *   tokens.workflow
   *   tokens.cycle
   *   tokens.task
   *   tokens.job
   *   // Non UID objects which exist only in the data store:
   *   tokens.namespace
   *   tokens.edge
   *
   * Obtain string ID from a tokens object
   *   tokens.id           // the full ID
   *   tokens.workflow_id  // the workflow part of the ID (the bit before the //)
   *   tokens.relative_id  // the task part of the ID (the bit after the //)
   */

  static KEYS = ['user', 'workflow', 'cycle', 'task', 'job']

  constructor (id, relative = false) {
    let match
    let user
    let workflow
    let cycle
    let task
    let job

    // try to match relative ID (the leading // is implicit)
    if (relative) {
      match = `//${id}`.match(RELATIVE_ID)
      if (match) {
        user = undefined
        workflow = undefined
        cycle = match[1]
        task = match[3]
        job = match[5]
      }
    }

    // try to match full id (or // prefixed relative id)
    if (!match) {
      match = id.match(UNIVERSAL_ID)
      if (match) {
        user = match[1]
        workflow = match[3]
        cycle = match[5]
        task = match[7]
        job = match[9]
      }
    }

    if (!match) {
      throw new Error(`Invalid ID ${id}`)
    }

    // UID tokens
    this.user = user
    this.workflow = workflow
    this.cycle = cycle
    this.task = task
    this.job = job

    // derived properties
    this.namespace = undefined
    this.edge = undefined
    this.id = undefined
    this.workflow_id = undefined
    this.relative_id = undefined

    // update derived properties
    this.compute()
  }

  compute () {
    this.id = detokenise(this)

    if (this.cycle && this.cycle.startsWith('$namespace|')) {
      // this is a namespace definition
      this.namespace = this.cycle.replace('$namespace|', '')
      this.cycle = undefined
      this.task = undefined
      this.job = undefined
    } else if (this.cycle && this.cycle.startsWith('$edge|')) {
      // this is an edge definition
      const [left, right] = this.id.replace(/.*\$edge\|/, '').split('|')
      this.edge = [new Tokens(left, true), new Tokens(right, true)]
      this.cycle = undefined
      this.task = undefined
      this.job = undefined
    }

    this.workflow_id = detokenise(this, true, false)
    this.relative_id = detokenise(this, false, true)
  }

  set (fields) {
    for (const [key, value] of Object.entries(fields)) {
      if (Tokens.KEYS.indexOf(key) === -1) {
        throw new Error(`Invalid key: ${key}`)
      }
      if (typeof value !== 'string' && typeof value !== 'undefined') {
        throw new Error(`Invalid type for value: ${value}`)
      }
      this[key] = value
    }
    this.compute()
  }

  clone (fields = null) {
    const ret = Object.create(
      Object.getPrototypeOf(this),
      Object.getOwnPropertyDescriptors(this)
    )
    if (fields) {
      ret.set(fields)
    }
    return ret
  }

  workflowHierarchy () {
    const hier = []
    const tokensList = []
    let tokens
    for (const part of this.workflow.split('/')) {
      // for each level of the hierarchy
      hier.push(part)
      // copy these tokens
      tokens = this.clone()
      // amending the workflow ID to match its level in the hierarchy
      tokens.set({
        workflow: hier.join('/'),
        // wipe the relative tokens in-case they were set
        cycle: undefined,
        task: undefined,
        job: undefined
      })
      tokensList.push([part, tokens])
    }
    return tokensList
  }

  lowestToken () {
    let key
    for (let ind = Tokens.KEYS.length; ind >= 0; ind--) {
      key = Tokens.KEYS[ind]
      if (this[key]) {
        return key
      }
    }
  }
}

export { Tokens }
