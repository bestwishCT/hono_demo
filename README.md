```
npm install
npm run dev
```

```
npm run deploy
```

> 搜索引擎表
```
npx wrangler d1 execute hono-dev --local --command="CREATE TABLE search_engine (id INTEGER PRIMARY KEY AUTOINCREMENT,name VARCHAR(255) NOT NULL,image_url VARCHAR(255) NOT NULL,created_date bigint,status tinyint)"


npx wrangler d1 execute hono-dev --local --command="SELECT * FROM search_engine"
```