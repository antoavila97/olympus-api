import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { makeDb, type Env } from '../db/neon'
import { VentaCreateSchema, VentaSchema, type Venta } from '../schemas/venta'
import { ErrorSchema } from '../schemas/error'
import { validationError } from '../openapi/validation'

const errorJson = { 'application/json': { schema: ErrorSchema } }

function serverError(e: unknown) {
  const message = e instanceof Error ? e.message : 'Error interno del servidor'
  return { code: 'SERVER_ERROR', message }
}

export function createVentasRoutes(): OpenAPIHono<{ Bindings: Env }> {
  const app = new OpenAPIHono<{ Bindings: Env }>({ defaultHook: validationError })

  // ------------------------------------------------------------------
  // POST /api/ventas — operación transaccional que descuenta stock
  // ------------------------------------------------------------------
  app.openapi(
    createRoute({
      method: 'post',
      path: '/',
      tags: ['Ventas'],
      summary: 'Registrar una venta y descontar inventario en tiempo real',
      description:
        'Operación transaccional: valida stock disponible, registra la venta y sus detalles, ' +
        'y descuenta el inventario de forma atómica. Si el stock no alcanza, la venta no se registra.',
      request: {
        body: { content: { 'application/json': { schema: VentaCreateSchema } }, required: true },
      },
      responses: {
        201: {
          description: 'Venta registrada y stock actualizado',
          content: { 'application/json': { schema: VentaSchema } },
        },
        400: {
          description: 'Stock insuficiente o cantidad inválida',
          content: errorJson,
        },
        404: {
          description: 'Producto inexistente en el catálogo',
          content: errorJson,
        },
        500: { description: 'Error interno del servidor', content: errorJson },
      },
    }),
    async (c) => {
      try {
        const body = c.req.valid('json')
        const sql = makeDb(c.env)
        const rows = await sql`
          select public.crear_venta(${JSON.stringify(body.items)}::jsonb) as resultado
        `
        return c.json(rows[0]?.resultado as Venta, 201)
      } catch (e) {
        const msg = e instanceof Error ? String(e.message ?? '').toUpperCase() : ''
        if (msg.includes('STOCK_INSUFICIENTE') || msg.includes('CANTIDAD_INVALIDA'))
          return c.json({ code: 'STOCK_INSUFICIENTE', message: e instanceof Error ? e.message : 'Stock insuficiente' }, 400)
        if (msg.includes('PRODUCTO_INEXISTENTE'))
          return c.json({ code: 'PRODUCTO_INEXISTENTE', message: e instanceof Error ? e.message : 'Producto inexistente' }, 404)
        return c.json(serverError(e), 500)
      }
    }
  )

  return app
}