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

<template>
  <div
    ref="wrapper"
    class="h-100 overflow-auto px-4 pb-2"
    :class="{
      'strip-timestamps': !timestamps,
      'word-wrap': wordWrap,
    }"
  >
    <pre ref="content" class="content"></pre>
    <v-btn
      position="fixed"
      location="bottom right"
      class="ma-5"
      @click="scrollToTop"
      :icon="$options.icons.mdiMouseMoveUp"
      data-cy="log-scroll-top"
    />
  </div>
</template>

<script>
import { useTemplateRef, nextTick } from 'vue'
import { useScroll, useVModel, whenever } from '@vueuse/core'
import { eventBus } from '@/services/eventBus'
import { mdiMouseMoveUp } from '@mdi/js'

export default {
  name: 'LogComponent',

  props: {
    timestamps: {
      type: Boolean,
      required: false,
      default: true
    },
    wordWrap: {
      type: Boolean,
      required: false,
      default: false
    },
    autoScroll: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  emits: [
    'update:autoScroll'
  ],

  setup (props, { emit }) {
    const content = useTemplateRef('content')
    const wrapper = useTemplateRef('wrapper')
    const autoScroll = useVModel(props, 'autoScroll', emit)

    const { arrivedState, directions } = useScroll(wrapper)

    // Turn off autoscroll when user scrolls up:
    whenever(() => directions.top, () => {
      autoScroll.value = false
    })

    function scrollToBottom () {
      content.value?.scrollIntoView(false, { behaviour: 'smooth' })
    }

    async function scrollToTop () {
      autoScroll.value = false
      await nextTick()
      wrapper.value?.scroll({ top: 0, left: 0, behavior: 'smooth' })
    }

    return {
      scrollToTop,
      scrollToBottom,
    }
  },

  mounted () {
    eventBus.on('lines-added', this.addLines)
    eventBus.on('reset-log', this.clear)
  },

  beforeUnmount () {
    eventBus.off('lines-added')
    eventBus.off('reset-log')
  },

  methods: {
    addLines (lines) {
      let line, ele, match
      for (line of lines) {
        match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-][\d:]+)?\s)(.*\s*)/)
        if (match) {
          // line has a timestamp prefix
          line = match[2]
          ele = document.createElement('span')
          ele.classList.add('timestamp')
          ele.innerText = match[1]
          this.$refs.content.appendChild(ele)
        }
        ele = document.createElement('span')
        ele.innerText = line
        this.$refs.content.appendChild(ele)
      }
      if (this.autoScroll) {
        this.scrollToBottom()
      }
    },

    clear () {
      this.$refs.content.textContent = ''
    },
  },

  watch: {
    autoScroll (newVal) {
      if (newVal) {
        this.scrollToBottom()
      }
    }
  },

  // Misc options
  icons: {
    mdiMouseMoveUp
  }
}
</script>

<style lang="scss">
.c-log {
  .content {
    height: 100%!important;
    display: inline;
    padding-bottom: 1em;
  }

  .timestamp {
    color: blue;
  }

  .strip-timestamps .timestamp {
    display: none
  }

  .word-wrap .content {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}
</style>
