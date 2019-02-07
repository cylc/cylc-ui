# Google Analytics

The first version of this project had a Google Analytics example. This was
removed later (see GitHub issue #14).

But in case any user wants it back, or in case there is another piece of code
that a user would like to use, that is similar to what Google Analytics look
like (e.g. New Relic for monitoring), here's what was changed.

## Router

The router, which in some Vue.js application is located in `router.js`, actually
had its own folder `router/` with an `index.js` and a `paths.js`.

In the `index.js`, this code was present.

```vuejs
import VueAnalytics from 'vue-analytics'
...
// Bootstrap Analytics
// Set in .env
// https://github.com/MatteoGabriele/vue-analytics
if (process.env.GOOGLE_ANALYTICS) {
  Vue.use(VueAnalytics, {
    id: process.env.GOOGLE_ANALYTICS,
    router,
    autoTracking: {
      page: process.env.NODE_ENV !== 'development'
    }
  })
}
```

## package.json

In `devDependencies`, in our `package.json`, we had the following entry:

```js
"devDependencies": {
  "vue-analytics": "^5.16.2",
}
```

## Final note

Hopefully this will give some basis for investigating how to add back Google
Analytics, or how to add some other external JS code.
