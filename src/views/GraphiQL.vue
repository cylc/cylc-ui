<!--
Copyright (C) Earth Sciences New Zealand & British Crown (Met Office) & Contributors.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

<template>
  <div id="graphiql" ref="graphiql">Loading...</div>
</template>

<script setup>
import 'graphiql/graphiql.css'
import { onMounted, useTemplateRef } from 'vue'
import { render, createElement } from 'preact/compat'
import { GraphiQL } from 'graphiql'
import { useGraphiQLFetcher } from '@/graphql/graphiql'

const div = useTemplateRef('graphiql')

const fetcher = useGraphiQLFetcher()

onMounted(() => {
  render(
    createElement(GraphiQL, {
      fetcher,
      defaultVariableEditorOpen: false,
    }),
    div.value
  )
})
</script>

<style scoped>
body {
  height: 100%;
  margin: 0;
  overflow: hidden;
  width: 100%;
}

#graphiql {
  height: 100vh;
}
</style>
