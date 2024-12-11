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
  mdiFileDocumentOutline,
  mdiInformationOutline,
  mdiMinusCircleOutline,
  mdiPause,
  mdiPauseCircleOutline,
  mdiPlay,
  mdiPlayCircleOutline,
  mdiPlaylistEdit,
  mdiRefreshCircle,
  mdiReload,
  mdiStop,
  mdiVectorPolylineEdit,
} from '@mdi/js'

import { Alert } from '@/model/Alert.model'
import { store } from '@/store/index'
import { Tokens } from '@/utils/uid'
import { WorkflowState, WorkflowStateNames } from '@/model/WorkflowState.model'

/** @typedef {import('@apollo/client').ApolloClient} ApolloClient */
/** @typedef {import('graphql').IntrospectionInputType} IntrospectionInputType  */

/**
 * @typedef {Object} GQLType
 * @property {string} name
 * @property {string} kind
 * @property {?GQLType} ofType
 */

/**
 * @typedef {Object} MutationArg
 * @property {string} name
 * @property {string} description
 * @property {GQLType} type
 * @property {?string} defaultValue
 * @property {string=} _title
 * @property {string=} _cylcObject
 * @property {string=} _cylcType
 * @property {boolean=} _required
 * @property {boolean=} _multiple
 * @property {*=} _default
 */

/**
 * @typedef {Object} Mutation
 * @property {string} name
 * @property {string} description
 * @property {MutationArg[]} args
 * @property {GQLType} type
 * @property {string=} _title
 * @property {string=} _icon
 * @property {string=} _shortDescription
 * @property {string=} _help
 * @property {string=} _appliesTo - type of cylc object this mutation applies to (if cannot determine from args)
 * @property {boolean=} _requiresInfo - whether this mutation needs more info than the cylc object it is operating on (if cannot determine from args)
 * @property {string[]=} _validStates - list of workflow states this mutation is valid for
 */

/**
 * @typedef {Object} Query
 * @property {string} name
 * @property {MutationArg[]} args
 * @property {Array} fields
 */

/**
 * @typedef {Object} Field
 * @property {string} name - lowercase field name
 * @property {(Field[])=} fields - list of sub-fields
 */

/**
 * @typedef {Object} MutationResponse
 * @property {string} status
 * @property {string} message
 */

/**
 * @typedef {Object} FilteredMutation
 * @property {Mutation} mutation
 * @property {boolean} requiresInfo
 * @property {boolean} authorised
 */

/**
 * Associates icons with mutations by name.
 * @param {string} name - mutation name
 * @returns {string} - icon svg path
 */
export function getMutationIcon (name) {
  switch (name) {
    case 'broadcast': return mdiBullhorn
    case 'clean': return mdiDelete
    case 'editRuntime': return mdiPlaylistEdit
    case 'hold': return mdiPauseCircleOutline // to distinguish from pause
    case 'info': return mdiInformationOutline
    case 'kill': return mdiCloseCircle
    case 'log': return mdiFileDocumentOutline
    case 'message': return mdiEmail
    case 'pause': return mdiPause
    case 'play': return mdiPlay
    case 'poll': return mdiRefreshCircle
    case 'release': return mdiPlayCircleOutline // to distinguish from play
    case 'reload': return mdiReload
    case 'remove': return mdiMinusCircleOutline
    case 'resume': return mdiPlay
    case 'set': return mdiVectorPolylineEdit
    case 'stop': return mdiStop
    case 'trigger': return mdiCursorPointer
    default: return mdiCog
  }
}

/**
 * Enum of Cylc "objects".
 *
 * These are things that mutations can operate on like tasks and cycle points.
 */
export const cylcObjects = Object.freeze({
  // <Object>:<Token>
  // TODO: unify this into the UID code better
  // Where Object is used by aotf to associate things with mutations.
  // And Token is the UID token (@/utils/uid).
  User: 'user',
  Workflow: 'workflow',
  CyclePoint: 'cycle',
  Namespace: 'task',
  // Task: 'task',
  Job: 'job'
})

/**
 * Most important mutations for each object type.
 */
