<!--
  Job - The job status icon implemented as an inline-block level object
        which can sit in text.
-->

<template>
  <span class="job_theme--normal">
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
      viewBox="0 0 100 100"
    >
      <!-- the job status icon
           * let width = 100 - x - stroke-width
           * let height = 100 - y - stroke-width
      -->
      <rect
        v-bind:class="[status]"
        x="10" y="10"
        width="80" height="80"
        rx="20" ry="20"
        stroke-width="10"
      />
    </svg>
  </span>
  </span>
</template>

<style lang="scss">
  .c-job {
    svg.job {
      /* scale the icon to the font-size */
      width: 1em;
      height: 1em;
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
