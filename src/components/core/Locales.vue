<!-- From https://github.com/vuetifyjs/vuetify/blob/master/packages/docs/src/components/core/Locales.vue -->
<template>
  <v-menu
    bottom
    left
    offset-y
  >
    <v-btn
      slot="activator"
      aria-label="Translations"
      flat
      style="min-width: 48px"
    >
      <flag
        v-if="currentLanguage"
        :iso="currentLanguage.country"
        :squared="false"
      />
    </v-btn>
    <v-list
      dense
      light
    >
      <v-list-tile
        v-for="language in languages"
        :key="language.locale"
        avatar
        @click="translateI18n(language.locale)"
      >
        <v-list-tile-avatar
          tile
          size="24px"
        >
          <flag
            :iso="language.country"
            :squared="false"
          />
        </v-list-tile-avatar>
        <v-list-tile-title v-text="language.name"/>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
// Utilities
import languages from '@/i18n/languages.json'

export default {
  data: () => ({
    languages
  }),
  computed: {
    currentLanguage () {
      return this.languages.find(l => l.locale === this.$i18n.locale)
    }
  },
  methods: {
    translateI18n (lang) {
      this.$i18n.locale = lang
    }
  }
}
</script>