export const primaryMutations = {
  [cylcObjects.Workflow]: [
    'play',
    'resume',
    'pause',
    'stop',
    'reload',
    'clean',
    'log'
  ],
  [cylcObjects.CyclePoint]: [
    'hold',
    'release',
    'trigger',
    'kill'
  ],
  [cylcObjects.Namespace]: [
    'hold',
    'release',
    'trigger',
    'kill',
    'log',
    'info',
    'set'
  ]
}

// handle families the same as tasks
primaryMutations.family = primaryMutations[cylcObjects.Namespace]

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
 * Mapping of mutation argument types to Cylc "objects" (workflow, cycle,
 * task etc.).
 *
 * This is used to work out what objects a mutation operates on and
 * auto-populate the input element in the mutation form based on the object
 * that was clicked on.
 *
 * object: [[typeName: String, impliesMultiple: Boolean]]
 */
export const mutationMapping = {
  [cylcObjects.User]: [],
  [cylcObjects.Workflow]: [
    ['WorkflowID', false]
  ],
  [cylcObjects.CyclePoint]: [
    ['CyclePoint', false],
    ['CyclePointGlob', true]
  ],
  [cylcObjects.Namespace]: [
    ['NamespaceName', false],
    ['NamespaceIDGlob', true]
  ],
  // [cylcObjects.Task]: [
  //   ['TaskID', false]
  // ],
  [cylcObjects.Job]: [
    ['JobID', false]
  ]
}

/**
 * Mutation argument types which are derived from more than one token.
 */
export const compoundFields = {
  WorkflowID: (tokens) => {
    if (tokens[cylcObjects.User]) {
      return `~${tokens[cylcObjects.User]}/${tokens[cylcObjects.Workflow]}`
    }
    // don't provide user if not specified
    // (will fallback to the UIs user)
    return tokens[cylcObjects.Workflow]
  },
  NamespaceIDGlob: (tokens) => (
    // expand unspecified fields to '*'
    (tokens[cylcObjects.CyclePoint] || '*') +
    '/' +
    (tokens[cylcObjects.Namespace] || '*')
  ),
  TaskID: (tokens) => (
    // expand unspecified fields to '*'
    (tokens[cylcObjects.CyclePoint] || '*') +
    '/' +
    tokens[cylcObjects.Namespace]
  )
}

/**
 * Namespaces which can be used to satisfy a field representing a different
 * object.
 *
 * This is used to work out what objects a mutation operates on.
 */
export const alternateFields = {
  // cycle points can be used as namespace identifiers
  NamespaceIDGlob: cylcObjects.CyclePoint
}

/**
 * Used to communicate the status of requested mutations.
 *
 * Maps onto task status.
 */
export const mutationStatus = Object.freeze({
  FAILED: 'FAILED',
  SUCCEEDED: 'SUCCEEDED',
  WARN: 'WARN'
})

/**
 * List of commands to add to the mutations from the schema.
 *
 * @type {Mutation[]}
 */
export const dummyMutations = [
  {
    name: 'editRuntime',
    description: dedent`
      Edit a task or family's \`[runtime]\` section.

      This only applies for the cycle point of the chosen task/family instance.`,
    args: [],
    _appliesTo: [cylcObjects.Namespace, cylcObjects.CyclePoint],
    _requiresInfo: true,
    _validStates: [WorkflowState.RUNNING.name, WorkflowState.PAUSED.name],
    _dialogWidth: '1200px',
  },
  {
    name: 'log',
    description: 'View the logs.',
    args: [],
    _appliesTo: [cylcObjects.Workflow, cylcObjects.Namespace, cylcObjects.Job],
    _requiresInfo: false,
    _validStates: WorkflowStateNames,
  },
  {
    name: 'info',
    description: 'View task information.',
    args: [],
    _appliesTo: [cylcObjects.Namespace],
    _requiresInfo: false
  },
]

/**
 * Map real mutations to dummy mutations with the same permission level.
 *
 * @type {{ [permission: string]: string[] }}
 */
const dummyMutationsPermissionsMap = Object.freeze({
  broadcast: Object.freeze(['editRuntime']),
  read: Object.freeze(['log', 'info'])
})

/**
 * Translate a global ID into a token dictionary.
 *
 * @param {string} id
 * @returns {Object}
 * */
