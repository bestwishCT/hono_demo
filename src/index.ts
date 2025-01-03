import { Hono } from 'hono'
// import { basicAuth } from 'hono/basic-auth'
import { bearerAuth } from 'hono/bearer-auth'
import { prettyJSON } from 'hono/pretty-json'
import api from './api'
import { Bindings } from './bindings'
import { jwt } from 'hono/jwt'

const app = new Hono()
const token = 'honoiscool'
app.get('/', (c) => c.text('Pretty Hono Demo Web API'))
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

const middleware = new Hono<{ Bindings: Bindings }>()
middleware.use('*', prettyJSON())
// Bearer Auth Middleware
// middleware.use('/employee/*', bearerAuth({ token }))
//jwt鉴权
middleware.use('/auth/*',
  jwt({
    secret: 'mySecretKey',
  }))
app.route('/api', middleware)
app.route('/api', api)

export default app