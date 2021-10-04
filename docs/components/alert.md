# Alert

A component used to display errors in the application.

## Example

::: demo
<alert />

<script>
import Alert from '@/model/Alert.model';
import '~vuetify/src/styles/styles.sass';

export default {
  created () {
    const alert = new Alert('the text', 'mdi-file', 'error');
    this.$store.commit('SET_ALERT', alert);
  }
}
</script>
:::

## Source Code

<SourceCode>
<<< src/components/core/Alert.vue
</SourceCode>
