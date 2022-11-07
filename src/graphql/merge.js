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

// eslint-disable-next-line no-unused-vars
import { ArgumentNode, DefinitionNode, DocumentNode, FieldNode, FragmentDefinitionNode, SelectionNode, SelectionSetNode, ValueNode, VariableDefinitionNode } from 'graphql'
import isArray from 'lodash/isArray'
import isEqual from 'lodash/isEqual'
import isObject from 'lodash/isObject'
import transform from 'lodash/transform'

/**
 * Merge two GraphQL queries (DocumentNode's), returning a single query.
 *
 * @param {DocumentNode} queryA
 * @param {DocumentNode} queryB
 * @return {DocumentNode}
 */
function mergeQueries (queryA, queryB) {
  // Basic validation.
  if (!queryA || !queryB) {
    throw new Error('You must provide two valid queries')
  }
  if (queryA.kind !== 'Document' || queryB.kind !== 'Document') {
    throw new Error('You must provide two documents')
  }
  // Find the operation definitions for the two queries.
  const queryADefinitions = queryA
    .definitions
    .filter(definition => definition.kind === 'OperationDefinition')
  const queryBDefinitions = queryB
    .definitions
    .filter(definition => definition.kind === 'OperationDefinition')
  // More validations...
  if (queryADefinitions.length !== 1 || queryBDefinitions.length !== 1) {
    throw new Error('Each query must have a single definition')
  }
  // Merge the query definitions.
  const definition = mergeDefinitions(queryADefinitions[0], queryBDefinitions[0])
  // Merge the fragments.
  const queryAFragments = queryA
    .definitions
    .filter(definition => definition.kind === 'FragmentDefinition')
  const queryBFragments = queryB
    .definitions
    .filter(definition => definition.kind === 'FragmentDefinition')
  const fragments = mergeFragments(queryAFragments, queryBFragments)
  // Finally return the merged definitions and fragments (loc in the AST nodes is not important).
  queryA.definitions = [
    definition,
    ...fragments
  ]
  return queryA
}

/**
 * Merge two arrays of fragments, returning a single array of fragments.
 *
 * @param {Array<FragmentDefinitionNode>} fragmentsA
 * @param {Array<FragmentDefinitionNode>} fragmentsB
 * @return {Array<FragmentDefinitionNode>}
 */
function mergeFragments (fragmentsA, fragmentsB) {
  const fragments = fragmentsA
  /**
   * @type {Object.<String, FragmentDefinitionNode>}
   */
  const fragmentsByTypeCondition = {}
  fragments.forEach(fragment => {
    fragmentsByTypeCondition[fragment.typeCondition.name.value] = fragment
  })
  fragmentsB.forEach(fragment => {
    const typeConditionName = fragment.typeCondition.name.value
    const existingFragment = fragmentsByTypeCondition[typeConditionName]
    if (!existingFragment) {
      // If it is a new fragment, then no need to worry and just add it to the array.
      fragments.push(fragment)
    } else {
      // Else we need to merge the fragments.
      existingFragment.selectionSet = mergeSelectionSets(existingFragment.selectionSet, fragment.selectionSet)
      existingFragment.directives = mergeDirectives(existingFragment.directives, fragment.directives)
    }
  })
  return fragments
}

/**
 * Merge two selection sets, returning a single selection set.
 *
 * @param {SelectionSetNode} selectionSetA
 * @param {SelectionSetNode} selectionSetB
 * @return {SelectionSetNode|undefined}
 */
function mergeSelectionSets (selectionSetA, selectionSetB) {
  if (!selectionSetA && !selectionSetB) {
    return undefined
  }
  if ((!selectionSetA && selectionSetB) || (selectionSetA && !selectionSetB)) {
    throw new Error('Selection sets must be either both undefined, or both defined')
  }
  const selectionSet = selectionSetA
  /**
   * @type {Object.<String, SelectionNode>}
   */
  const selectionsByName = {}
  selectionSet.selections.forEach(selection => {
    if (selection.kind === 'InlineFragment') {
      throw new Error('Found a selection of type "InlineFragment". Only "Field" and "FragmentSpread" are supported')
    }
    const selectionName = selection.alias ? selection.alias.value : selection.name.value
    selectionsByName[selectionName] = selection
  })
  selectionSetB.selections.forEach(field => {
    if (field.kind === 'InlineFragment') {
      throw new Error('Found a selection of type "InlineFragment". Only "Field" and "FragmentSpread" are supported')
    }
    const selectionName = field.alias ? field.alias.value : field.name.value
    const existingField = selectionsByName[selectionName]
    if (!existingField) {
      // If it is a new field, then no need to worry and just add it to the array.
      // TBD: is selections read-only?
      selectionSet.selections.push(field)
    } else {
      if (existingField.kind !== field.kind) {
        throw new Error(`Cannot merge selections "${selectionName}" with type ${existingField.kind} and ${field.kind}`)
      }
      existingField.directives = mergeDirectives(existingField.directives, field.directives)
      existingField.arguments = mergeArguments(existingField.arguments, field.arguments)
      // NB: recursion
      existingField.selectionSet = mergeSelectionSets(existingField.selectionSet, field.selectionSet)
      // We do not merge fragment spread... after all, how can we merge
      // ...Fragment and ...Fragment?
      if (existingField.kind !== 'FragmentSpread') {
        // Else we need to merge the fields.
        //
        // NOTE: ignore type error, we know the type here will be Field, since
        // we know it's not FragmentSpread and we do not accept InlineFragment.
        selectionsByName[selectionName] = mergeFields(existingField, field)
      }
    }
  })
  return selectionSet
}

