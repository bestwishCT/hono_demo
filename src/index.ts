import { Hono } from 'hono'
// import { basicAuth } from 'hono/basic-auth'
import { bearerAuth } from 'hono/bearer-auth'
import { prettyJSON } from 'hono/pretty-json'
import api from './api'
import handler from './handler/handler'
import { Bindings } from './bindings'
import { jwt } from 'hono/jwt'
import { html, raw } from 'hono/html'

const app = new Hono()
const token = 'honoiscool'
// app.get('/', (c) => c.text('Pretty Hono Demo Web API'))
app.get('/', (c) => c.redirect('/api/auth/engineList'))
app.get('/:username', (c) => {
    const { username } = c.req.param()
    return c.html(
      html`<!doctype html>
        <h1>hono! ${username}!</h1>`
    )
  })
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

const middleware = new Hono<{ Bindings: Bindings }>()
middleware.use('*', prettyJSON())
// 简单鉴权
// Bearer Auth Middleware
// middleware.use('/employee/*', bearerAuth({ token }))
// jwt鉴权
// 调试暂时去掉
// middleware.use('/auth/*',
//   jwt({
//     secret: 'mySecretKey',
//   }))
app.route('/api', middleware)
app.route('/api', api)
app.route('/api', handler)
export default app