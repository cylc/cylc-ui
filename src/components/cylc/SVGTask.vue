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

<!-- SVG task icon
  This SVG component is designed to sit within a 100x100 box with
  "task modifiers increasing this to 130x130 (consider modifiers like
  superscript or unicode modifiers)
-->

<template>
  <g
    class="c8-task"
    :class="{
      waiting: task.state === 'waiting',
      preparing: task.state === 'preparing',
      submitted: task.state === 'submitted',
      running: task.state === 'running',
      succeeded: task.state === 'succeeded',
      failed: task.state === 'failed',
      'submit-failed': task.state === 'submit-failed',
      expired: task.state === 'expired',
      held: task.isHeld,
      queued: task.isQueued && !task.isHeld,
      runahead: task.isRunahead && !(task.isHeld || task.isQueued),
    }"
  >
    <!--rect x="0" y="0" width="130" height="130" stroke-width="5" style="stroke: red; fill: none;" /-->
    <!--rect x="0" y="0" width="100" height="100" style="fill: rgb(240, 200, 200);" /-->
    <g class="status">
      <circle
        class="outline"
        cx="50"
        cy="50"
        r="45"
        stroke-width="10"
      />
      <!-- TODO: this progress needs re-calibration -->
      <circle
        class="progress"
        cx="50"
        cy="50"
        r="20"
        stroke-width="50"
        stroke-dasharray="157"
        :style="getRunningStyle()"
      />
      <circle
        class="dot"
        cx="50"
        cy="50"
        r="7"
      />
      <circle
        class="hub"
        cx="50"
        cy="50"
        r="16"
      />
      <g
        class="cross"
        transform="rotate(45, 50, 50)"
      >
        <rect
          x="43"
          y="15"
          width="14"
          height="70"
          rx="7.5"
          ry="7.5"
        />
        <rect
          x="15"
          y="43"
          width="70"
          height="14"
          rx="7.5"
          ry="7.5"
        />
      </g>
    </g>
    <g
      class="modifier"
      :transform="getModiferTransform()"
    >
      <circle
        class="outline"
        cx="50"
        cy="50"
        r="40"
        stroke-width="10"
      />
      <g
        class="held"
      >
        <rect
          x="30"
          y="25"
          width="16"
          height="50"
          rx="10"
          ry="10"
        />
        <rect
          x="54"
          y="25"
          width="16"
          height="50"
          rx="10"
          ry="10"
        />
      </g>
      <g
        class="queued"
      >
        <rect
          x="28.75"
          y="24.5"
          width="42.5"
          height="15"
          rx="10"
          ry="10"
        />
        <rect
          x="28.75"
          y="42.5"
          width="42.5"
          height="15"
          rx="10"
          ry="10"
        />
        <rect
          x="28.75"
          y="60.5"
          width="42.5"
          height="15"
          rx="10"
          ry="10"
        />
      </g>
      <g
        class="runahead"
      >
        <circle
          cx="50"
          cy="50"
          r="20"
        />
      </g>
    </g>
  </g>
</template>

<script>
import TaskState from '@/model/TaskState.model'

export default {
  name: 'SVGTask',
  props: {
    task: {
      required: true
    },
    startTime: {
      // TODO: aim to remove this in due course
      // (we should be able to obtain this directly from the task)
      required: false
    },
    modifierSize: {
      type: Number,
      default: 0.6
    }
  },
  methods: {
    getRunningStyle () {
      if (
        this.task.state === TaskState.RUNNING.name &&
        this.startTime &&
        this.task.meanElapsedTime
      ) {
        const startTime = Date.parse(this.startTime)
        const now = Date.now()
        const elapsedTime = ((now - startTime) / 1000)
        const ret = `
          animation-name: c8-task-progress-animation;
          animation-timing-function: steps(50);
          animation-iteration-count: 1;
          animation-duration: ${this.task.meanElapsedTime}s;
          animation-delay: -${elapsedTime}s;
          animation-fill-mode: forwards;
        `
        console.log(ret)
        return ret.replace('\n', ' ')
      }
      return ''
    },
    getModiferTransform () {
      const translation = (this.modifierSize * -100) - 5
      return `
        scale(${this.modifierSize}, ${this.modifierSize})
        translate(${translation}, ${translation})
      `
    }
  }
}
</script>

<style lang="scss">
  $foreground: rgb(90,90,90);
  $background: rgb(255,255,255);

  .c8-task {
    .status {
      .outline {
        // NOTE: ensure the outline is filled so that it can be clicked
        fill: $background;
        stroke: $foreground;
      }
      .progress {
        fill: transparent;
        stroke: $foreground;
        transform-origin: 50% 50%;
        transform: rotate(-90deg);
        opacity: 0.4;
        /* 0% progress */
        stroke-dashoffset: 157;
      }
      .dot {
        fill: none;
        stroke: none;
      }
      .hub {
        fill: none;
        stroke: none;
      }
      .cross rect {
        fill: none;
        stroke: none;
      }
    }
    .modifier {
      .outline {
        fill: none;
        stroke: none;
      }
      .held rect {
        fill: none;
        stroke: none;
      }
      .queued rect {
        fill: none;
        stroke: none;
      }
      .runahead circle {
        fill: none;
        stroke: none;
      }
    }

    &.preparing .status .dot {
      fill: $foreground;
    }

    &.submitted .status .dot {
      fill: $foreground;
    }

    &.running .status .hub {
      fill: $foreground;
    }

    &.succeeded .status .outline {
      fill: $foreground;
    }

    &.failed .status {
      .outline {
        fill: $foreground;
      }
      .cross rect {
        fill: $background;
      }
    }

    &.submit-failed .status {
      .outline {
        fill: $background;
      }
      .cross rect {
        fill: $foreground;
      }
    }

    &.held .modifier {
      .outline {
        stroke: $foreground;
      }
      .held rect {
        fill: $foreground;
      }
    }

    &.queued .modifier {
      .outline {
        stroke: $foreground;
      }
      .queued rect {
        fill: $foreground;
      }
    }

    &.runahead .modifier {
      .outline {
        stroke: $foreground;
      }
      .runahead circle {
        fill: $foreground;
      }
    }
  }

  /* TODO: expired task state */

  @keyframes c8-task-progress-animation {
    from {
      /* 0% progress */
      stroke-dashoffset: 150;

    }
    to {
      /* 100% progress */
      stroke-dashoffset: 0;
    }
  }
</style>
