import { Hono } from 'hono'
// import { basicAuth } from 'hono/basic-auth'
import { bearerAuth } from 'hono/bearer-auth'
import { prettyJSON } from 'hono/pretty-json'
import api from './api'
import handler from './handler/handler'
import { Bindings } from './bindings'
import { jwt } from 'hono/jwt'
import { html, raw } from 'hono/html'
import { findPointData } from './db'

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
// 简单鉴权,现在不用
// Bearer Auth Middleware
// middleware.use('/employee/*', bearerAuth({ token }))
// jwt鉴权，现在使用（调试暂时去掉）
// middleware.use('/auth/*',
//   jwt({
//     secret: 'mySecretKey',
//   }))
app.route('/api', middleware)
app.route('/api', api)
app.route('/api', handler)

const scheduled = {
    async scheduled(controller: ScheduledController, env: Bindings, ctx: ExecutionContext) {
        console.log('Cron task executed at', new Date().toISOString());
    }
};

// Cloudflare Worker 的入口函数
export default {
    // 处理 HTTP 请求
    async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
        return app.fetch(request, env, ctx);
    },

    // 处理定时任务
    async scheduled(controller: ScheduledController, env: Bindings, ctx: ExecutionContext) {
        switch (controller.cron) {
            case "*/1 * * * *":
                // Every minutes
                // 测试阶段暂时去掉
                // console.log("cron processed 1 minutes ***");
                // const pointData = await findPointData(env.DB);
                // if (pointData && pointData.length > 0) {
                //     pointData.forEach((point: any) => {
                //         console.log(`Point Body: ${point.body}`);
                //     });
                // } else {
                //     console.log("No points found");
                // }
                break;
            case "*/10 * * * *":
                // Every ten minutes
                console.log("cron processed 10 minutes ***");
                break;
            case "*/45 * * * *":
                // Every forty-five minutes
                console.log("cron processed 45 minutes ***");
                break;
        }
        console.log(controller.cron)
        console.log("cron processed");
    },
};
// export default app