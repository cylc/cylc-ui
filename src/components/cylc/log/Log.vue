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
  <div
    ref="scrollWrapper"
    class="h-100 overflow-auto px-4 pb-2"
  >
    <v-defaults-provider
      :defaults="{
        VAlert: {
          type: 'warning',
          variant: 'tonal',
          density: 'compact',
          class: 'my-2',
        },
      }"
    >
      <v-alert
        v-if="truncatedStart"
        data-cy="log-truncation-start"
      >
        <template #prepend>
          <!-- Prototype: the HEAD/TAIL toggle (a duplicate of LAYOUT 8 from
               the toolbar) living in the truncation banner instead. -->
          <v-btn
            class="log-mode-toggle"
            variant="tonal"
            size="small"
            height="auto"
            :color="headMode ? 'blue' : undefined"
            @click="$emit('update:headMode', !headMode)"
            data-cy="log-mode-toggle-banner"
          >
            <v-icon
              start
              size="large"
              :icon="$options.icons.mdiInvoiceTextOutline"
              :class="{ 'log-mode-toggle__icon--flip': headMode }"
            />
            <span class="log-mode-toggle__stack d-flex flex-column align-center font-weight-bold text-caption py-1">
              <span>{{ headMode ? 'End' : 'Start' }}</span>
              <span>Truncated</span>
            </span>
            <v-tooltip activator="parent">{{ headModeTitle }}</v-tooltip>
          </v-btn>
        </template>
        {{ $options.truncationMessages.start }}
      </v-alert>
      <pre
        ref="logText"
        :class="wordWrap ? 'text-pre-wrap text-break' : 'text-pre'"
        data-cy="log-text"
      ><span
        v-for="(log, index) in computedLogs"
        :key="index"
      >{{ log }}</span></pre>
      <v-alert
        v-if="truncatedEnd"
        data-cy="log-truncation-end"
      >
        <template #prepend>
          <!-- Prototype: the HEAD/TAIL toggle (a duplicate of LAYOUT 8 from
               the toolbar) living in the truncation banner instead. -->
          <v-btn
            class="log-mode-toggle"
            variant="tonal"
            size="small"
            height="auto"
            :color="headMode ? 'blue' : undefined"
            @click="$emit('update:headMode', !headMode)"
            data-cy="log-mode-toggle-banner"
          >
            <v-icon
              start
              size="large"
              :icon="$options.icons.mdiInvoiceTextOutline"
              :class="{ 'log-mode-toggle__icon--flip': headMode }"
            />
            <span class="log-mode-toggle__stack d-flex flex-column align-center font-weight-bold text-caption py-1">
              <span>{{ headMode ? 'End' : 'Start' }}</span>
              <span>Truncated</span>
            </span>
            <v-tooltip activator="parent">{{ headModeTitle }}</v-tooltip>
          </v-btn>
        </template>
        {{ $options.truncationMessages.end }}
      </v-alert>
    </v-defaults-provider>
    <v-btn
      v-if="logs.length"
      position="fixed"
      location="bottom right"
      class="ma-5"
      @click="scrollToTop"
      :icon="$options.icons.mdiMouseMoveUp"
      data-cy="log-scroll-top"
    />
    <!-- a div to use for autoscrolling -->
    <div ref="autoScrollEnd"></div>
  </div>
</template>

<script>
import { useTemplateRef, watch, onBeforeUnmount, nextTick } from 'vue'
import { useScroll, useVModel, whenever } from '@vueuse/core'
import { when } from '@/utils/reactivity'
import {
  mdiInvoiceTextOutline,
  mdiMouseMoveUp,
} from '@mdi/js'

export default {
  name: 'LogComponent',

  props: {
    placeholder: {
      type: String,
      required: false,
    },
    timestamps: {
      type: Boolean,
      required: false,
      default: true,
    },
    logs: {
      type: Array,
      required: true,
    },
    wordWrap: {
      type: Boolean,
      required: false,
      default: false,
    },
    autoScroll: {
      type: Boolean,
      required: false,
      default: true,
    },
    /** Whether the start of the file has been truncated (earlier lines omitted). */
    truncatedStart: {
      type: Boolean,
      required: false,
      default: false,
    },
    /** Whether the end of the file has been truncated (later lines omitted). */
    truncatedEnd: {
      type: Boolean,
      required: false,
      default: false,
    },
    /** Whether the log is in HEAD (start) mode - used by the prototype toggle
     * in the truncation banner. */
    headMode: {
      type: Boolean,
      required: false,
      default: false,
    },
    /** Tooltip text for the prototype HEAD/TAIL toggle in the banner. */
    headModeTitle: {
      type: String,
      required: false,
      default: '',
    },
  },

  emits: [
    'update:autoScroll',
    'update:headMode',
  ],

  setup (props, { emit }) {
    const logText = useTemplateRef('logText')
    const scrollWrapper = useTemplateRef('scrollWrapper')
    const autoScrollEndRef = useTemplateRef('autoScrollEnd')

    const autoScroll = useVModel(props, 'autoScroll', emit)
    const { arrivedState, directions } = useScroll(scrollWrapper)

    // Turn on autoscroll when user scrolls to bottom:
    whenever(() => arrivedState.bottom && !arrivedState.top, () => {
      // (when page first loads both top and bottom are true)
      autoScroll.value = true
    })
    // Turn off autoscroll when user scrolls up:
    whenever(() => props.logs.length && directions.top, () => {
      autoScroll.value = false
    })

    function scrollToEnd () {
      autoScrollEndRef.value?.scrollIntoView({ behavior: 'smooth' })
    }

    async function scrollToTop () {
      autoScroll.value = false
      // Wait for smooth scroll cancel to happen
      await nextTick()
      scrollWrapper.value?.scroll({ top: 0, left: 0, behavior: 'smooth' })
    }

    const ro = new ResizeObserver(scrollToEnd)

    when(logText, () => {
      watch(
        autoScroll,
        (val) => {
          if (val) {
            scrollToEnd()
            ro.observe(logText.value)
          } else {
            // When autoscroll is turned off, cancel any smooth scroll in progress:
            scrollWrapper.value.scrollBy(0, 0)
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
      scrollToTop,
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
    },
  },

  // Misc options
  icons: {
    mdiInvoiceTextOutline,
    mdiMouseMoveUp,
  },

  // Warning messages shown when the log file has been truncated
  truncationMessages: {
    start: 'earlier lines omitted (file truncated)',
    end: 'later lines omitted (file truncated)',
  },
}

</script>
