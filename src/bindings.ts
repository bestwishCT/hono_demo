import {} from 'hono'
export type Bindings = {
    USERNAME: string
    PASSWORD: string
    hono_kv_demo: KVNamespace
    DB: D1Database
    hono: R2Bucket
}

