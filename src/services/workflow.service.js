import Alert from '@/model/Alert.model'
import { GQuery } from '@/services/gquery'
import store from '@/store/'


class LiveWorkflowService extends GQuery {
    /* WorkflowService for on-line work.
     *
     * This class provides the functionality required for polling the GraphQL
     * endpoint.
     */

    constructor() {
        super();
        this.polling = setInterval(() => {
          this.refresh();
        }, 5000);
    }

    destructor() {
        clearInterval(this.polling);
    }

    refresh() {
        /* Perform a REST request to update the data store. */
        this.request(
            this.successCallback,
            this.errorCallback
        );
    }

    successCallback(workflows) {
        /* On successfull request, update data store. */
        store.dispatch('workflows/set', workflows);
    }

    errorCallback(error) {
        /* On un-successfull requrest, issue warning. */
        const alert_item = new Alert(error.message, null, 'error');
        store.dispatch('setAlert', alert_item);
    }

}


const workflowService = new LiveWorkflowService();

export { workflowService}