/**
 * Merge two fields, returning a single field.
 *
 * @param {FieldNode} fieldA
 * @param {FieldNode} fieldB
 * @return {FieldNode}
 */
function mergeFields (fieldA, fieldB) {
  const field = fieldA
  // If the selectionSet is undefined, then it is a simple field like "id" or "name",
  // and we can simply return it later as-is (i.e. we cannot merge "id" and "id").
  if (field.selectionSet !== undefined) {
    // NB: possible recursion here
    field.selectionSet = mergeSelectionSets(field.selectionSet, fieldB.selectionSet)
  }
  return field
}

/**
 * Merge two arrays of arguments, returning a single array of arguments.
 *
 * @param {Array<ArgumentNode>} argumentsA
 * @param {Array<ArgumentNode>} argumentsB
 * @return {Array<ArgumentNode>|undefined}
 */
function mergeArguments (argumentsA, argumentsB) {
  if (!argumentsA && !argumentsB) {
    return undefined
  }
  const arguments_ = argumentsA
  const argumentsByName = {}
  arguments_.forEach(argument => {
    argumentsByName[argument.name.value] = argument
  })
  argumentsB.forEach(argument => {
    const existingArgument = argumentsByName[argument.name.value]
    if (!existingArgument) {
      arguments_.push(argument)
    } else {
      if (existingArgument.value.kind !== argument.value.kind) {
        throw new Error(`Cannot merge arguments "${existingArgument.name.value}" and "${argument.name.value}" with different types "${existingArgument.kind}" and "${argument.kind}"`)
      }
      existingArgument.value = mergeValues(existingArgument.value, argument.value)
    }
  })
  return arguments_
}

/**
 * Utility function used to remove the loc (location) property. This property
 * is set by the GraphQL parser/lexer, and while useful for the GraphQL engine,
 * it is inconvenient for us since it breaks comparison tests. It is exported
 * here since the unit tests also re-use this function.
 *
 * Will remove the .loc property recursively in an object or array.
 *
 * @param {Object} node
 * @returns {*}
 */
export function removeAstLoc (node) {
  return transform(node, function (result, value, key) {
    if (key !== 'loc') {
      if (isObject(value) || isArray(value)) {
        result[key] = removeAstLoc(value)
      } else {
        result[key] = value
      }
    }
    // else, ignore result['loc']
  })
}

/**
 * Merge two variables, returning a single variable.
 *
 * @param {ValueNode} valueA
 * @param {ValueNode} valueB
 * @return {ValueNode}
 */
function mergeValues (valueA, valueB) {
  switch (valueA.kind) {
  case 'Variable':
    if (valueA.name.value !== valueB.name.value) {
      throw new Error(`Cannot merge VariableNode's with different variables "${valueA.name.value}" and "${valueB.name.value}"`)
    }
    break
  case 'BooleanValue':
  case 'StringValue':
  case 'IntValue':
  case 'FloatValue':
    if (valueA.value !== valueB.value) {
      throw new Error(`Cannot merge ${valueA.kind}'s with different values`)
    }
    break
  case 'NullValue':
    break
  case 'ListValue':
    for (const value of valueB.values) {
      if (!valueA.values.find(element => element.kind === value.kind && element.value === value.value)) {
        valueA.values.push(value)
      }
    }
    break
  case 'ObjectValue': {
    // this is literally an object in the GraphQL query, e.g.:
    // taskProxy {
    //   outputs (satisfied: true, sort: { keys: ["time"], reverse: true}) {
    //     label
    //     message
    //   }
    // }
    // The sort: {} is an object with properties keys and reverse...
    // In order to compare the two objects, first we must omit the loc (source code location from AST...)
    const objectA = removeAstLoc(valueA)
    const objectB = removeAstLoc(valueB)
    if (!isEqual(objectA, objectB)) {
      throw new Error('Cannot merge two object values if they have different properties')
    }
    break
  }
  case 'EnumValue':
  default:
    throw new Error(`Unsupported value nodes to merge of kind ${valueA.kind}`)
  }
  return valueA
}

/**
 * TODO: implement if necessary
 * @param {Array} directivesA
 * @param {Array} directivesB
 * @return {Array}
 */
function mergeDirectives (directivesA, directivesB) {
  if ((directivesA && directivesA.length) || (directivesB && directivesB.length)) {
    throw new Error('Directives found, but not implemented')
  }
  return []
}

/**
 * @param {DefinitionNode} definitionA
 * @param {DefinitionNode} definitionB
 * @return {DefinitionNode}
 */
function mergeDefinitions (definitionA, definitionB) {
  if (definitionA.operation !== definitionB.operation) {
    throw new Error('The queries must have the same operation type')
  }
  const definition = definitionA
  const definitionAVariables = definitionA.variableDefinitions
  const definitionBVariables = definitionB.variableDefinitions
  // Optional validation, we can remove it later if we decide to accept queries
  // with different variables.
  if (!isEqual(definitionAVariables, definitionBVariables)) {
    throw new Error(`
      The queries must have the same variable definitions
      A: ${definitionAVariables}
      B: ${definitionBVariables}
    `)
  }
  // N.B: we are not merging variables, since we know they are identical already (above).
  definition.directives = mergeDirectives(definitionA.directives, definitionB.directives)
  definition.selectionSet = mergeSelectionSets(definitionA.selectionSet, definitionB.selectionSet)
  return definition
}

export default mergeQueries
