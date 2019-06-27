/*jshint esversion:6*/
import Vue from 'vue';
import Graph from '@/views/Graph.vue';
import { shallowMount } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { expect } from 'chai';
import sinon from 'sinon';
import Vuetify from 'vuetify';
import VBtn from 'vuetify';
import cytoscape from 'cytoscape';

Vue.use(Vuetify, {
  VBtn
  },
  cytoscape
);

describe('Graph.vue', () => {
    describe('constructor', () => {
    it('should mount for testing', () => {
        const wrapper = mount(Graph);
        expect(wrapper.find('[id="holder"]'));
    });
    });
});
