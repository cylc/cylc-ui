<template>
  <v-list-tile-action-text class="pt-3 pb-3 c-header">
    <v-layout align-center justify-center row wrap fill-height>
      <div class="mb-2">
        <svg version="1.1" preserveAspectRatio="xMinYMin meet" width="100%" height="100%" viewBox="0 0 655 260" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(292.53 -49.505)">
            <g>
              <circle transform="scale(-1,1)" cx="-135.7" cy="248.39" r="27.743" fill="#818181"/>
              <circle cx="201.05" cy="216.65" r="72.857" fill="#676767" fill-rule="evenodd"/>
              <circle cx="167.35" cy="136.32" r="37.379" fill="#888"/>
              <circle cx="292.32" cy="121.63" r="49.8" fill="#a4a4a4"/>
              <g fill="#4a4a4a">
                <path d="m-239.15 150.44q5.28 0 17.92 1.92l3.84 0.48-0.48 9.76q-12.8-1.44-18.88-1.44-13.6 0-18.56 6.56-4.8 6.4-4.8 24 0 17.44 4.48 24.32 4.64 6.88 19.04 6.88l18.88-1.44 0.48 9.92q-14.88 2.24-22.24 2.24-18.72 0-25.92-9.6-7.04-9.6-7.04-32.32 0-22.88 7.68-32 7.68-9.28 25.6-9.28z"/>
                <path d="m-175.59 152.04h12l20 69.6h5.28l20.16-69.6h12l-33.28 115.52h-12l10.4-35.52h-11.84z"/>
                <path d="m-58.613 232.04v-114.88h12v114.88z"/>
                <path d="m34.535 150.44q5.28 0 17.92 1.92l3.84 0.48-0.48 9.76q-12.8-1.44-18.88-1.44-13.6 0-18.56 6.56-4.8 6.4-4.8 24 0 17.44 4.48 24.32 4.64 6.88 19.04 6.88l18.88-1.44 0.48 9.92q-14.88 2.24-22.24 2.24-18.72 0-25.92-9.6-7.04-9.6-7.04-32.32 0-22.88 7.68-32 7.68-9.28 25.6-9.28z"/>
              </g>
            </g>
          </g>
        </svg>
      </div>
      <div class="c-environment-info">
        <v-chip outline color="grey lighten-1" text-color="grey darken-4">{{ user }}</v-chip>
        <span class="at">@</span>
        <v-chip outline color="grey lighten-1" text-color="grey darken-4">{{ environment }}</v-chip>
      </div>
    </v-layout>
  </v-list-tile-action-text>
</template>

<script>
export default {
  name: 'Header',
  props: {
    user: {
      type: String,
      default: 'guest'
    },
    environment: {
      type: String,
      default: 'development'
    }
  }
}
</script>
