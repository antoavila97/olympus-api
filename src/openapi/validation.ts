import type { Context } from 'hono'
import type { Env } from '../db/neon'

type Ctx = Context<{ Bindings: Env }>

export function validationError(result: { success: boolean }, c: Ctx): Response | undefined {
  if (result.success) return undefined
  return c.json(
    {
      code: 'VALIDATION_ERROR',
      message: 'Datos inválidos en la solicitud',
    },
    400
  )
}