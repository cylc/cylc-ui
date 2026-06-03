<!--
  Copyright (C) NIWA & British Crown (Met Office) & Contributors.

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

<!--
  Quick and simple Vue wrapper for markdown-it.
-->

<template>
  <div class="markdown" v-html="html"></div>
</template>

<script>
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

export default {
  name: 'Markdown',

  props: {
    markdown: {
      type: String,
      required: true,
    },
  },

  computed: {
    html () {
      return md.render(this.markdown)
    },
  },
}
</script>
