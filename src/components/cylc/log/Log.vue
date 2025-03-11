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
    <!-- a div to use for autoscrolling -->
    <div ref="autoScrollEnd"></div>
  </div>
</template>

<script>
import { useTemplateRef, watch } from 'vue'
import { when } from '@/utils'

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
  },

  mounted () {
    window.addEventListener('wheel', this.handleScroll)
  },

  onBeforeUnmount () {
    this.ro.disconnect()
    window.removeEventListener('wheel', this.handleScroll)
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
    },

    handleScroll (event) {
      if (this.autoScroll) {
        this.$emit('autoScroll')
      }
    },
  }
}

</script>
