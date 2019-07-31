// From: https://medium.com/@paul.allies/stateless-auth-with-express-passport-jwt-7a55ffae0a5c

// express stuff
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// jwt stuff
const jwt = require('jsonwebtoken')

// passport stuff
const passport = require('passport')
const jwtStrategy = require('./jwt_strategy')
passport.use(jwtStrategy)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('hello express server')
})

app.post('/login', (req, res) => {
  let { email, password } = req.body
  // This lookup would normally be done using a database
  if (email === 'me@cylc.org') {
    if (password === 'pass') { // the password compare would normally be done using bcrypt.
      const opts = {}
      opts.expiresIn = 120 // token expires in 2min
      const secret = 'SECRET_KEY' // normally stored in process.env.secret
      const token = jwt.sign({ email }, secret, opts)
      return res.status(200).json({
        message: 'Auth Passed',
        token
      })
    }
  }
  return res.status(401).json({ message: 'Auth Failed' })
})

app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.status(200).send('YAY! this is a protected Route')
})

app.listen(3000)
