import { Hono } from 'hono'
const app = new Hono()

app.get('/demo', (c) => c.text('Hello Cloudflare Workers!'))

export default app