/**
 * Get a state summary for a given workflow. The returned map has a string with the state name as key. These keys
 * are sorted alphabetically. The values are sets, with the task names (<tt>${name}.${cyclepoint}</tt>). These
 * names are also sorted alphabetically.
 * @param {Object} workflow
 * @returns {Map<string, Array>}
 * @see https://github.com/cylc/cylc-flow/blob/de7d938496e82dbdfb165938145670dd8e801efd/lib/cylc/state_summary_mgr.py#L204
 */
function getWorkflowSummary (workflow) {
  const states = new Map()
  for (const taskProxy of workflow.taskProxies) {
    for (const job of taskProxy.jobs) {
      // TODO: temporary fix, as the backend is sending ready jobs, but they will change in cylc flow&uiserver in the future
      if (job.state === 'ready') {
        continue
      }
      if (!states.has(job.state)) {
        states.set(job.state, new Set())
      }
      states.get(job.state).add(`${taskProxy.name}.${taskProxy.cyclePoint}`)
    }
  }
  for (const [stateName, tasksSet] of states.entries()) {
    states.set(stateName, [...tasksSet].sort())
  }
  return new Map([...states.entries()].sort())
}

export {
  getWorkflowSummary
}
