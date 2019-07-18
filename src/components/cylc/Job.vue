<!--
  Job - The job status icon implemented as an inline-block level object
        which can sit in text.
-->

<template>
  <span
    class="c-job"
    style="display:inline-block; vertical-align:middle"
  >
    <!-- the task icon SVG
           * comments prefixed `let` are instructions for changing style
           * contain in a 100x100 viewBox so pixels and percent are equal
           * bind the job status here, respond to styling in the CSS
    -->
    <svg
      class="job"
      v-bind:class="[status]"
      viewBox="0 0 100 100"
    >
      <!-- the job status icon
           * let width = 100 - x - stroke-width
           * let height = 100 - y - stroke-width
      -->
      <rect
        x="10" y="10"
        width="80" height="80"
        rx="20" ry="20"
        stroke-width="10"
      />
    </svg>
  </span>
</template>

<style lang="scss">
    .c-job {
        svg.job {
            /* scale the icon to the font-size */
            width: 1em;
            height: 1em;

            rect {
                /* if no job status display nothing */
                fill: transparent;
                stroke: transparent;
            }

            &.submitted rect {
                fill: rgb(125,207,212);
                stroke: rgb(125,207,212);
            }

            &.running rect {
                fill: rgb(106,164,241);
                stroke: rgb(106,164,241);
            }

            &.succeeded rect {
                fill: rgb(81,175,81);
                stroke: rgb(81,175,81);
            }

            &.failed rect {
                fill: rgb(207,72,72);
                stroke: rgb(207,72,72);
            }

            &.submit-failed rect {
                fill: rgb(190,106,192);
                stroke: rgb(190,106,192);
            }
        }
    }
</style>

<script>
export default {
  name: 'Job',
  props: {
    status: {
      type: String,
      required: true
    }
  }
}
</script>
