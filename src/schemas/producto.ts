import { z } from '@hono/zod-openapi'

export const ProductoSchema = z.object({
  id: z.number().int().positive().openapi({ example: 1 }),
  nombre: z
    .string()
    .min(1)
    .max(120)
    .openapi({ example: 'Smart TV 50" 4K' }),
  descripcion: z
    .string()
    .max(500)
    .nullable()
    .openapi({ example: 'Televisor LED 4K UltraHD con HDR' }),
  precio: z.number().nonnegative().openapi({ example: 5499.99 }),
  stock: z.number().int().nonnegative().openapi({ example: 20 }),
  created_at: z.string().openapi({ example: '2026-01-01T12:00:00.000Z' }),
  updated_at: z.string().openapi({ example: '2026-01-01T12:00:00.000Z' }),
})

export const ProductoCreateSchema = ProductoSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export type Producto = z.infer<typeof ProductoSchema>
export type ProductoCreate = z.infer<typeof ProductoCreateSchema>