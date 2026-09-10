import { z } from '@hono/zod-openapi'

export const ErrorSchema = z.object({
  code: z.string().openapi({ example: 'STOCK_INSUFICIENTE' }),
  message: z.string().openapi({ example: 'Stock insuficiente' }),
})