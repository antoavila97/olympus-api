import { mkdirSync, writeFileSync } from 'node:fs'
import { stringify as toYaml } from 'yaml'
import { app } from '../index'
import { docConfig } from '../openapi/config'

mkdirSync(new URL('../../public', import.meta.url), { recursive: true })

const spec = app.getOpenAPIDocument(docConfig)

writeFileSync(
  new URL('../../public/openapi.json', import.meta.url),
  JSON.stringify(spec, null, 2)
)

writeFileSync(
  new URL('../../public/openapi.yaml', import.meta.url),
  toYaml(spec as object)
)

console.log('openapi.json y openapi.yaml generados en public/')