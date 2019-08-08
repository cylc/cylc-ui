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
      v-bind:class="[status]"
      viewBox="0 0 100 100"
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
      <!-- circle in the middle
             * position in the middle
             * radius can be changed independently
      -->
      <circle
        id="hub"
        cx="50" cy="50"
        r="12">
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
    </svg>
  </span>
</template>

<style lang="scss">
    .c-task {

        $colour: rgb(90,90,90);

        @mixin disk() {
            #outline {
                stroke: $colour;
                fill: $colour;
            }
        }

        @mixin outline() {
            #outline {
                stroke: $colour;
            }
        }

        @mixin hub() {
            #hub {
                fill: $colour;
            }
        }

        @mixin progress() {
            #progress {
                fill: transparent;
                stroke: $colour;
                transform-origin: 50% 50%;
                transform: rotate(-90deg);
                opacity: 0.4;
            }
        }

        @mixin cross() {
            #cross rect {
                fill: $colour;
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
                @include outline();
                @include cross();
            }

            &.submit-failed {
                @include outline();
                @include hub();
                @include cross();
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
    }
  }
}
</script>
