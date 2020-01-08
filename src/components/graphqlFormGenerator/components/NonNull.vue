<template>
  <div>
    NON_NULL:
    label({{label}}), value({{value}})
    <!--PassProps
      :label="label"
      :value="value"
    -->
      <slot
      />
    <!--/PassProps-->
  </div>
</template>

<script>
import PassProps from 'vue-pass-props'

export default {
  props: {
    'value': {
      required: true
    },
    'label': {
      type: String,
      required: true
    }
  },
  components: {
    PassProps
  }
}
</script>
