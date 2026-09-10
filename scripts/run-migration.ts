import { readFileSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('Falta la variable de entorno DATABASE_URL')
  process.exit(1)
}

function splitStatements(sql: string): string[] {
  const statements: string[] = []
  let current = ''
  let inDollar: string | null = null
  let inSingle = false
  let inLineComment = false

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i]
    const next = sql[i + 1]

    if (inLineComment) {
      if (ch === '\n') inLineComment = false
      current += ch
      continue
    }

    if (!inDollar && !inSingle && ch === '-' && next === '-') {
      inLineComment = true
      current += ch + next
      i++
      continue
    }

    if (!inDollar && ch === "'") {
      if (next === "'") {
        current += ch + next
        i++
        continue
      }
      inSingle = true
      current += ch
      continue
    }

    if (inSingle) {
      if (ch === "'") inSingle = false
      current += ch
      continue
    }

    if (ch === '$') {
      const tag = /^\$[A-Za-z0-9_]*\$/.exec(sql.slice(i))
      if (tag) {
        if (!inDollar) {
          inDollar = tag[0]
          current += tag[0]
          i += tag[0].length - 1
        } else if (sql.slice(i, i + inDollar.length) === inDollar) {
          current += inDollar
          i += inDollar.length - 1
          inDollar = null
        } else {
          current += ch
        }
        continue
      }
    }

    if (!inDollar && ch === ';') {
      const statement = current.trim()
      if (statement) statements.push(statement)
      current = ''
      continue
    }

    current += ch
  }

  const tail = current.trim()
  if (tail) statements.push(tail)
  return statements
}

const content = readFileSync(new URL('../migrations/001_init.sql', import.meta.url), 'utf8')
const statements = splitStatements(content)

console.log(`Aplicando ${statements.length} sentencias de migrations/001_init.sql...`)

const sql = neon(url)

for (const statement of statements) {
  await sql.query(statement)
  console.log('  ✓ sentencia aplicada')
}

console.log('Migración completada: tablas, función crear_venta y datos de ejemplo listos.')