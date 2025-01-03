import {} from 'hono'
export type Bindings = {
    USERNAME: string
    PASSWORD: string
    BLOG_EXAMPLE: KVNamespace
    DB: D1Database
    MY_BUCKET: R2Bucket
}

