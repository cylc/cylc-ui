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
    <!-- status

      Represents the task status, e.g. waiting, running, succeeded.
    -->
    <g class="status">
      <!-- outline

        The circle outline of the task icon.

        NOTE: If changing the radius or stroke of the circle then the values
        in getModiferTransform must be updated.
      -->
      <circle
        class="outline"
        cx="50"
        cy="50"
        r="45"
        stroke-width="10"
      />
      <!-- progress animation

        This circle provides the clockface progress indicator. It uses a CSS
        trick where we set the "stroke" of the circle to a dashed line
        (i.e. - - - -), we animate it by adjusting the "stroke-dashoffset".

        If you change any of these numbers the progress may require
        re-calibration. To do this, disable the animation and manually adjust
        the "stroke-dashoffset" to find the new values for 0% and 100%.
        Then copy these values to the corresponding CSS animation keyframes.
      -->
      <circle
        class="progress"
        cx="50"
        cy="50"
        r="16"
        stroke-width="50"
        stroke-dasharray="157"
        :transform="progressTransform()"
        :style="getRunningStyle()"
      />
      <!-- dot

        A small dot at the centre of the outline used to represent the preparing
        state.
      -->
      <circle
        class="dot"
        cx="50"
        cy="50"
        r="7"
      />
      <!-- hub

        A larger dot at the centre of the outline used to represent the submitted
        state. This is the "hub" at the centre of the progress animation for a
        running task.
      -->
      <circle
        class="hub"
        cx="50"
        cy="50"
        r="16"
      />
      <!-- cross

        The "x" in the centre of the outline used to represent failure.
      -->
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
      <!-- expired

      -->
      <g
        class="expired"
      >
        <rect
          x="50"
          y="46"
          width="42"
          height="8"
          rx="5"
          ry="5"
          transform="rotate(-90, 50, 50)"
        />
        <rect
          x="50"
          y="46"
          width="30"
          height="8"
          rx="5"
          ry="5"
          transform="rotate(45, 50, 50)"
        />
      </g>
    </g>
    <!-- modifier

      Represents any task state modifiers e.g. isHeld, isRunahead, isQueued.

      It is positioned above and to the left of the ".status". When used in the
      "Task" component this overflows the 100x100 box (i.e. like superscript
      text).
    -->
    <g
      class="modifier"
      :transform="getModiferTransform()"
    >
      <!-- modifier

        The circle outline of the modifier which is displayed for some modifier
        states.

        NOTE: If changing the radius or stroke of the circle then the values
        in getModiferTransform must be updated to match.
      -->
      <circle
        class="outline"
        cx="50"
        cy="50"
        r="40"
        stroke-width="10"
      />
      <!-- held

        Paused icon representing isHeld.
      -->
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
      <!-- queued

        Burger bar-like icon representing isQueued.
      -->
      <g
        class="queued"
      >
        <rect
          x="20"
          y="20"
          width="60"
          height="16"
          rx="10"
          ry="10"
        />
        <rect
          x="20"
          y="41"
          width="60"
          height="16"
          rx="10"
          ry="10"
        />
        <rect
          x="20"
          y="62"
          width="60"
          height="16"
          rx="10"
          ry="10"
        />
      </g>
      <!-- runahead

        Dot icon representing isRunahead.
      -->
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
      // The start time as an ISO8601 date-time string in expanded format
      // e.g. 2022-10-26T13:43:45Z
      // TODO: aim to remove this in due course
      // (we should be able to obtain this directly from the task)
      type: String,
      required: false
    },
    modifierSize: {
      // Scale the size of the task state modifier
      type: Number,
      default: 0.7
    },
    coordinateOffset: {
      // You may need to provide this if encorporating this icon into a viewBox
      // otherwise the progress indicator may end up in the wrong place.
      type: Number,
      default: 0
    }
  },
  methods: {
    getRunningStyle () {
      if (
        this.task.state === TaskState.RUNNING.name &&
        this.startTime &&
        this.task.task?.meanElapsedTime
      ) {
        // job start time in ms
        const startTime = Date.parse(this.startTime)
        // current time in ms
        const now = Date.now()
        // job elapsed time in s
        const elapsedTime = ((now - startTime) / 1000)
        const ret = `
          animation-name: c8-task-progress-animation;
          animation-timing-function: steps(50);
          animation-iteration-count: 1;
          animation-duration: ${this.task.task.meanElapsedTime}s;
          animation-delay: -${elapsedTime}s;
          animation-fill-mode: forwards;
        `
        return ret.replace('\n', ' ')
      }
      return ''
    },
    getModiferTransform () {
      // Returns the translation required to position the ".modifier" nicely in
      // relation to the ".status".

      // Both ".status" and ".modifier" are centered at (50, 50), we need to
      // move ".modifier" up and to the left so that the two don't touch and
      // have a sensible gap between them

      // translation = -(
      //   # (1) the x/y translation to the edge of ".modifier"
      //   (
      //     (.modifier.outline.width + .modifier.outline.stroke)
      //     * modifierSize * sin(45)
      //   )
      //   # (2) the x/y translation to the edge of ".status"
      //   (.status.outline.width + .status.outline.stroke) * sin(45)
      // )
      const translation = -(
        // (1) the x/y translation to the edge of ".modifier"
        (35.35 * this.modifierSize) +
        // (2) the x/y translation to the edge of ".status"
        42.42
      )
      return `
        scale(${this.modifierSize}, ${this.modifierSize})
        translate(${translation}, ${translation})
      `
    },
    progressTransform () {
      return `rotate(-90, ${this.coordinateOffset}, ${this.coordinateOffset})`
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
      .expired rect {
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
    &.running .status .progress {
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

    &.expired .status {
      .outline {
        fill: $foreground;
      }
      .dot {
        fill: $background;
      }
      .expired rect {
        fill: $background;
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

  @keyframes c8-task-progress-animation {
    // 157 = 0%
    //  56 = 100%
    from {
      /* 0% progress (plus a couple of percent) */
      stroke-dashoffset: 150;

    }
    to {
      /* 100% progress */
      stroke-dashoffset: 56;
    }
  }
</style>
