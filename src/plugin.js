import CyElement from '@/components/core/CyElement.vue';
import VueCytoscape from '@/components/core/Cytoscape.vue';
import CyObj from '@/plugins/cy-object';

export default {
  install(Vue) {
    Vue.component('cytoscape', VueCytoscape);
    Vue.component('cy-element', CyElement);
    Vue.prototype.$cytoscape = CyObj;
  }
}

export { VueCytoscape, CyElement };
