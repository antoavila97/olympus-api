import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { makeDb, type Env } from '../db/neon'
import { ProductoSchema, ProductoCreateSchema, type Producto } from '../schemas/producto'
import { ErrorSchema } from '../schemas/error'
import { validationError } from '../openapi/validation'

const errorJson = { 'application/json': { schema: ErrorSchema } }

interface ProductoRow {
  id: unknown
  nombre: string | null
  descripcion: string | null
  precio: unknown
  stock: unknown
  created_at: unknown
  updated_at: unknown
}

function mapProducto(row: ProductoRow): Producto {
  return {
    id: Number(row.id),
    nombre: row.nombre ?? '',
    descripcion: row.descripcion,
    precio: Number(row.precio),
    stock: Number(row.stock),
    created_at: new Date(String(row.created_at)).toISOString(),
    updated_at: new Date(String(row.updated_at)).toISOString(),
  }
}

function serverError(e: unknown) {
  const message = e instanceof Error ? e.message : 'Error interno del servidor'
  return { code: 'SERVER_ERROR', message }
}

export function createProductosRoutes(): OpenAPIHono<{ Bindings: Env }> {
  const app = new OpenAPIHono<{ Bindings: Env }>({ defaultHook: validationError })

  const idParam = z.string().openapi({ param: { name: 'id', in: 'path' }, example: '1' })
  const productSchema = {
    'application/json': { schema: ProductoSchema },
  }
  const createSchema = {
    'application/json': { schema: ProductoCreateSchema },
  }

  const parseId = (value: string): number | null => {
    const id = Number(value)
    return Number.isInteger(id) && id > 0 ? id : null
  }

  // ------------------------------------------------------------------
  // GET /api/productos — listar catálogo completo
  // ------------------------------------------------------------------
  app.openapi(
    createRoute({
      method: 'get',
      path: '/',
      tags: ['Productos'],
      summary: 'Obtener catálogo de productos',
      responses: {
        200: {
          description: 'Catálogo completo devuelto en JSON',
          content: { 'application/json': { schema: z.array(ProductoSchema) } },
        },
        500: { description: 'Error interno del servidor', content: errorJson },
      },
    }),
    async (c) => {
      try {
        const sql = makeDb(c.env)
        const rows = await sql`select * from public.productos order by id`
        return c.json((rows as ProductoRow[]).map(mapProducto), 200)
      } catch (e) {
        return c.json(serverError(e), 500)
      }
    }
  )

  // ------------------------------------------------------------------
  // GET /api/productos/{id} — consultar un producto
  // ------------------------------------------------------------------
  app.openapi(
    createRoute({
      method: 'get',
      path: '/{id}',
      tags: ['Productos'],
      summary: 'Consultar un producto por su identificador único',
      request: { params: z.object({ id: idParam }) },
      responses: {
        200: { description: 'Producto encontrado', content: productSchema },
        400: { description: 'Identificador inválido', content: errorJson },
        404: { description: 'Producto no encontrado', content: errorJson },
        500: { description: 'Error interno del servidor', content: errorJson },
      },
    }),
    async (c) => {
      try {
        const id = parseId(c.req.valid('param').id)
        if (id === null) return c.json({ code: 'ID_INVALIDO', message: 'Identificador inválido' }, 400)
        const sql = makeDb(c.env)
        const rows = await sql`select * from public.productos where id = ${id}`
        if (rows.length === 0)
          return c.json({ code: 'PRODUCTO_INEXISTENTE', message: `Producto con id ${id} no existe` }, 404)
        return c.json(mapProducto(rows[0] as ProductoRow), 200)
      } catch (e) {
        return c.json(serverError(e), 500)
      }
    }
  )

  // ------------------------------------------------------------------
  // POST /api/productos — registrar nuevo producto
  // ------------------------------------------------------------------
  app.openapi(
    createRoute({
      method: 'post',
      path: '/',
      tags: ['Productos'],
      summary: 'Registrar un nuevo producto',
      request: {
        body: { content: createSchema, required: true },
      },
      responses: {
        201: { description: 'Producto creado correctamente', content: productSchema },
        400: { description: 'Payload JSON inválido', content: errorJson },
        500: { description: 'Error interno del servidor', content: errorJson },
      },
    }),
    async (c) => {
      try {
        const body = c.req.valid('json')
        const sql = makeDb(c.env)
        const rows = await sql`
          insert into public.productos (nombre, descripcion, precio, stock)
          values (${body.nombre}, ${body.descripcion}, ${body.precio}, ${body.stock})
          returning id, nombre, descripcion, precio, stock, created_at, updated_at
        `
        return c.json(mapProducto(rows[0] as ProductoRow), 201)
      } catch (e) {
        return c.json(serverError(e), 500)
      }
    }
  )

  // ------------------------------------------------------------------
  // PUT /api/productos/{id} — actualizar todos los datos de un producto
  // ------------------------------------------------------------------
  app.openapi(
    createRoute({
      method: 'put',
      path: '/{id}',
      tags: ['Productos'],
      summary: 'Actualizar la totalidad de los datos de un producto',
      request: {
        params: z.object({ id: idParam }),
        body: { content: createSchema, required: true },
      },
      responses: {
        200: { description: 'Producto actualizado', content: productSchema },
        400: { description: 'Payload JSON inválido', content: errorJson },
        404: { description: 'Producto no encontrado', content: errorJson },
        500: { description: 'Error interno del servidor', content: errorJson },
      },
    }),
    async (c) => {
      try {
        const id = parseId(c.req.valid('param').id)
        if (id === null) return c.json({ code: 'ID_INVALIDO', message: 'Identificador inválido' }, 400)
        const body = c.req.valid('json')
        const sql = makeDb(c.env)
        const rows = await sql`
          update public.productos
             set nombre      = ${body.nombre},
                 descripcion = ${body.descripcion},
                 precio      = ${body.precio},
                 stock       = ${body.stock},
                 updated_at  = now()
           where id = ${id}
          returning id, nombre, descripcion, precio, stock, created_at, updated_at
        `
        if (rows.length === 0)
          return c.json({ code: 'PRODUCTO_INEXISTENTE', message: `Producto con id ${id} no existe` }, 404)
        return c.json(mapProducto(rows[0] as ProductoRow), 200)
      } catch (e) {
        return c.json(serverError(e), 500)
      }
    }
  )

  // ------------------------------------------------------------------
  // DELETE /api/productos/{id} — eliminar un producto
  // ------------------------------------------------------------------
  app.openapi(
    createRoute({
      method: 'delete',
      path: '/{id}',
      tags: ['Productos'],
      summary: 'Eliminar un producto del sistema',
      request: { params: z.object({ id: idParam }) },
      responses: {
        200: {
          description: 'Producto eliminado',
          content: { 'application/json': { schema: z.object({ message: z.string() }) } },
        },
        400: { description: 'Identificador inválido', content: errorJson },
        404: { description: 'Producto no encontrado', content: errorJson },
        500: { description: 'Error interno del servidor', content: errorJson },
      },
    }),
    async (c) => {
      try {
        const id = parseId(c.req.valid('param').id)
        if (id === null) return c.json({ code: 'ID_INVALIDO', message: 'Identificador inválido' }, 400)
        const sql = makeDb(c.env)
        const rows = await sql`delete from public.productos where id = ${id} returning id`
        if (rows.length === 0)
          return c.json({ code: 'PRODUCTO_INEXISTENTE', message: `Producto con id ${id} no existe` }, 404)
        return c.json({ message: `Producto ${id} eliminado correctamente` }, 200)
      } catch (e) {
        return c.json(serverError(e), 500)
      }
    }
  )

  return app
}