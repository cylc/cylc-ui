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
              <h3 class="headline mb-0">Page not found</h3>
            </div>
          </v-card-title>
          <v-card-text>
            Maybe the page you are looking for has been removed, or you typed in the wrong address
          </v-card-text>
          <v-card-actions>
            <button @click="$router.go(-1)" class="v-btn success">Go Back</button>
            <router-link to="/dashboard" tag="button" class="white--text success v-btn">Go to Homepage</router-link>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    metaInfo () {
      return {
        title: 'Cylc UI | Not Found'
      }
    }
  }
</script>
