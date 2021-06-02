/**
 * Copyright (C) NIWA & British Crown (Met Office) & Contributors.
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

/*
 * Functionality for introspecting mutations, associating them with Cylc
 * objects, filtering and calling mutations.
 *
 * (AOTF == Api On The Fly)
 */

import dedent from 'dedent'
import gql from 'graphql-tag'
import {
  getIntrospectionQuery as getGraphQLIntrospectionQuery,
  print
} from 'graphql'
import {
  mdiBullhorn,
  mdiCloseCircle,
  mdiCog,
  mdiCursorPointer,
  mdiDelete,
  mdiEmail,
  mdiGraph,
  mdiPause,
  mdiPauseCircleOutline,
  mdiPlay,
  mdiPlayCircleOutline,
  mdiRefreshCircle,
  mdiReload,
  mdiStop,
  mdiWifi
} from '@mdi/js'

import AlertModel from '@/model/Alert.model'
import TaskState from '@/model/TaskState.model'
import store from '@/store/index'

/**
 * Associates icons with mutations by name.
 * {mutation.name: svgIcon}
 */
export const mutationIcons = {
  '': mdiCog, // default fallback
  broadcast: mdiBullhorn,
  hold: mdiPauseCircleOutline, // to distinguish from pause
  kill: mdiCloseCircle,
  message: mdiEmail,
  pause: mdiPause,
  ping: mdiWifi,
  play: mdiPlay,
  poll: mdiRefreshCircle,
  release: mdiPlayCircleOutline, // to distinguish from play
  reload: mdiReload,
  remove: mdiDelete,
  resume: mdiPlay,
  setOutputs: mdiGraph,
  stop: mdiStop,
  trigger: mdiCursorPointer
}

/**
 * Enum of Cylc "objects".
 *
 * These are things that mutations can operate on like tasks and cycle points.
 */
export const cylcObjects = Object.freeze({
  User: 'user',
  Workflow: 'workflow',
  CyclePoint: 'cycle point',
  Namespace: 'namespace',
  // Task: 'task',
  Job: 'job'
})

/**
 * Most important mutations for each object type.
 */
export const primaryMutations = {}
primaryMutations[cylcObjects.Workflow] = [
  'play',
  'pause',
  'stop',
  'reload'
]
primaryMutations[cylcObjects.CyclePoint] = [
  'hold',
  'release',
  'trigger',
  'kill'
]
primaryMutations[cylcObjects.Namespace] = [
  'hold',
  'release',
  'trigger',
  'kill'
]

/**
 * Cylc "objects" in hierarchy order.
 *
 * Note, this is the order they would appear in a tree representation.
 */
const identifierOrder = [
  cylcObjects.User,
  cylcObjects.Workflow,
  cylcObjects.CyclePoint,
  cylcObjects.Namespace,
  // cylcObjects.Task,
  cylcObjects.Job
]

/**
 * Mapping of mutation argument types to Cylc "objects".
 *
 * This is used to work out what objects a mutation operates on.
 *
 * object: [[typeName: String, impliesMultiple: Boolean]]
 */
export const mutationMapping = {}
mutationMapping[cylcObjects.User] = []
mutationMapping[cylcObjects.Workflow] = [
  ['WorkflowID', false]
]
mutationMapping[cylcObjects.CyclePoint] = [
  ['CyclePoint', false],
  ['CyclePointGlob', true]
]
mutationMapping[cylcObjects.Namespace] = [
  ['NamespaceName', false],
  ['NamespaceIDGlob', true]
]
mutationMapping[cylcObjects.Task] = [
  ['TaskID', false]
]
mutationMapping[cylcObjects.Job] = [
  ['JobID', false]
]

/**
 * Mutation argument types which are derived from more than one token.
 */
export const compoundFields = {
  WorkflowID: (tokens) => {
    if (tokens[cylcObjects.User]) {
      return `${tokens[cylcObjects.User]}|${tokens[cylcObjects.Workflow]}`
    }
    // don't provide user if not specified
    // (will fallback to the UIs user)
    return tokens[cylcObjects.Workflow]
  },
  NamespaceIDGlob: (tokens) => {
    // expand unspecified fields to '*'
    return (tokens[cylcObjects.Namespace] || '*') +
      '.' +
      (tokens[cylcObjects.CyclePoint] || '*')
  },
  TaskID: (tokens) => {
    // expand unspecified fields to '*'
    return (tokens[cylcObjects.Task] || '*') +
      '.' +
      (tokens[cylcObjects.CyclePoint] || '*')
  }
}