export function tokenise (id) {
  // TODO: unify this into the UID code better
  if (!id) {
    return {}
  }
  const tokens = new Tokens(id)
  const ret = {}
  for (const token of Object.values(cylcObjects)) {
    if (tokens[token]) {
      ret[token] = tokens[token]
    }
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
 * Find the GraphQL object with the given name.
 *
 * @export
 * @template {Object} T
 * @param {T[]} objs - List of GraphQL objects, which have a property 'name'
 * @param {string} name - Name to match
 * @return {T=}
 */
export function findByName (objs, name) {
  return objs.find(type => type.name === name)
}

/**
 * Use the introspection type to extract all fields for a query/mutation if
 * no fields are given.
 *
 * This allows you to do a query and return all fields without having to list
 * them all out.
 *
 * @param {IntrospectionInputType} type - GraphQL type that we are looking for fields in.
 * @param {?Field[]} fields - Subset of fields on the above type to extract. If nullish, extract all fields (if any).
 * @param {IntrospectionInputType[]} types - Full list of GraphQL types from introspection query.
 * @return {?Field[]}
 */
export function extractFields (type, fields, types) {
  fields ??= type.fields // extract all fields if none given
  if (!fields) {
    return null
  }
  return fields.map(field => {
    const gqlField = findByName(type.fields, field.name)
    if (!gqlField) {
      throw new Error(`No such field "${field.name}" on type "${type.name}"`)
    }
    const fieldType = findByName(types, getBaseType(gqlField.type).name)
    return {
      name: field.name,
      fields: extractFields(fieldType, field.fields, types)
    }
  })
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
 * @param {Mutation} mutations - Mutations as returned by introspection query.
 * @param {IntrospectionInputType[]} types - Types as returned by introspection query.
 */
export function processMutations (mutations, types) {
  for (const mutation of mutations) {
    mutation._title = camelToWords(mutation.name)
    mutation._icon = getMutationIcon(mutation.name)
    mutation._shortDescription = getMutationShortDesc(mutation.description)
    mutation._help = getMutationExtendedDesc(mutation.description)
    mutation._validStates ??= getStates(mutation.description)
    processArguments(mutation, types)
  }
}
/**
 * Get the workflow states that the mutation is valid for.
 *
 * @export
 * @param {string=} text - Full mutation description.
 * @return {string[]}
 */
export function getStates (text) {
  if (!text) {
    return WorkflowStateNames
  }
  // default to all workflow states
  const validStates = text.match(/Valid\sfor:\s(.*)\sworkflows./)
  if (validStates) {
    return validStates[1].replace(/\s/g, '').split(',')
  }
  return WorkflowStateNames
}

/**
 * Get the first part of a mutation description (up to the first double newline).
 *
 * @export
 * @param {string=} text - Full mutation description.
 * @return {string}
 */
export function getMutationShortDesc (text) {
  return text?.split('\n\n', 1)[0] || ''
}

/**
 * Get the rest of a mutation description (after the first double newline).
 *
 * @export
 * @param {string=} text - Full mutation description.
 * @return {string=}
 */
export function getMutationExtendedDesc (text) {
  return text?.split('\n\n').slice(1).join('\n\n')
}

/**
 * Process mutation arguments from a GraphQL introspection query.
 *
 * This adds some computed fields prefixed with an underscore for later use:
 *   _title:
 *     Human-readable name for the mutation.
 *   _cylcObject:
 *     The Cylc Object this field relates to if any (e.g. Cycle, Task etc.).
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
 * @param {Mutation} mutation - One Mutation as returned by introspection query.
 * @param {IntrospectionInputType[]} types - Types as returned by introspection query.
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
    if (pointer?.kind === 'NON_NULL') {
      required = true
    }
    while (pointer) {
      // walk down the nested type tree
      if (pointer.kind === 'LIST') {
        multiple = true
      } else if (pointer.kind !== 'NON_NULL' && pointer.name) {
        cylcType = pointer.name
        for (const objectName in mutationMapping) {
          for (const [type, impliesMultiple] of mutationMapping[objectName]) {
            if (pointer.name === type) {
              cylcObject = objectName
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
  const query = gql(`
    query {
      __schema {
        queryType {
          ...FullType
        }
        mutationType {
          ...FullType
        }
        types {
          ...FullType
        }
      }
    }
  `)
  // TODO: this returns all queries & types, we only need certain ones

  // NOTE: we are converting to string form then re-parsing
  // back to a query, as something funny happens when you
  // try to modify the gql objects by hand.
  return gql(
    // the query we actually want to run
    print(query.definitions[0]) +
    // the fragments which power it
    print(fullIntrospection.definitions[1]) +
    print(fullIntrospection.definitions[2]) +
    print(fullIntrospection.definitions[3])
  )
}

/**
 * Filter for mutations that relate to the given Cylc object.
 *
 * Returns an array of objects containing matching mutations and the following properties:
 * - Does the mutation require additional info?
 * - Is the user authorised to perform the mutation?
 *
 * @param {string} cylcObject - The type of object to filter mutations by.
 * @param {object} tokens - Tokens representing the context of this object.
 * @param {Mutation[]} mutations - Array of mutations.
 * @param {string[]} permissions - List of permissions for the user.
 * @returns {FilteredMutation[]}
 */
export function filterAssociations (cylcObject, tokens, mutations, permissions) {
  const ret = []
  permissions = [
    ...permissions.map(x => x.toLowerCase()),
    ...Object.entries(dummyMutationsPermissionsMap).flatMap(
      ([permission, equivalents]) => permissions.includes(permission)
        ? equivalents.map(x => x.toLowerCase())
        : []
    ),
  ]
  for (const mutation of mutations) {
    const authorised = permissions.includes(mutation.name.toLowerCase())
    let requiresInfo = mutation._requiresInfo ?? false
    let applies = mutation._appliesTo?.includes(cylcObject)
    for (const arg of mutation.args) {
      if (arg._cylcObject) {
        if (arg._cylcObject === cylcObject) {
          // this is the object type we are filtering for
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
      // is there an alternate cylc object which can satisfy this field?
      if (alternateFields[arg._cylcType] === cylcObject) {
        // this might not be the object type we're filtering for, but it'll do
        applies = true
      }
    }
    if (!applies) {
      continue
    }
    ret.push(
      { mutation, requiresInfo, authorised }
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
 * @param {GQLType} type - A type as returned by an introspection query.
 * (i.e. an object of the form {name: x, kind: y, ofType: z}
 *
 * @yields {GQLType} Type objects of the same form as the type argument.
 */
export function * iterateType (type) {
  while (type) {
    yield type
    type = type.ofType
  }
}

/**
 * Walk a GraphQL type and return the final base type.
 *
 * E.G. NonNull<List<String>> would return String.
 *
 * @export
 * @param {GQLType} type
 * @return {GQLType}
 */
export function getBaseType (type) {
  return [...iterateType(type)].pop()
}

/** Return an appropriate null value for the specified type.
 *
 * @param {GQLType} type - A type field as returned by an introspection query.
 * (an object of the form {name: x, kind: y, ofType: z}).
 * @param {(IntrospectionInputType[])=} types - An array of all types present in the schema.
 * (optional: used to resolve InputObjectType fields).
 *
 * @returns {Object|Object[]|null}
 */
export function getNullValue (type, types = []) {
  let ret = null
  for (const subType of iterateType(type)) {
    if (subType.kind === 'LIST') {
      const ofType = getNullValue(subType.ofType, types)
      ret = ofType ? [ofType] : []
      break
    }
    if (subType.kind === 'OBJECT') {
      ret = {}
      // TODO: this type iteration is already done in the mixin
      //       should we use the mixin or a subset there-of here?
      const type = types.find(({ name, kind }) => (
        name === subType.name && kind === subType.kind
      ))
      for (const field of type.fields) {
        ret[field.name] = getNullValue(field.type, types)
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
 * @param {MutationArg} arg - An argument from a introspection query.
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
 * @param {Mutation} mutation - A mutation as returned by an introspection query.
 *
 * @returns {string} A mutation string for a client to send to the server.
 */
export function constructMutation (mutation) {
  // the scan mutation has no arguments
  if (!mutation.args.length) {
    return dedent`
      mutation ${mutation.name} {
        ${mutation.name} {
          result
        }
      }
    `.trim()
  }

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
 * Construct a query string from a query object.
 *
 * @export
 * @param {Query} query
 * @return {string}
 */
export function constructQueryStr (query) {
  const argNames = []
  const argTypes = []
  for (const arg of query.args) {
    argTypes.push(`$${arg.name}: ${argumentSignature(arg)}`)
    argNames.push(`${arg.name}: $${arg.name}`)
  }

  /**
   * @param {Field[]} fields
   * @param {number} indentLevel
   * @return {string}
   */
  const constructFieldsStr = (fields, indentLevel) => {
    return fields.map(
      field => {
        let ret = '  '.repeat(indentLevel) + field.name
        if (field.fields) {
          ret += ' {\n'
          ret += constructFieldsStr(field.fields, indentLevel + 1)
          ret += '\n' + '  '.repeat(indentLevel) + '}'
        }
        return ret
      }
    ).join('\n')
  }

  return [
    `query ${query.name}(${argTypes.join(', ')}) {`,
    `  ${query.name}(${argNames.join(', ')}) {`,
    constructFieldsStr(query.fields, 2),
    '  }',
    '}'
  ].join('\n').trim()
}

/**
 * Return any arguments for the mutation which can be determined from tokens.
 *
 * Return default arguments for the provided mutation filling in what
 * information we can from the context tokens.
 *
 * @param {Mutation} mutation
 * @param {Object} tokens
 *
 * @returns {Object}
 * */
export function getMutationArgsFromTokens (mutation, tokens) {
  const argspec = {}
  let value
  for (const arg of mutation.args) {
    const alternate = alternateFields[arg._cylcType]
    for (let token in tokens) {
      if (arg._cylcObject && [token, alternate].includes(arg._cylcObject)) {
        if (arg.name === 'cutoff') {
          // Work around for a field we don't want filled in, see:
          // * https://github.com/cylc/cylc-ui/issues/1222
          // * https://github.com/cylc/cylc-ui/issues/1225
          // TODO: Once #1225 is done the field type can be safely changed in
          // the schema without creating a compatibility issue with the UIS.
          continue
        }
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
 * @param {string} message
 * @returns {MutationResponse}
 */
function _mutateSuccess (message) {
  return {
    status: mutationStatus.SUCCEEDED,
    message
  }
}

/**
 * Handle an error in a called mutation.
 *
 * @param {string} mutationName
 * @param {Error|string} err - error message to display
 * @param {*} response - raw GraphQL response or null
 *
 * @returns {Promise<MutationResponse>} {status, msg}
 */
async function _mutateError (mutationName, err, response) {
  // log the response
  if (response) {
    // eslint-disable-next-line no-console
    console.error('mutation response', response)
  }

  // open a user alert
  await store.dispatch(
    'setAlert',
    new Alert(err, 'error', `Command failed: ${mutationName} - ${err}`)
  )

  // format a response
  return {
    status: mutationStatus.FAILED,
    message: err,
  }
}

/**
 * Call a mutation.
 *
 * @param {Mutation} mutation
 * @param {Object} variables
 * @param {ApolloClient} apolloClient
 * @param {string=} cylcID
 *
 * @returns {(MutationResponse | Promise<MutationResponse>)} {status, msg}
 */
export async function mutate (mutation, variables, apolloClient, cylcID) {
  const mutationStr = constructMutation(mutation)
  let response = null
  // eslint-disable-next-line no-console
  console.debug([
    `mutation(${mutation.name})`,
    mutationStr,
    variables
  ])

  try {
    // call the mutation
    response = await apolloClient.mutate({
      mutation: gql(mutationStr),
      variables
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
    const { result } = response.data[mutation.name]
    if (Array.isArray(result) && result.length === 2) {
      // regular [commandSucceeded, message] format
      if (result[0] === true) {
        // success
        return _mutateSuccess(result[1])
      }
      // failure (Cylc error, e.g. could not find workflow <x>)
      return _mutateError(mutation.name, result[1], response)
    }
    // command in a different format (e.g. info command)
    return _mutateSuccess(result)
  } catch (error) {
    return _mutateError(mutation.name, 'invalid response', response)
  }
}

/**
 * Send a GraphQL query.
 *
 * @export
 * @param {Query} query - Query to send
 * @param {Object} variables - Query variables
 * @param {ApolloClient} apolloClient
 * @return {Promise<Object>}
 */
export async function query (query, variables, apolloClient) {
  const queryStr = constructQueryStr(query)
  // eslint-disable-next-line no-console
  console.debug([
    `query(${query.name})`,
    queryStr,
    variables
  ])

  const response = await apolloClient.query({
    query: gql(queryStr),
    variables
  })
  return response.data
}
