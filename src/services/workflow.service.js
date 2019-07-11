import Alert from '@/model/Alert.model'
import { createApolloClient } from '@/utils/graphql'
import store from '@/store/'
//import VueAdsTableTreeTransformer from '@/transformers/vueadstabletree.transformer'

class WorkflowService {

  constructor() {
    this.apolloClient = createApolloClient(
        `${window.location.pathname}/graphql`
    );
    //this.transformer = new VueAdsTableTreeTransformer()
    this.subscriptions = []

    this.polling = setInterval(() => {
      this.request();
    }, 5000)
  }

  destructor() {
    clearInterval(this.polling);
  }

  subscribe(query) {
    this.subscriptions.push(query);
    // TODO: temporary, views should be patient
    //this.request();
    //this.dummy();
  }

  request() {
    var query = this.subscriptions[0];  // TODO
    console.log('%', query);

    this.apolloClient.query({
      query: query,
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

  dummy() {
    store.dispatch(
      'workflows/set',
      [
        {
          "id": "osanders/generic",
          "name": "generic",
          "owner": "osanders",
          "host": "eld668.cmpd1.metoffice.gov.uk",
          "port": 43089,
          "__typename": "Workflow"
        }
      ]
    );
  }

}


const workflowService = new WorkflowService();


export { workflowService }