/**
 * Namespaces which can be used to satisfy a field representing a different
 * object
 */
export const alternateFields = {}
// cycle points can be used as namespace identifiers
alternateFields.NamespaceIDGlob = cylcObjects.CyclePoint

/**
 * Used to communicate the status of requested mutations.
 *
 * Maps onto task status.
 */
export const mutationStatus = {}
mutationStatus[TaskState.WAITING] = TaskState.WAITING
mutationStatus[TaskState.SUBMITTED] = TaskState.SUBMITTED
mutationStatus[TaskState.SUCCEEDED] = TaskState.SUCCEEDED
mutationStatus[TaskState.FAILED] = TaskState.FAILED
mutationStatus[TaskState.SUBMIT_FAILED] = TaskState.SUBMIT_FAILED
Object.freeze(mutationStatus)

/**
 * Translate a global ID into a token dictionary.
 *
 * @param {string} id
 * @returns {Object}
 * */
export function tokenise (id) {
  if (!id) {
    return {}
  }
  id = id.split('|')
  const ret = {}
  for (let ind = 0; ind < id.length; ind++) {
    ret[identifierOrder[ind]] = id[ind]
  }
  return ret
}

/**
 * Return the lowest token in the hierarchy.
 *
 * @param {Object} tokens
 * @returns {String}
 * */
export function getType (tokens) {
  let last = null
  let item = null
  for (const key of identifierOrder) {
    item = tokens[key]
    if (!item) {
      break
    }
    last = key
  }
  return last
}

/**
 * Convert camel case to words.
 */
