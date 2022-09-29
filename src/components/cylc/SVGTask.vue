<template>
  <g
    class="c8-task"
    :class="{
      waiting: task.status === 'waiting',
      preparing: task.status === 'preparing',
      submitted: task.status === 'submitted',
      running: task.status === 'running',
      succeeded: task.status === 'succeeded',
      failed: task.status === 'failed',
      'submit-failed': task.status === 'submit-failed',
      expired: task.status === 'expired',
      held: task.isHeld,
      queued: task.isQueued && !task.isHeld,
      runahead: task.isRunahead && !(task.isHeld || task.isQueued),
    }"
  >
    <g class="status">
      <circle
        class="outline"
        cx="55"
        cy="55"
        r="40"
        stroke-width="10"
      />
      <!-- TODO: this progress needs re-calibration -->
      <circle
        class="progress"
        cx="45"
        cy="55"
        r="20"
        stroke-width="50"
        stroke-dasharray="157"
        :style="getRunningStyle()"
      />
      <circle
        class="dot"
        cx="55"
        cy="55"
        r="7"
      />
      <circle
        class="hub"
        cx="55"
        cy="55"
        r="13"
      />
      <g class="cross">
        <rect
          x="52.5"
          y="22.5"
          width="10"
          height="55"
          transform="rotate(45, 50, 50)"
          rx="5"
          ry="5"
        />
        <rect
          x="45"
          y="30"
          width="10"
          height="55"
          transform="rotate(-45, 50, 50)"
          rx="5"
          ry="5"
        />
      </g>
    </g>
    <g class="modifier">
      <circle
        class="outline"
        cx="13.5"
        cy="13.5"
        r="11.5"
        stroke-width="3"
      />
      <g
        class="held"
      >
        <rect
          x="8"
          y="6"
          width="5"
          height="15"
          rx="2.5"
          ry="2.5"
        />
        <rect
          x="14"
          y="6"
          width="5"
          height="15"
          rx="2.5"
          ry="2.5"
        />
      </g>
      <g
        class="queued"
      >
        <rect
          x="6"
          y="6"
          width="15"
          height="4"
          rx="2.5"
          ry="2.5"
        />
        <rect
          x="6"
          y="11.5"
          width="15"
          height="4"
          rx="2.5"
          ry="2.5"
        />
        <rect
          x="6"
          y="17"
          width="15"
          height="4"
          rx="2.5"
          ry="2.5"
        />
      </g>
      <g
        class="runahead"
      >
        <circle
          cx="13.5"
          cy="13.5"
          r="5"
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
    }
  },
  methods: {
    getRunningStyle () {
      if (
        this.task.status === TaskState.RUNNING.name &&
        this.task.startTime &&
        this.task.estimatedDuration
      ) {
        const startTime = Date.parse(this.task.startTime)
        const now = Date.now()
        const elapsedTime = ((now - startTime) / 1000)
        const ret = `
          animation-name: c8-task-progress-animation;
          animation-timing-function: steps(50);
          animation-iteration-count: 1;
          animation-duration: ${this.task.estimatedDuration}s;
          animation-delay: -${elapsedTime}s;
          animation-fill-mode: forwards;
        `
        console.log(ret)
        return ret.replace('\n', ' ')
      }
      return ''
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
        fill: none;
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
