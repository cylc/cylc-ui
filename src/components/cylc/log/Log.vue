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
  <div ref="wrapper">
    <pre data-cy="log-text"><span
      v-for="(log, index) in computedLogs"
      :key="index"
      :class="wordWrap ? 'text-pre-wrap' : 'text-pre'"
    >{{ log }}</span></pre>
    <v-btn
      v-if="logs.length"
      position="fixed"
      location="bottom right"
      class="ma-3"
      @click="scrollToTop"
      :icon="$options.icons.mdiMouseMoveUp"
    />
    <!-- a div to use for autoscrolling -->
    <div ref="autoScrollEnd"></div>
  </div>
</template>

<script>
import { useTemplateRef, watch, onBeforeUnmount } from 'vue'
import { when } from '@/utils'
import {
  mdiMouseMoveUp
} from '@mdi/js'
export default {
  name: 'LogComponent',

  props: {
    placeholder: {
      type: String,
      required: false
    },
    timestamps: {
      type: Boolean,
      required: false,
      default: true
    },
    logs: {
      type: Array,
      required: true
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

  setup (props) {
    const wrapperRef = useTemplateRef('wrapper')
    const autoScrollEndRef = useTemplateRef('autoScrollEnd')

    function scrollToEnd () {
      autoScrollEndRef.value?.scrollIntoView({ behavior: 'smooth' })
    }

    function scrollToTop () {
      wrapperRef.value?.scrollIntoView({ behavior: 'smooth' })
    }

    const ro = new ResizeObserver(scrollToEnd)

    when(wrapperRef, () => {
      watch(
        () => props.autoScroll,
        (val) => {
          if (val) {
            scrollToEnd()
            ro.observe(wrapperRef.value)
          } else {
            ro.disconnect()
          }
        },
        { immediate: true }
      )
    })

    onBeforeUnmount(() => {
      ro.disconnect()
    })

    return {
      scrollToTop
    }
  },

  computed: {
    computedLogs () {
      if (this.logs.length > 0) {
        if (!this.timestamps) {
          return this.updateLogs()
        } else return this.logs
      } else if (this.placeholder) {
        return [this.placeholder]
      } else {
        return []
      }
    },
  },

  methods: {
    updateLogs () {
      return this.logs.map((logLine) => {
        return this.stripTimestamp(logLine)
      })
    },

    stripTimestamp (logLine) {
      const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-][\d:]+)?\s(.*\s*)/
      return logLine.match(regex)?.[1] ?? logLine
    }
  },

  // Misc options
  icons: {
    mdiMouseMoveUp
  }
}

</script>