export function camelToWords (camel) {
  const result = (camel || '').replace(/([A-Z])/g, ' $1')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

/**
 * Process mutations from an introspection query.
 *
 * This adds some computed fields prefixed with an underscore for later use:
 *   _title:
 *     Human-readable name for the mutation.
 *   _icon:
 *     An SVG path to represent the mutation.
 *   _shortDescription
 *     The first line of the mutation description.
 *   _help
 *     The remainder of the mutation description.
 *
 * @param {object} mutations - Mutations as returned by introspection query.
 * @param {object} types - Types as returned by introspection query.
 */
export function processMutations (mutations, types) {
  let descLines = null
  for (const mutation of mutations) {
    descLines = mutation.description.split(/\n+/)
    mutation._title = camelToWords(mutation.name)
    mutation._icon = mutationIcons[mutation.name] || mutationIcons['']
    mutation._shortDescription = descLines[0]
    mutation._help = descLines.slice(1).join('\n')
    processArguments(mutation, types)
  }
}

/* Add special fields to mutations args from a GraphQL introspection query. */
/**
 * Process mutation arguments from an introspection query.
 *
 * This adds some computed fields prefixed with an underscore for later use:
 *   _title:
 *     Human-readable name for the mutation.
 *   _cylcObject:
 *     The Cylc Object this field relates to if any (e.g. Task).
 *   _cylcType:
 *     The underlying GraphQL type that provides this relationship
 *     (e.g. taskID).
 *     Note that this type may be buried inside other GraphQL types
 *     (e.g. NON_NULL, LIST).
 *   _multiple:
 *     true if this field accepts multiple values.
 *   _required:
 *     true if this field must be provided for the mutation to be called.
 *
 * @param {object} mutation - One Mutation as returned by introspection query.
 * @param {object} types - Types as returned by introspection query.
 */
export function processArguments (mutation, types) {
  let pointer = null
  let multiple = null
  let required = null
  let cylcObject = null
  let cylcType = null
  for (const arg of mutation.args) {
    pointer = arg.type
    multiple = false
    required = false
    cylcObject = null
    cylcType = null
    while (pointer) {
      // walk down the nested type tree
      if (pointer.kind === 'LIST') {
        multiple = true
      } else if (pointer.kind === 'NON_NULL') {
        required = true
      } else if (pointer.name) {
        for (const objectName in mutationMapping) {
          for (
            const [type, impliesMultiple] of mutationMapping[objectName]
          ) {
            if (pointer.name === type) {
              cylcObject = objectName
              cylcType = pointer.name
              if (impliesMultiple) {
                multiple = true
              }
              break
            }
          }
          if (cylcObject) {
            break
          }
        }
        if (cylcObject) {
          break
        }
      }
      pointer = pointer.ofType
    }
    arg._title = camelToWords(arg.name)
    arg._cylcObject = cylcObject
    arg._cylcType = cylcType
    arg._multiple = multiple
    arg._required = required
    if (arg.defaultValue) {
      arg._default = JSON.parse(arg.defaultValue)
    } else {
      arg._default = getNullValue(arg.type, types)
    }
  }
}

/**
 * Return a GraphQL introspection query for obtaining mutations and types.
 */
export function getIntrospectionQuery () {
  // we are only interested in mutations so can make our life
  // a little easier by restricting the scope of the default
  // introspection query
  const fullIntrospection = gql(getGraphQLIntrospectionQuery())
  const mutationQuery = gql(`
    query {
      __schema {
        mutationType {
          ...FullType
        }
        types {
          ...FullType
        }
      }
    }
  `)
  // TODO: this returns all types, we only need certain ones

  // NOTE: we are converting to string form then re-parsing
  // back to a query, as something funny happens when you
  // try to modify the gql objects by hand.
  return gql(
    // the query we actually want to run
    print(mutationQuery.definitions[0]) +
    // the fragments which power it
    print(fullIntrospection.definitions[1]) +
    print(fullIntrospection.definitions[2]) +
    print(fullIntrospection.definitions[3])
  )
}

/**
 * @typedef {Object} MutationArgs
 * @property {string} _cylcObject
 * @property {boolean} _required
 */

/**
 * @typedef {Object} Mutation
 * @property {Array<MutationArgs>} args
 */

/**
 * Filter for mutations that relate to the given Cylc object.
 *
 * Returns an array with two values:
 * - Matching mutations minus those which require additional information.
 * - All matching mutations.
 *
 * @param {string} cylcObject - The type of object to filter mutations by.
 * @param {Object} tokens - Tokens representing the context of this object.
 * @param {Array<Mutation>} mutations - Array of mutations.
 * @returns {Array<Array<bool|Mutation>>}
 */
export function filterAssociations (cylcObject, tokens, mutations) {
  const ret = []
  let requiresInfo = false
  let applies = false
  let alternate = null
  for (const mutation of mutations) {
    requiresInfo = false
    applies = false
    for (const arg of mutation.args) {
      if (arg._cylcObject) {
        // alternate cylc object which can satisfy this field, or null
        alternate = alternateFields[arg._cylcType]
        if (arg._cylcObject === cylcObject) {
          // this is the object type we are filtering for
          applies = true
        } else if (alternate === cylcObject) {
          // this isn't the object type we are filtering for, but it'll do
          applies = true
        }
        if (arg._required && !tokens[arg._cylcObject]) {
          // this cannot be satisfied by the context
          requiresInfo = true
        }
      } else if (arg._required) {
        // this is a required argument
        requiresInfo = true
      }
    }
    if (!applies) {
      continue
    }
    ret.push(
      [mutation, requiresInfo]
    )
  }
  return ret
}

/** Walk a GraphQL type yielding all composite types on route.
 *
 * E.G. NonNull<List<String>> would yield:
 *  1. NonNull
 *  2. List
 *  3. String
 *
 * @param type {Object} A type as returned by an introspection query.
 * (i.e. an object of the form {name: x, kind: y, ofType: z}
 *
 * @yields {Object} Type objects of the same form as the type argument.
 */
export function * iterateType (type) {
  while (type) {
    yield type
    type = type.ofType
  }
}

/** Return an appropriate null value for the specified type.
 *
 * @param type {Object} A type field as returned by an introspection query.
 * (an object of the form {name: x, kind: y, ofType: z}).
 * @param types {Array} An array of all types present in the schema.
 * (optional: used to resolve InputObjectType fields).
 *
 * @returns {Object|Array|undefined}
 */
export function getNullValue (type, types = []) {
  let ret = null
  let ofType = null
  for (const subType of iterateType(type)) {
    if (subType.kind === 'LIST') {
      ofType = getNullValue(subType.ofType)
      if (ofType) {
        // this list contains an object
        ret = [
          getNullValue(subType.ofType)
        ]
      } else {
        ret = []
      }
      break
    }
    if (subType.kind === 'INPUT_OBJECT') {
      ret = {}
      for (const type of types) {
        // TODO: this type iteration is already done in the mixin
        //       should we use the mixin or a subset there-of here?
        if (
          type.name === subType.name &&
          type.kind === subType.kind
        ) {
          for (const field of type.inputFields) {
            ret[field.name] = getNullValue(field.type)
          }
          break
        }
      }
      break
    }
  }
  return ret
}

/** Return the signature for an argument.
 *
 * E.G: NonNull<List<String>>  =>  [String]!
 *
 * @param arg {Object} An argument from a introspection query.
 *
 * @returns {string} A type string for use in a client query / mutation.
 */
export function argumentSignature (arg) {
  const stack = [...iterateType(arg.type)]
  stack.reverse()
  let ret = ''
  for (const type of stack) {
    if (
      type.name === null &&
      type.kind === 'LIST'
    ) {
      ret = `[${ret}]`
    } else if (
      type.name === null &&
      type.kind === 'NON_NULL'
    ) {
      ret = ret + '!'
    } else if (type.name) {
      ret = type.name
    } else {
      ret = type.kind
    }
  }
  return ret
}

/** Construct a mutation string from a mutation introspection.
 *
 * @param mutation {Object} A mutation as returned by an introspection query.
 *
 * @returns {string} A mutation string for a client to send to the server.
 */
export function constructMutation (mutation) {
  const argNames = []
  const argTypes = []
  for (const arg of mutation.args) {
    argNames.push(`${arg.name}: $${arg.name}`)
    argTypes.push(`$${arg.name}: ${argumentSignature(arg)}`)
  }

  return dedent`
    mutation ${mutation.name}(${argTypes.join(', ')}) {
      ${mutation.name}(${argNames.join(', ')}) {
        result
      }
    }
  `.trim()
}

/**
 * Return any arguments for the mutation which can be determined from tokens.
 *
 * Return default arguments for the provided mutation filling in what
 * information we can from the context tokens.
 *
 * @param {Object} mutation
 * @param {Object} tokens
 *
 * @returns {Object}
 * */
export function getMutationArgsFromTokens (mutation, tokens) {
  const argspec = {}
  let value = null
  let alternate = null
  for (const arg of mutation.args) {
    alternate = alternateFields[arg._cylcType]
    for (let token in tokens) {
      if (arg._cylcObject && [token, alternate].indexOf(arg._cylcObject) >= 0) {
        if (arg._cylcObject === alternate) {
          token = alternate
        }
        if (arg._cylcType in compoundFields) {
          value = compoundFields[arg._cylcType](tokens)
        } else {
          value = tokens[token]
        }
        if (arg._multiple) {
          value = [value]
        }
        argspec[arg.name] = value
        break
      }
    }
    if (!argspec[arg.name]) {
      argspec[arg.name] = arg._default
    }
  }
  return argspec
}

/**
 * Handle an error in a called mutation.
 *
 * @param {string} mutationName
 * @param {string} message - error message to display
 * @param {*} response - raw GraphQL response or null
 *
 * @returns {Array} [status, message]
 */
function _mutateError (mutationName, message, response) {
  // log the response
  if (response) {
    // eslint-disable-next-line no-console
    console.error('mutation response', response)
  }

  // open a user alert
  store.dispatch('setAlert', new AlertModel(
    `command failed: ${mutationName} - ${message}`,
    null,
    'error')
  )

  // format a response
  return [TaskState.SUBMIT_FAILED, message]
}

/**
 * Call a mutation.
 *
 * @param {Object} mutation
 * @param {Object} args
 * @param {ApolloClient} apolloClient
 *
 * @returns {Array} [status, result]
 */
export async function mutate (mutation, args, apolloClient) {
  let response = null
  // eslint-disable-next-line no-console
  console.debug([
    `mutation(${mutation.name})`,
    constructMutation(mutation),
    args
  ])

  try {
    // call the mutation
    response = await apolloClient.mutate({
      mutation: gql(constructMutation(mutation)),
      variables: args
    })
  } catch (err) {
    // mutation failed (client-server error e.g. variable format, syntax error)
    return _mutateError(mutation.name, err, null)
  }

  if (response.errors) {
    // mutation returned errors (server error)
    return _mutateError(mutation.name, response.errors[0].message, response)
  }

  try {
    const result = response.data[mutation.name].result
    if (Array.isArray(result) && result.length === 2) {
      // regular [commandSucceeded, message] format
      if (result[0] === true) {
        // success
        return [TaskState.SUBMITTED, result[1]]
      }
      // failure (Cylc error, e.g. could not find workflow <x>)
      return _mutateError(mutation.name, result[1], response)
    }
    // command in a different format (e.g. info command)
    return [TaskState.SUBMITTED, result]
  } catch (error) {
    return _mutateError(mutation.name, 'invalid response', response)
  }
}
