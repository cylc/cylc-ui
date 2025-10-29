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
    :class="[task.state, modifier]"
  >
    <!-- status

      Represents the task status, e.g. waiting, running, succeeded.
    -->
    <g class="status">
      <!-- outline

        The circle outline of the task icon.

        NOTE: If changing the radius or stroke of the circle then the values
        in getModifierTransform must be updated.
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
      <g transform="rotate(-90, 50, 50)">
        <circle
          class="progress"
          cx="50"
          cy="50"
          r="16"
          stroke-width="50"
          stroke-dasharray="157"
          :style="runningStyle"
        />
      </g>
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
      <path class="cross"
        d="
          m30,30
          l40 40
          m0,-40
          l-40 40
        "
      />

      <!-- expired

      A clock face, at about 5pm.
      -->
      <path
        class="clockhands_big"
        d="
          m50,12
          l0 38
          l18 18
        "
      />
    </g>

    <!-- modifier

      Represents any task state modifiers e.g. isHeld, isRunahead, isQueued.

      It is positioned above and to the left of the ".status". When used in the
      "Task" component this overflows the 100x100 box (i.e. like superscript
      text).
    -->
    <g
      class="modifier"
      :transform="modifierTransform"
    >
      <!-- modifier

        The circle outline of the modifier which is displayed for some modifier
        states.

        NOTE: If changing the radius or stroke of the circle then the values
        in getModifierTransform must be updated to match.
      -->
      <circle
        class="outline"
        cx="50"
        cy="50"
        r="40"
        stroke-width="10"
      />
      <!-- held

        Paused icon representing isHeld. Shown inside the outline
        circle.
      -->
      <g
        class="held"
      >
        <path
          d="
            m37,33
            l0 34
            m25,0
            l0, -34
          "
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

      <!-- Run Mode is Skip

        Fast-forward icon representing skip-mode
      -->
      <g
        class="skip"
      >
        <path class="skip"
          d="M 5 15 v 70 l 43 -35 M 50 15 v 70 l 43 -35"
        />
      </g>

      <!-- queued

        Burger bar-like icon representing isQueued.
      -->
      <g
        class="queued"
      >
        <path
          d="
            m28,28
            l43 0
            m-43,21
            l43, 0
            m-43,21
            l43 0
          "
        />
      </g>

      <!-- xtriggered

        Radio signal (similar to RSS logo) representing waiting on xtrigger(s).
      -->
      <g class="xtriggered">
        <path
          d="
            m10,70
            a60, 60, 0, 0, 1, 60, -60
            m-40, 60
            a40, 40 0, 0, 1, 40, -40
            m-6, 27
            a9,9, 0, 1, 0, .1, 0
            m0, 4
            a6,6, 0, 1, 0, .1, 0
          "
        />
      </g>

      <!-- Retry

        Circular arrow representing a retry.
      -->
       <g class="retry">
        <!-- An arc describing the arrow -->
        <path d="m25, 50 a30 30 1 1 1 25 30 "/>
        <!-- The arrowhead -->
        <polygon points="0,40 26,75 52,40, 25,46"/>
      </g>

      <!-- Wallclock

        A clock face representing an unsatisfied wallclock trigger.

        The path is just the hands of the clock. The icon is created in
        combination with the outline circle.
      -->
      <g class="wallclock">
        <path
          d="
            m50, 18
            l0, 36
            l14, 14
            l3,3
            l3,-3
            l-18, -18
          "
        />
      </g>
    </g>
  </g>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import TaskState from '@/model/TaskState.model'

const props = defineProps({
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
})

/**
 * @type {import('vue').Ref<number>}
 * @see @/components/cylc/workspace/Widget.vue
 */
const animResetTime = inject('animResetTime', () => ref(0), true)

// Get modifier (if any) for the task state.
const modifier = computed(() => {
  if (props.task.isHeld) return 'held'
  if (props.task.isRunahead) return 'runahead'
  if (props.task.runtime?.runMode === 'Skip') return 'skip'
  if (props.task.isQueued) return 'queued'
  if (props.task.isRetry) return 'retry'
  if (props.task.isWallclock) return 'wallclock'
  if (props.task.isXtriggered) return 'xtriggered'
  return ''
})

const runningStyle = computed(() => {
  if (
    props.task.state === TaskState.RUNNING.name &&
    props.startTime &&
    props.task.task?.meanElapsedTime
  ) {
    // current time in ms (UTC); updates whenever widget is unhidden
    const now = Math.max(Date.now(), animResetTime.value)
    // job elapsed time in ms
    const elapsedTime = now - Date.parse(props.startTime)
    return {
      animationDuration: `${props.task.task.meanElapsedTime}s`,
      animationDelay: `-${elapsedTime}ms`,
      animationFillMode: 'forwards',
    }
  }
  return {}
})

/**
 * Returns the translation required to position the ".modifier" nicely in
 * relation to the ".status".
 *
 * Both ".status" and ".modifier" are centered at (50, 50), we need to
 * move ".modifier" up and to the left so that the two don't touch and
 * have a sensible gap between them.
 */
function _getModifierTransform () {
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
    (35.35 * props.modifierSize) +
    // (2) the x/y translation to the edge of ".status"
    42.42
  )
  return `
    scale(${props.modifierSize}, ${props.modifierSize})
    translate(${translation}, ${translation})
  `
}

// Doesn't need to be reactive:
const modifierTransform = _getModifierTransform()
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
      .cross path {
        fill: none;
        stroke: none;
      }
      .clockhands_big {
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
      .runahead circle {
        fill: none;
        stroke: none;
      }
      .skip{
        fill: none;
        stroke: none;
      }
      .queued rect {
        fill: none;
        stroke: none;
      }
      .wallclock {
        fill: none;
        stroke: none;
      }
      .xtriggered {
        fill: none;
        stroke: none;
      }
      .retry {
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
      .cross {
        stroke: $background;
        stroke-width: 14px;
        stroke-linecap: round;
      }
    }

    &.submit-failed .status {
      .outline {
        fill: $background;
      }
      .cross {
        stroke: $foreground;
        stroke-width: 14px;
        stroke-linecap: round;
      }
    }

    &.expired .status {
      .outline {
        fill: $foreground;
      }
      .dot {
        fill: $background;
      }
      .clockhands_big {
        stroke: $background;
        stroke-width: 8px;
        stroke-linecap: round;
      }
    }

    &.held .modifier {
      .outline {
        stroke: $foreground;
      }
      .held path {
        stroke: $foreground;
        stroke-linecap: round;
        stroke-width: 16px;
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

    &.skip .modifier {
      .skip path {
        stroke: $background;
        fill: $foreground;
        stroke-width: 0px;
      }
    }

    &.queued .modifier {
      .queued path {
        stroke: $foreground;
        stroke-linecap: round;
        stroke-width: 16px;
      }
    }

    &.xtriggered .modifier {
      .xtriggered {
        stroke: $foreground;
        stroke-width: 12px;
        stroke-linecap: round;
        fill: none;
      }
    }

    &.wallclock .modifier {
      .outline {
        fill: $background;
        stroke: $foreground;
        stroke-width: 7px;
      }
      .wallclock {
        stroke: $foreground;
        stroke-width: 8px;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    }

    &.retry .modifier {
      .retry path {
        stroke: $foreground;
        stroke-width: 12px;
        stroke-linecap: round;
      }
      .retry polygon {
        stroke: none;
        fill: $foreground;
      }
    }

    &.running .progress {
      animation-name: c8-task-progress-animation;
      animation-timing-function: steps(50);
      animation-iteration-count: 1;
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
