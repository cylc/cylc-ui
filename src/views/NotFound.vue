<template>
  <v-container
      fill-height
      fluid>
    <v-layout
        align-center
        justify-center>
      <v-flex
          xs12
          sm8
          md4>
        <v-card>
          <v-card-title primary-title>
            <div>
              <h3 class="headline mb-0">{{ $t('NotFound.title') }}</h3>
            </div>
          </v-card-title>
          <v-card-text>
            {{ $t('NotFound.message') }}
          </v-card-text>
          <v-card-actions>
            <button @click="$router.go(-1)" class="v-btn success">{{ $t('NotFound.goBack') }}</button>
            <router-link to="/dashboard" tag="button" class="white--text success v-btn">{{ $t('NotFound.toHomepage') }}</router-link>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mixin } from '@/mixins/index'

export default {
  mixins: [mixin],
  metaInfo () {
    return {
      title: this.getPageTitle('App.notFound')
    }
  }
}
</script>
