import { Hono } from 'hono'
import { Bindings } from '../bindings'
import { getFormDataValue, getFormDataNumber } from '..//utils/formData'
import type { Employee, SearchEngine,reportPoint } from '../db'
import { createSearchEngine, findSearchEngines, findSearchEngineById, updateSearchEngine, deleteSearchEngine,savePoint } from '../db'

const api = new Hono<{ Bindings: Bindings }>()
api.post('/pointSave', async (c) => {
  const param = await c.req.json()
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const reportPoint: reportPoint = {
    body: param.body,
    created_date: currentTimestamp,
  };
  const newPoint = await savePoint(c.env.DB, reportPoint)
  if (!newPoint) {
    return c.json({ error: 'Can not create new point', ok: false }, 422)
  }
  return c.json({ point: newPoint, ok: true }, 201)
})
// 搜索引擎添加
api.post('/auth/searchEngine', async (c) => {
  // start 上传文件到R2
  const formData = await c.req.formData();
  console.log(formData)
  const imageFile = formData.get('file');
  let imageUrl = '';
  if (imageFile instanceof File) {
    const key = `${new Date().getTime()}-${imageFile.name}`;
    const fileBuffer = await imageFile.arrayBuffer();
    await c.env.hono.put(key, fileBuffer, {
      httpMetadata: {
        contentType: imageFile.type || 'application/octet-stream',
      },
    });
    console.log(`File uploaded successfully: ${key}`);
    imageUrl = `https://pub-a4f4e5ec65f24061956b560179a5a794.r2.dev/${key}`;
  }
  // end
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const searchEngineData: SearchEngine = {
    name: getFormDataValue(formData, 'name'),
    image_url: imageUrl,
    created_date: currentTimestamp,
    status: 1
  };
  const newEngine = await createSearchEngine(c.env.DB, searchEngineData)
  if (!newEngine) {
    return c.json({ error: 'Can not create new search engine', ok: false }, 422)
  }
  return c.json({ employee: newEngine, ok: true }, 201)
})

// 搜索引擎列表
api.get('/auth/engineList', async (c) => {
  const page = Number(c.req.query('page') || 1);
  const pageSize = Number(c.req.query('pageSize') || 10);
  const engines = await findSearchEngines(c.env.DB, page, pageSize);

  // 渲染表格和新增按钮
  const htmlContent = `
<h1>搜索引擎列表</h1>
<button onclick="document.getElementById('addForm').style.display = 'block';">新增</button>

<!-- 新增表单 -->
<div id="addForm" style="display: none;">
  <h2>添加搜索引擎</h2>
  <form id="addEngineForm" enctype="multipart/form-data">
    <label for="name">名称:</label>
    <input type="text" id="name" name="name" required><br><br>
    
    <label for="status">状态:</label>
    <input type="number" id="status" name="status" value="1" readonly><br><br>
    
    <!-- 添加上传文件字段 -->
    <label for="file">上传搜索引擎Logo:</label>
    <input type="file" id="file" name="file" required><br><br>
    
    <button type="button" onclick="submitForm()">提交</button>
  </form>
</div>

<table border="1" cellpadding="10" cellspacing="0">
  <thead>
    <tr>
      <th>ID</th>
      <th>名称</th>
      <th>状态</th>
      <th>Logo</th>
      <th>创建时间</th>
      <th>操作</th>
    </tr>
  </thead>
  <tbody>
    ${engines.map((engine: any) => `
      <tr>
        <td>${engine.id}</td>
        <td>${engine.name}</td>
        <td>${engine.status}</td>
        <td>
        <img src="${engine.image_url}" alt="${engine.name}" width="100" height="100">
      </td>
        <td>${new Date(engine.created_date * 1000).toLocaleString()}</td>
        <td>
          <a href="/api/auth/engine/${engine.id}/edit">Edit</a> |
          <a href="/api/auth/engine/${engine.id}/delete">Delete</a>
        </td>
      </tr>
    `).join('')}
  </tbody>
</table>

<script>
  function submitForm() {
    const form = document.getElementById('addEngineForm');
    const formData = new FormData(form); // 使用 FormData 获取表单数据

    fetch('/api/auth/searchEngine', {
      method: 'POST',
      body: formData, // 直接将 FormData 发送到服务器
    })
    .then(response => response.json())
    .then(data => {
      if (data.ok) {
        alert('搜索引擎添加成功');
        window.location.reload(); // 刷新页面
      } else {
        alert('添加搜索引擎失败');
      }
    })
    .catch(error => {
      console.error('错误:', error);
      alert('添加搜索引擎时出错');
    });
  }
</script>
  `;

  return c.html(htmlContent);
});


// 查看引擎详情
api.get('/auth/engine/:id/view', async (c) => {
  const engineId = c.req.param('id');
  const engine = await findSearchEngineById(c.env.DB, engineId);

  if (!engine) {
    return c.json({ error: 'Engine not found', ok: false }, 404);
  }

  return c.html(`
    <h1>查看搜索引擎 - ${engine.name}</h1>
    <p>ID: ${engine.id}</p>
    <p>Name: ${engine.name}</p>
    <p>Status: ${engine.status}</p>
    <a href="/api/auth/engineList">Back to list</a>
  `);
});


// 编辑引擎
api.get('/auth/engine/:id/edit', async (c) => {
  const engineId = c.req.param('id');
  const engine = await findSearchEngineById(c.env.DB, engineId);

  if (!engine) {
    return c.json({ error: 'Engine not found', ok: false }, 404);
  }

  return c.html(`
    <h1>Edit Search Engine - ${engine.name}</h1>
    <form action="/api/auth/engine/${engine.id}/edit" method="POST">
      <label for="name">Name:</label>
      <input type="text" name="name" value="${engine.name}" required /><br/>
      <label for="status">Status:</label>
      <select name="status">
        <option value="1" ${engine.status === 1 ? 'selected' : ''}>Active</option>
        <option value="0" ${engine.status === 0 ? 'selected' : ''}>Inactive</option>
      </select><br/>
      <button type="submit">Save Changes</button>
    </form>
    <a href="/api/auth/engineList">Back to list</a>
  `);
});

api.post('/auth/engine/:id/edit', async (c) => {
  const engineId = c.req.param('id');
  const formData = await c.req.formData();
  const name = formData.get('name') as string;
  const status = formData.get('status') as string;
  const statusNumber = parseInt(status, 10);
  if (isNaN(statusNumber)) {
    return c.json({ error: 'Invalid status', ok: false }, 422);
  }
  const updatedEngine = await updateSearchEngine(c.env.DB, engineId, { name, status: statusNumber });
  if (!updatedEngine) {
    return c.json({ error: 'Unable to update engine', ok: false }, 422);
  }
  return c.json({ message: 'Engine updated successfully', ok: true });
});


// 删除引擎
api.get('/auth/engine/:id/delete', async (c) => {
  const engineId = c.req.param('id');
  const result = await deleteSearchEngine(c.env.DB, engineId);
  if (!result) {
    return c.json({ error: 'Unable to delete engine', ok: false }, 422);
  }
  return c.json({ message: 'Engine deleted successfully', ok: true });
});

export default api