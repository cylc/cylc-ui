<!--
  Task - The task status icon implemented as an inline-block level object
         which can sit in text.
-->

<template>
  <span
    class="c-task"
    style="display:inline-block; vertical-align:middle"
  >
    <!-- the task icon SVG
           * comments prefixed `let` are instructions for changing style
           * contain in a 100x100 viewBox so pixels and percent are equal
           * bind the task status here, respond to styling in the CSS
    -->
    <svg
      class="task"
      v-bind:class="[classes]"
      viewBox="0 0 100 100"
    >
      <!--
        Status indicator - the status portion of the task state.
      -->
      <g
        id="status"
      >
        <!-- progress pie chart:
               * position in the middle
               * let radius = 25% radius
               * let stroke-width = 100% - (2*radius) = 50%
               * let stroke-dasharray ~= 2 * pi * radius
               * use dashes as the line style to turn this into a pie chart
        -->
        <circle
          id="progress"
          cx="50" cy="50"
          r="25"
          stroke-width="50"
          stroke-dasharray="157"
          v-bind:style="progressStyle"
        ></circle>
        <!-- circle in the middle (hub)
               * position in the middle
               * radius can be changed independently
        -->
        <circle
          id="hub"
          cx="50" cy="50"
          r="15">
        </circle>
        <!-- outer circle
               * position in the middle
               * let radius = 50% - (2*stroke-width)
        -->
        <circle
          id="outline"
          cx="50" cy="50"
          r="46"
          stroke-width="8">
        </circle>
        <!-- cross (failure)
               * create a plus and rotate it 45 deg around the origin
               * let rx ~= max(width, height) * 0.1
        -->
        <g
          id="cross"
          transform="rotate(45, 50, 50)"
        >
          <rect
            x=15 y=45
            width="70" height="10"
            rx="7" ry="7"
          ></rect>
          <rect
            x=45 y=15
            width="10" height="70"
            rx="7" ry="7"
          ></rect>
        </g>
      </g>

      <!--
        isHeld - the isHeld portion of the task state.
      -->
      <g
        id="held"
        transform="scale(0.45)"
      >
        <circle
          cx="50" cy="50"
          r="46"
          stroke-width="8"
        ></circle>
        <rect
          x=32.5 y=25
          width="10" height="50"
          rx="5" ry="5"
        ></rect>
        <rect
          x=52.5 y=25
          width="10" height="50"
          rx="5" ry="5"
        ></rect>
      </g>

      <!--
      Unknown status
      -->
      <g
        transform="scale(0.5)"
      >
        <path
          id="question-mark"
          fill="none"
          d="m 101.47,34.062 c -5.45,0.03 -10.653,0.737 -15.282,2.063 -4.699,1.346 -9.126,3.484 -12.876,6.219 -3.238,2.362 -6.333,5.391 -8.687,8.531 -4.159,5.549 -6.461,11.651 -7.063,18.687 -0.04,0.468 -0.07,0.868 -0.062,0.876 0.016,0.016 21.702,2.687 21.812,2.687 0.053,0 0.113,-0.234 0.282,-0.937 1.941,-8.085 5.486,-13.521 10.968,-16.813 4.32,-2.594 9.808,-3.612 15.778,-2.969 2.74,0.295 5.21,0.96 7.38,2 2.71,1.301 5.18,3.361 6.94,5.813 1.54,2.156 2.46,4.584 2.75,7.312 0.08,0.759 0.05,2.48 -0.03,3.219 -0.23,1.826 -0.7,3.378 -1.5,4.969 -0.81,1.597 -1.48,2.514 -2.76,3.812 -2.03,2.077 -5.18,4.829 -10.78,9.407 -3.6,2.944 -6.04,5.156 -8.12,7.343 -4.943,5.179 -7.191,9.069 -8.564,14.719 -0.905,3.72 -1.256,7.55 -1.156,13.19 0.025,1.4 0.062,2.73 0.062,2.97 v 0.43 h 21.598 l 0.03,-2.4 c 0.03,-3.27 0.21,-5.37 0.56,-7.41 0.57,-3.27 1.43,-5 3.94,-7.81 1.6,-1.8 3.7,-3.76 6.93,-6.47 4.77,-3.991 8.11,-6.99 11.26,-10.125 4.91,-4.907 7.46,-8.26 9.28,-12.187 1.43,-3.092 2.22,-6.166 2.46,-9.532 0.06,-0.816 0.07,-3.03 0,-3.968 -0.45,-7.043 -3.1,-13.253 -8.15,-19.032 -0.8,-0.909 -2.78,-2.887 -3.72,-3.718 -4.96,-4.394 -10.69,-7.353 -17.56,-9.094 -4.19,-1.062 -8.23,-1.6 -13.35,-1.75 -0.78,-0.023 -1.59,-0.036 -2.37,-0.032 z m -10.908,103.6 v 22 h 21.998 v -22 z"
        />
      </g>
    </svg>
  </span>
</template>

<style lang="scss">
    .c-task {

        $foreground: rgb(90,90,90);
        $background: rgb(255,255,255);

        @mixin disk() {
            #outline {
                stroke: $foreground;
                fill: $foreground;
            }
        }

        @mixin outline() {
            #outline {
                stroke: $foreground;
            }
        }

        @mixin hub() {
            #hub {
                fill: $foreground;
            }
        }

        @mixin progress() {
            #progress {
                fill: transparent;
                stroke: $foreground;
                transform-origin: 50% 50%;
                transform: rotate(-90deg);
                opacity: 0.4;
            }
        }

        @mixin cross($colour) {
            #cross rect {
                fill: $colour;
            }
        }

        @mixin held() {
            #held {
                circle {
                    stroke: $foreground;
                    fill: $background;
                }
                rect {
                    fill: $foreground;
                }
            }
        }

        @mixin unknown() {
            #question-mark {
              fill: $foreground;
            }
        }

        svg.task {
            /* scale the icon to the font-size */
            width: 1em;
            height: 1em;

            circle, rect {
                /* if no task status display nothing */
                fill: transparent;
                stroke: transparent;
            }

            /* isHeld */
            &.held {
              @include held();
            }

            /* status */
            &.waiting {
                @include outline();
            }

            &.submitted {
                @include outline();
                @include hub();
            }

            &.running {
                @include outline();
                @include hub();
                @include progress();
            }

            &.succeeded {
                @include disk();
            }

            &.failed {
                @include disk();
                @include outline();
                @include cross($background);
            }

            &.submit-failed {
                @include outline();
                @include cross($foreground);
            }

            &.unknown {
              @include outline();
              @include unknown();
            }
        }
    }
</style>

<script>
export default {
  name: 'Task',
  props: {
    status: {
      type: String,
      required: true
    },
    isHeld: {
      type: Boolean,
      require: true
    },
    progress: {
      type: Number,
      required: false,
      default: 0
    }
  },
  computed: {
    progressStyle: function () {
      const progress = 157 - (157 * (this.progress / 100))
      return {
        'stroke-dashoffset': progress
      }
    },
    classes: function () {
      const classes = []
      if (this.isHeld) {
        classes.push('held')
      }
      if (['waiting', 'submitted', 'running', 'succeeded', 'failed', 'submit-failed'].includes(this.status)) {
        classes.push(this.status)
      } else {
        console.error(`Invalid task status: ${this.status}`)
        classes.push('unknown')
      }
      return classes
    }
  }
}
</script>
