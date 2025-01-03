import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Bindings } from './bindings'
import * as model from './model'
import { getFormDataValue, getFormDataNumber } from './utils/formData'
import type { FC } from 'hono/jsx'
import type { Employee } from './db'
import { updateEmployee, findAllEmployees,createEmployee,deleteEmployee } from './db'
import { sign,decode,verify} from 'hono/jwt'

const api = new Hono<{ Bindings: Bindings }>()
api.use('/posts/*', cors())

api.get('/', (c) => {
    return c.json({ message: 'Hello' })
})

api.get('/posts', async (c) => {
    const posts = await model.getPosts(c.env.BLOG_EXAMPLE)
    return c.json({ posts: posts, ok: true })
})

api.post('/posts', async (c) => {
    const param = await c.req.json()
    const newPost = await model.createPost(c.env.BLOG_EXAMPLE, param as model.Param)
    if (!newPost) {
        return c.json({ error: 'Can not create new post', ok: false }, 422)
    }
    return c.json({ post: newPost, ok: true }, 201)
})

api.get('/posts/:id', async (c) => {
    const id = c.req.param('id')
    const post = await model.getPost(c.env.BLOG_EXAMPLE, id)
    if (!post) {
        return c.json({ error: 'Not Found', ok: false }, 404)
    }
    return c.json({ post: post, ok: true })
})

api.put('/posts/:id', async (c) => {
    const id = c.req.param('id')
    const post = await model.getPost(c.env.BLOG_EXAMPLE, id)
    if (!post) {
        // 204 No Content
        return new Response(null, { status: 204 })
    }
    const param = await c.req.json()
    const success = await model.updatePost(c.env.BLOG_EXAMPLE, id, param as model.Param)
    return c.json({ ok: success })
})

api.delete('/posts/:id', async (c) => {
    const id = c.req.param('id')
    const post = await model.getPost(c.env.BLOG_EXAMPLE, id)
    if (!post) {
        // 204 No Content
        return new Response(null, { status: 204 })
    }
    const success = await model.deletePost(c.env.BLOG_EXAMPLE, id)
    return c.json({ ok: success })
})
//========================d1 CRUD、Auth==================================
//d1 query
api.get('/auth/employee', async (c) => {
    const locations = await findAllEmployees(c.env.DB)
    return c.json({ locations: locations, ok: true })
})
//d1 add
api.post('/auth/employee', async (c) => {
    // const param = await c.req.json()
    const formData = await c.req.formData();
    const employeeData: Employee = {
        employee_id: getFormDataValue(formData, 'employee_id'),
        name: getFormDataValue(formData, 'name'),
        position: getFormDataValue(formData, 'position'),
        image_url: "",
        join_date: getFormDataValue(formData, 'join_date'),
        department_id: getFormDataNumber(formData, 'department_id'),
        location_id: getFormDataNumber(formData, 'location_id'),
        location_name: '',
        department_name: ''
      };
    // console.log(employeeData);
    const newEmployee = await createEmployee(c.env.DB,employeeData)
    if (!newEmployee) {
        return c.json({ error: 'Can not create new employee', ok: false }, 422)
    }
    return c.json({ employee: newEmployee, ok: true }, 201)
})

//d1 edit
api.put('/auth/employee/:employeeId', async (c) => {
    const { employeeId } = c.req.param();
    const updatedEmployee = await c.req.json();
    const updateFlag = await updateEmployee(c.env.DB,employeeId,updatedEmployee)
    if (!updateFlag) {
        return c.json({ error: 'Can not update employee', ok: false }, 422)
    }
    return c.json({ok: true }, 201)
})

//d1 delete
api.delete('/auth/employee/:employeeId', async (c) => {
    const { employeeId } = c.req.param();
    const deleteFlag = await deleteEmployee(c.env.DB, employeeId);
    if (!deleteFlag) {
      return c.json({ error: 'Employee not found or cannot be deleted', ok: false }, 404);
    }
    return c.json({ ok: true }, 201);
  });
//token
api.post('/login', async (c) => {
    const payload = {
        sub: 'admin',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 60 * 1, // Token expires in 5 minutes
      }
      const secret = 'mySecretKey'
      const token = await sign(payload, secret)
    return c.json({ token: token, ok: true }, 201)
})

//token
api.get('/parseToken', async (c) => {
    const tokenToDecode = c.req.query('token')
    if (!tokenToDecode) {
      return c.json({ error: 'Token is required', ok: false }, 400)
    }
    const { header, payload } = decode(tokenToDecode)
    if (!header || !payload) {
      return c.json({ error: 'Invalid token', ok: false }, 400)
    }
    console.log('Decoded Header:', header)
    console.log('Decoded Payload:', payload)
    return c.json({ header, payload, ok: true })
  })
  
  //verify()
api.get('/verify', async (c) => {
    const tokenToDecode = c.req.query('token')
    if (!tokenToDecode) {
        return c.json({ error: 'Token is required', ok: false }, 400)
    }
    const secret = 'mySecretKey'
    const decodedPayload = await verify(tokenToDecode, secret)
    console.log(decodedPayload)
    return c.json({ decodedPayload, ok: true })
  })

export default api