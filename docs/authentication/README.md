# Authentication

There are many options for authentication. Token, sessions, HTTP basic, etc.
Each has its own advantages and disadvantages. But given that Cylc can be
used in sites where one approach if preferred over other, whether for security
reasons, or simply because there is already one option in place, providing
the authentication flavour as an option to the user sounds like a good idea.

In the same folder as this document, there should be some code. This code
can be used in conjunction with the text in the next sections to test each
approach. These examples are all written in Node.js with
[Express](https://expressjs.com/) and [Passport](http://www.passportjs.org/).

Please note that the version of these framework/libraries may be outdated, as
they are merely examples, but not part of the final product of this project.

## JWT

First you will need to start the server in one terminal.

```bash
$ cd jwt
$ npm install
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN cylc-ui-jwt@1.0.0 No description
npm WARN cylc-ui-jwt@1.0.0 No repository field.

removed 68 packages in 2.102s
found 0 vulnerabilities
$ node index.js
```

After this you should be able to browse [http://localhost:3000/](http://localhost:3000/).

```bash
$ curl -X GET http://localhost:3000
hello express server
$ curl -I -X GET http://localhost:3000
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 20
ETag: W/"14-UYwTOzeZoEQ545iTjDtFKolVyNw"
Date: Mon, 04 Feb 2019 23:53:42 GMT
Connection: keep-alive
```

Then in another terminal you should be able to request a JWT token.

```bash
$ curl -d {\"email\":\"me@cylc.org\"\,\"password\":\"pass\"} -H "Content-Type: application/json" -X POST "http://localhost:3000/login"
{"message":"Auth Passed","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lQGN5bGMub3JnIiwiaWF0IjoxNTQ5MzI0MDMzLCJleHAiOjE1NDkzMjQxNTN9.lP-4HHLPJWox_nDT9WqX9b7Jvc_8iksZDCiM1e2fd_g"}
```

The `/protected` route is not accessible without the token.

```bash
$ curl -X GET http://localhost:3000/protected
Unauthorized
```

But using the token, you should be able to access the protected route with no issues.

```bash
$ curl -X GET -H 'Accept: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lQGN5bGMub3JnIiwiaWF0IjoxNTQ5MzI0OTgxLCJleHAiOjE1NDkzMjUxMDF9.2XZx39QeIKyhP8LVyO0E58HBZdKhYQfAUjy0XG_8bew" http://localhost:3000/protected
YAY! this is a protected Route
```


