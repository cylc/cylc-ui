/*
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

const JOB_ID = /^(\d+|NN)$/

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

export class Tokens {
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
   *   tokens.workflowID  // the workflow part of the ID (the bit before the //)
   *   tokens.relativeID  // the task part of the ID (the bit after the //)
   */

  static KEYS = ['user', 'workflow', 'cycle', 'task', 'job']

  constructor (id, relative = false) {
    let match
    let user
    let workflow
    let cycle
    let task
    let job

    if (id === null) {
      throw new Error(`Invalid ID ${id}`)
    }

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
    this.workflowID = undefined
    this.relativeID = undefined

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

    if (this.job && !JOB_ID.test(this.job)) {
      throw new Error(`Invalid job ID: ${this.job}`)
    }

    this.workflowID = detokenise(this, true, false)
    this.relativeID = detokenise(this, false, true)
  }

  set (fields) {
    if (fields instanceof Tokens) {
      for (const key of Tokens.KEYS) {
        if (fields[key]) this[key] = fields[key]
      }
    } else {
      for (const [key, value] of Object.entries(fields)) {
        if (!Tokens.KEYS.includes(key)) {
          throw new Error(`Invalid key: ${key}`)
        }
        if (typeof value !== 'string' && value != null) {
          throw new Error(`Invalid type for value: ${value}`)
        }
        this[key] = value ?? undefined
      }
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

  tree () {
    const ret = []
    if (this.user) {
      let tokens = new Tokens(`~${this.user}`)
      ret.push(['user', this.user, tokens])
      if (this.workflow) {
        const parts = this.workflow.split('/')
        const last = parts.pop()
        for (const part of parts) {
          if (!tokens.workflow) {
            tokens = tokens.clone({ workflow: part })
          } else {
            tokens = tokens.clone({ workflow: `${tokens.workflow}/${part}` })
          }
          ret.push(['workflow-part', part, tokens])
        }
        if (tokens.workflow) {
          tokens = tokens.clone({ workflow: `${tokens.workflow}/${last}` })
        } else {
          tokens = tokens.clone({ workflow: last })
        }
        ret.push(['workflow', last, tokens])
        if (this.cycle && this.cycle[0] !== '$') {
          tokens = tokens.clone({ cycle: this.cycle })
          ret.push(['cycle', this.cycle, tokens])
          if (this.task) {
            tokens = tokens.clone({ task: this.task })
            ret.push(['task', this.task, tokens])
            if (this.job) {
              tokens = tokens.clone({ job: this.job })
              ret.push(['job', this.job, tokens])
            }
          }
        }
      }
    }
    return ret
  }

  /**
   * Validate an ID string without throwing an error.
   *
   * @param {string} id
   * @returns {string=} Error message if invalid, otherwise nothing.
   */
  static validate (id, relative = false) {
    try {
      // eslint-disable-next-line no-new
      new Tokens(id, relative)
    } catch (e) {
      return e.message
    }
  }
}
