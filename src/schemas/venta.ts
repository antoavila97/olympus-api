import { z } from '@hono/zod-openapi'

export const VentaItemSchema = z.object({
  producto_id: z.number().int().positive().openapi({ example: 1 }),
  cantidad: z.number().int().positive().openapi({ example: 2 }),
})

export const VentaCreateSchema = z.object({
  items: z
    .array(VentaItemSchema)
    .min(1)
    .openapi({ description: 'Detalle de la venta (al menos un ítem)' }),
})

export const VentaSchema = z.object({
  id: z.number().int().positive().openapi({ example: 1 }),
  total: z.number().nonnegative().openapi({ example: 10999.98 }),
  created_at: z.string().openapi({ example: '2026-01-01T12:00:00.000Z' }),
  items: z.array(
    z.object({
      producto_id: z.number().int().positive().openapi({ example: 1 }),
      cantidad: z.number().int().positive().openapi({ example: 2 }),
      precio_unitario: z.number().nonnegative().openapi({ example: 5499.99 }),
    })
  ),
})

export type VentaCreate = z.infer<typeof VentaCreateSchema>
export type Venta = z.infer<typeof VentaSchema>