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
    <!-- Renders here for start truncation, moved below the log for end truncation -->
    <Teleport
      v-if="endTarget && (truncatedStart || truncatedEnd)"
      :to="endTarget"
      :disabled="!truncatedEnd"
    >
      <button
        type="button"
        class="log-truncation"
        :class="`log-truncation--${truncationPosition}`"
        :data-cy="`log-truncation-${truncationPosition}`"
        @click="$emit('update:headMode', !truncatedEnd)"
      >
        <v-icon :icon="$options.icons.mdiReload" aria-hidden="true" />
        <span>{{ truncationMessages[truncationPosition] }}</span>
      </button>
    </Teleport>

    <pre
      ref="logText"
      :class="wordWrap ? 'text-pre-wrap text-break' : 'text-pre'"
      data-cy="log-text"
    ><span
    v-for="(log, index) in computedLogs"
    :key="index"
    >{{ log }}</span></pre>

    <div ref="endTarget"></div>

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
  mdiMouseMoveUp,
  mdiReload,
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
    /** Whether the start of the file has been truncated (earlier lines omitted).
     * It's is not completely reliable, it actually states we are in tail from end mode,
     * and the file is over max_lines in length.  However, a viewer left open from
     * before the file reached max_lines would get true here once the file reaches
     * max_lines in length, even if the first lines are still displayed.
    */
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
    maxLines: {
      type: Number,
      required: false,
      default: 5000,
    },
    /** Whether the log is in HEAD (start) mode. Part of the `headMode`
     * two-way binding whose update is emitted by the truncation banner
     * "Load start"/"Load end" buttons. */
    headMode: {
      type: Boolean,
      required: false,
      default: false,
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
    const endTarget = useTemplateRef('endTarget')

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
      endTarget,
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

    truncationPosition () {
      return this.truncatedEnd ? 'end' : 'start'
    },

    truncationMessages () {
      return {
        start: `The file is over ${this.maxLines} lines and may have been truncated. Click to view from the top`,
        end: 'The end of the file has been truncated. Click to view from the bottom',
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
    mdiMouseMoveUp,
    mdiReload,
  },
}

</script>

<style scoped>
.log-truncation {
  --banner-background: #eceff1;
  --size: 16px;
  --angle: 90deg;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  margin: 1rem 0 0 0;
  padding: 0.5rem 1rem 1rem 1rem;
  border: 0;
  background: linear-gradient(var(--fade-direction), var(--banner-background) 20%, #fff 95%);
  color: #263238;
  font: inherit;
  text-align: center;
  cursor: pointer;
}

.log-truncation:hover {
  --banner-background: #dce2e5;
}

.log-truncation:focus-visible {
  outline: 3px solid currentColor;
  outline-offset: 3px;
}

.log-truncation::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  height: calc(var(--size) / 2);
  background: var(--banner-background);
  pointer-events: none;
  mask:
    conic-gradient(
      from calc(var(--angle) / -2) at bottom,
      #0000,
      #000 1deg calc(var(--angle) - 1deg),
      #0000 var(--angle)
    ) 50% / var(--size) 100%;
}

.log-truncation--start {
  --fade-direction: to bottom;
}

.log-truncation--end {
  --fade-direction: to top;
}

.log-truncation--start::after {
  bottom: 100%;
  transform: rotate(180deg);
}

.log-truncation--end::after {
  top: 100%;
}
</style>
