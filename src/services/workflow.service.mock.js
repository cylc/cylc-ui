import { checkpoint } from '@/services/mock/checkpoint.js'
import { GQuery } from '@/services/gquery'
import store from '@/store/'


class MockWorkflowService extends GQuery {
    /* Standin WorkflowService for off-line work.
     *
     * This class provides the functionality for fetching mock data.
     */

    constructor() {
        super();
        this.load_mock();
    }

    load_mock() {
        /* load the mock data */
        console.log('load mock data');
        store.dispatch('workflows/set', checkpoint.workflows);
    }

    request () {
        /* disable the GraphQL stuff */
        console.log('mock graphql:', this.query);
    }
}


const workflowService = new MockWorkflowService();

export { workflowService }
