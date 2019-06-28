import _ from 'lodash'
import Family from '@/model/Family.model'
import Task from '@/model/Task.model'

export default class VueAdsTableTreeTransformer {

  transform (graphqlFamilyProxies = []) {
    return _.map(graphqlFamilyProxies, (familyProxy) => {
      return this._recursivelyTransformFamily(familyProxy)
    })
  }

  _recursivelyTransformFamily (familyProxy) {
    const childrenFamilies = familyProxy.childFamilies.length > 0 ? _.map(familyProxy.childFamilies, this._recursivelyTransformFamily) : []
    const childrenTasks = familyProxy.childTasks !== undefined && familyProxy.childTasks.length > 0 ? _.map(familyProxy.childTasks, this._transformTask) : []
    const f = new Family(
      familyProxy.name,
      familyProxy.cyclePoint,
      familyProxy.state,
      familyProxy.depth,
      childrenTasks,
      childrenFamilies
    );
    // monkey patching the family object to add hierarchy for vue-ads-table-tree
    f._showChildren = true;
    f._children = childrenTasks;
    if (f.name === "root") {
      f.name = f.cyclePoint;
    }
    return f;
  }

  _transformTask (childTask) {
    const t = new Task(
      childTask.id,
      childTask.state,
      childTask.latestMessage,
      childTask.depth,
      [] // FIXME; convert to a JobModel later?
    );
    // monkey patching the task object to add fields matching what is expected in columns for vue-ads-table-tree
    t.name = childTask.id;
    if (childTask.hasOwnProperty('jobs') && childTask.jobs.length > 0) {
      t.jobId = childTask.jobs[0].batchSysJobId;
      t.host = childTask.jobs[0].host;
    }
    if (childTask.hasOwnProperty('task')) {
      t.name = childTask.task.name;
    }
    return t;
  }
}
