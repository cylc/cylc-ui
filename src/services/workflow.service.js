import { parse } from 'graphql/language/parser';
import { print } from 'graphql/language/printer';

import Alert from '@/model/Alert.model'
import { createApolloClient } from '@/utils/graphql'
import store from '@/store/'
//import VueAdsTableTreeTransformer from '@/transformers/vueadstabletree.transformer'


function gClone(query) {
    /* clone a query, why oh why isn't there a better way of doing this in JS!
     * this is acytually kinda dangerous as there can be lost information */
    return JSON.parse(JSON.stringify(query));
}


function getSelections(a) {
    /* return dictionary of selections present on a node. */
    var selections = {};
    if (! a.selectionSet) {
        return {};
    }
    if (! a.selectionSet.selections) {
        return {};
    }
    for (let selection of a.selectionSet.selections) {
        if (selection.kind === 'Field') {
            selections[selection.name.value] = selection;
        }
    }
    return selections;
}


function mergeSelection(a, b) {
    /* merge b into a */
    var aSel = getSelections(a);
    var bSel = getSelections(b);
    for (let selection in bSel) {
        if (!(selection in aSel)) {
            a.selectionSet.selections.push(gClone(bSel[selection]));
        } else {
            mergeSelection(aSel[selection], bSel[selection]);
        }
    }
}


function merge(a, b) {
    /* merge two graphql schema */
    mergeSelection(a.definitions[0], b.definitions[0]);
}


function prefix_lines(str, pref) {
    return pref + str.replace(/\n/g, `\n${pref}`);
}


class WorkflowService {

  constructor() {
    this.apolloClient = createApolloClient(
        `${window.location.pathname}/graphql`
    );
    //this.transformer = new VueAdsTableTreeTransformer()
    this.query;
    this.subscriptions = [];
    this.views = new WeakMap();

    this.polling = setInterval(() => {
      this.request();
    }, 5000)
  }

  destructor() {
    clearInterval(this.polling);
  }

  getHash() {
    /* psudo-random hash for internal identification only */
    return Math.random();
  }

  recompute () {
    /* recompute the combined query */
    if (this.subscriptions.length < 1) {
        this.query = null;
        return;
    }
    // merge together active subscriptions
    var root = gClone(this.subscriptions[0][2]);
    for (let subscription of this.subscriptions.slice(1)) {
        merge(root, subscription[2]);
    }
    this.query = root;

    // TODO - remove
    this.print();
  }

  register(view) {
    /* register a new view */
    this.views[view.viewId] = view
  }

  unregister(view) {
    /* unregister a view (all subscriptions will be dropped */
    this.view.remove(view);
    this.subscriptions = this.subscriptions.filter(
      item => item[1] != view
    );
    this.recompute();
  }

  subscribe(view, query) {
    /* subscribe a view to a query */
    var hash = this.getHash();
    this.subscriptions.push(
        [hash, view, parse(query)]
    );
    this.recompute();
    return hash;
  }

  unsubscribe (hash) {
    /* un-subscribe a view from a query */
    this.subscriptions = this.subscriptions.filter(
      item => item[0] != hash
    );
      this.recompute();
  }

  request() {
    console.log('graphql:', this.query);

    this.apolloClient.query({
      query: this.query,
      fetchPolicy: 'no-cache'
    }).then((response) => {
      const workflows = response.data.workflows;
      store.dispatch('workflows/set', workflows);
      return true;
    }).catch((error) => {
      const alert = new Alert(error.message, null, 'error');
      store.dispatch('addAlert', alert);
      return false;
    });
  }

  print () {
    /* dump a human-readable representation of all subscriptions */
    var ret = 'Combined Query:';
    if (this.query) {
        ret += '\n' + prefix_lines(print(this.query), '    ');
    } else {
        ret += `\n    ${this.query}`;
    }
    var view;
    for (let id in this.views) {
      view = this.views[id];
      ret += `\n${id}`;
      for (let item of this.subscriptions.filter(item => item[1] == view)) {
        ret += `\n    Subscription: ${item[0]}`
        ret += '\n' + prefix_lines(print(item[2]), '    ');
      }
    }
    console.log(ret);
  }

}


const workflowService = new WorkflowService();

export { workflowService }
