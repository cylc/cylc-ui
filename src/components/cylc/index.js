/**
 * List of task/job states that support "progress".
 * @type {string[]}
 */
const STATES_WITH_PROGRESS = ['running']

/**
 * Compute percent progress.
 *
 * @see https://github.com/cylc/cylc-flow/blob/de7d938496e82dbdfb165938145670dd8e801efd/lib/cylc/gui/updater_tree.py#L248-L263
 * @param {number} startedTime in milliseconds since 1970-01-01 00:00:00 UTC, e.g. 1568353099874
 * @param {number} meanElapsedTime mean elapsed time in seconds
 * @returns {number} the percent progress, e.g. 25 (meaning 25% progress)
 * @private
 */
function computePercentProgress (startedTime, meanElapsedTime) {
  const now = Date.now() // milliseconds since 1970-01-01
  // startedTime > now reportedly possible via interaction with `cylc reset`
  if (startedTime > now || meanElapsedTime === 0) {
    return 0
  }

  if (now > startedTime + meanElapsedTime * 1000) {
    return 100
  }
  return 100 * (now - startedTime) / (meanElapsedTime * 1000)
}

/**
 * Extract the list of cycles for a given workflow.
 *
 * @param workflow {object} a workflow
 * @returns {Set<string>}
 */
function getWorkflowCycles (workflow) {
  const cycles = new Set()
  if (Object.prototype.hasOwnProperty.call(workflow, 'taskProxies')) {
    for (const proxy of workflow.taskProxies) {
      cycles.add(proxy.cyclePoint)
    }
  }
  return cycles
}

export {
  STATES_WITH_PROGRESS,
  computePercentProgress,
  getWorkflowCycles
}
