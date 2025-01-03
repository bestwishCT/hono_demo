import { Hono } from 'hono'
// import { basicAuth } from 'hono/basic-auth'
import { bearerAuth } from 'hono/bearer-auth'
import { prettyJSON } from 'hono/pretty-json'
import api from './api'
import { Bindings } from './bindings'

const app = new Hono()
const token = 'honoiscool'
app.get('/', (c) => c.text('Pretty Hono Demo API'))
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

const middleware = new Hono<{ Bindings: Bindings }>()
middleware.use('*', prettyJSON())
middleware.use('*', bearerAuth({ token }))
app.route('/api', middleware)
app.route('/api', api)

export default app