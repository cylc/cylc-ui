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
  <div class="log-wrapper">
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      density="comfortable"
      class="mb-4"
      :icon="$options.icons.mdiFileAlertOutline"
    >
      <span class="text-pre-wrap text-break">
        {{ error }}
      </span>
    </v-alert>
    <pre class="log-text"><span
      v-for="(log, index) in computedLogs"
      :key="index"
      :class="wordWrap ? 'text-pre-wrap' : 'text-pre'"
    >{{ log }}</span></pre>
    <!-- a div to use for autoscrolling -->
    <div ref="auto-scroll-end"></div>
  </div>
</template>

<script>
import {
  mdiFileAlertOutline
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
    error: {
      type: String,
      required: false
    },
    autoScroll: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data () {
    return {
      match: ''
    }
  },

  mounted () {
    const ro = new ResizeObserver(this.onResize)
    ro.observe(this.$el)
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
    onResize () {
      if (this.autoScroll) {
        this.scrollToElement('auto-scroll-end', { behavior: 'smooth' })
      }
    },

    updateLogs () {
      return this.logs.map((logLine) => {
        return this.stripTimestamp(logLine)
      })
    },

    stripTimestamp (logLine) {
      const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-][\d:]+)?\s(.*\s*)/
      this.match = logLine.match(regex)
      if (this.match) {
        return this.match[1]
      }
      return logLine
    },

    scrollToElement (elementCLassName, options) {
      if (this.$refs[elementCLassName]) {
        this.$refs[elementCLassName].scrollIntoView(options)
      }
    },

  },

  // Misc options
  icons: {
    mdiFileAlertOutline
  }
}

</script>
