<template>
  <!-- <div id="editor" style="width: 500px; height: 500px"></div> -->
  <div>
    <div v-for="log in logs" :key="log">{{log}}</div>
  </div>
</template>

<script>
// import gql from 'graphql-tag'
// import loader from '@monaco-editor/loader'
// import { Script } from 'vm';
export default {
  name: 'LogComponent',
  props: {
    logs: {
      type: Array,
      required: true
    },
    workflowName: {
      type: String,
      required: true
    }
  }
  // async mounted () {
  //   loader.init().then((monaco) => {
  //     monaco.editor.create(document.getElementById('editor'))
  //   },

}

</script>
