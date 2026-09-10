import { OpenAPIHono } from '@hono/zod-openapi'
import { stringify as toYaml } from 'yaml'
import type { Env } from './db/neon'
import { createProductosRoutes } from './controllers/productos'
import { createVentasRoutes } from './controllers/ventas'
import { docsHtml } from './docs'
import { docConfig } from './openapi/config'

const app = new OpenAPIHono<{ Bindings: Env }>()

// ------------------------------------------------------------------
// Recursos de la API
// ------------------------------------------------------------------
app.route('/api/productos', createProductosRoutes())
app.route('/api/ventas', createVentasRoutes())

// ------------------------------------------------------------------
// Contrato OpenAPI autogenerado desde el código fuente
// ------------------------------------------------------------------
app.doc('/openapi.json', docConfig)

app.get('/openapi.yaml', (c) =>
  c.body(toYaml(app.getOpenAPIDocument(docConfig)), 200, {
    'Content-Type': 'application/yaml; charset=utf-8',
  })
)

// ------------------------------------------------------------------
// Swagger UI interactiva (pruebas sin Postman)
// ------------------------------------------------------------------
app.get('/docs', (c) => c.html(docsHtml))

export default app
export { app }