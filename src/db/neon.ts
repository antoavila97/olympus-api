import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

export interface Env {
  DATABASE_URL: string
  ASSETS?: Fetcher | undefined
}

export type Sql = NeonQueryFunction<false, false>

export function makeDb(env: Env): Sql {
  return neon(env.DATABASE_URL)
}