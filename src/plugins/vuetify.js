import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import '@mdi/font/css/materialdesignicons.css'

// If modifying theme colors, check the colors from the theme bundle first, and use them if possible
// import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

export default new Vuetify({
  theme: { disable: true },
  icons: {
    iconfont: 'mdi'
  }
})
