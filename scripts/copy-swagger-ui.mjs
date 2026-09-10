import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'node_modules', 'swagger-ui-dist')
const destination = join(root, 'public', 'swagger-ui')

mkdirSync(destination, { recursive: true })

const files = ['swagger-ui.css', 'swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js']

for (const file of files) {
  copyFileSync(join(source, file), join(destination, file))
}

console.log('Swagger UI assets copiados a public/swagger-ui')