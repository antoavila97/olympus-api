# OLYMPICUS API — REST + OpenAPI/Swagger 24/7

**Proyecto Integrador · Arquitectura Backend y Servicios Web · Tercer Año**

API RESTful de **inventario y ventas**, documentada con el estándar **OpenAPI** y probada desde una consola **Swagger UI interactiva** sin necesidad de Postman. Alojada **24/7 en Cloudflare Workers** con base de datos **Neon (PostgreSQL serverless)** y desplegada desde **GitHub**.

> ## 🌐 ENLACES DE LA API (en vivo)
>
> - **Swagger UI interactiva:** https://olympus-api.aaahurtado36h.workers.dev/docs
> - **API productos:** https://olympus-api.aaahurtado36h.workers.dev/api/productos
> - **Contrato OpenAPI (JSON):** https://olympus-api.aaahurtado36h.workers.dev/openapi.json
> - **Contrato OpenAPI (YAML):** https://olympus-api.aaahurtado36h.workers.dev/openapi.yaml

## 1. Resumen técnico

| Componente | Tecnología | Función |
|---|---|---|
| Hosting 24/7 | **Cloudflare Workers** (plan gratuito) | Ejecuta la API en el edge, hasta 100k req/día |
| Framework | **Hono** | Framework web liviano para Workers |
| Modelado + Docs | **@hono/zod-openapi** | Esquemas y endpoints anotados en el código → `openapi.json`/`.yaml` autogenerados |
| Consola interactiva | **Swagger UI** (`/docs`) | Botón "Try it out" → ejecuta el HTTP real contra el servidor |
| Base de datos | **Neon / PostgreSQL** serverless | Persistencia con SQL parametrizado (**sentencias preparadas**) |
| Repo + CI/CD | **GitHub** | Control de versiones; Cloudflare despliega desde el repo |

### ¿Cómo cumple el enunciado?

El documento de cátedra propone PHP + `zircote/swagger-php` + PDO. Este proyecto implementa los **mismos conceptos** con un stack moderno que sí se aloja gratis y 24/7 en Cloudflare:

| Concepto del enunciado | Aquí se implementa como |
|---|---|
| `#[OA\Info]`, `#[OA\Get]`, `#[OA\Response]` | `createRoute`, `openapiJson()`, registros OpenAPI de `@hono/zod-openapi` |
| Comentarios/anotaciones en código → spec autogenerado | Schemas Zod + rutas anotadas → `openapi.json` en build |
| PDO + sentencias preparadas contra MariaDB | SQL parametrizado con `@neondatabase/serverless` + función PostgreSQL `crear_venta()` transaccional |
| `generate-swagger.sh` | `npm run generate-docs` (recompila `openapi.json`/`.yaml`) |
| Swagger UI en `/docs` o `/swagger` | Swagger UI embebida en `/docs` |

## 2. Endpoints

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| GET | `/api/productos` | Lista el catálogo completo | 200, 500 |
| GET | `/api/productos/:id` | Consulta un producto por id | 200, 404, 500 |
| POST | `/api/productos` | Crea un producto (JSON) | 201, 400, 500 |
| PUT | `/api/productos/:id` | Actualiza todos los datos de un producto | 200, 404, 400, 500 |
| DELETE | `/api/productos/:id` | Elimina un producto | 200, 404, 500 |
| POST | `/api/ventas` | Registra venta y descuenta stock atómicamente | 201, 400, 500 |
| GET | `/docs` | Swagger UI interactiva (Try it out) | 200 |
| GET | `/openapi.json` `/openapi.yaml` | Contrato OpenAPI autogenerado | 200 |

### Ejemplo: crear un producto

```
POST /api/productos
{ "nombre": "Smart TV 50\"", "precio": 5499.99, "stock": 20, "descripcion": "..." }
→ 201 Created
{ "id": 7, "nombre": "...", "precio": 5499.99, "stock": 20, "created_at": "...", "updated_at": "..." }
```

### Ejemplo: registrar una venta (transaccional)

```
POST /api/ventas
{ "items": [ { "producto_id": 7, "cantidad": 2 } ] }
→ 201 Created
{ "id": 1, "total": 10999.98, "created_at": "...", "items": [ ... ] }
```

## 3. Base de datos (Neon)

`migrations/001_init.sql` define:

- **`productos`** — `id`, `nombre`, `descripcion`, `precio`, `stock`, `created_at`, `updated_at`
- **`ventas`** — `id`, `total`, `created_at`
- **`venta_detalles`** — `id`, `venta_id` FK, `producto_id` FK, `cantidad`, `precio_unitario`
- **Función `crear_venta(items jsonb)`** — transacción atómica que inserta la venta, valida stock con `FOR UPDATE`, descuenta inventario y calcula el total. Error si el stock no alcanza (400).

**Seguridad:** la API usa la **connection string** de Neon (`DATABASE_URL`) como *secreto* en Cloudflare (`wrangler secret put`). Ese secreto **nunca** viaja en el código ni se sube a Git (`.gitignore` excluye `.dev.vars`).

## 4. Estructura del repositorio

```
olympus-api/
├── wrangler.jsonc          # Config del Worker (compatibility, assets, routes)
├── package.json            # Scripts: dev / build / generate-docs / migrate / deploy
├── tsconfig.json
├── .gitignore              # .dev.vars, node_modules, wrangler secrets
├── README.md
├── SETUP-NEON.md           # Pasos para crear la BD en Neon
├── migrations/
│   └── 001_init.sql        # Tablas + función transaccional para Neon
├── public/
│   ├── index.html          # Landing apuntando a /docs
│   ├── openapi.json        # Contrato OpenAPI generado
│   ├── openapi.yaml        # Contrato OpenAPI (YAML)
│   └── swagger-ui/         # Assets locales (sin CDN)
├── scripts/
│   ├── copy-swagger-ui.mjs
│   └── run-migration.ts    # Aplica migrations/001_init.sql
└── src/
    ├── index.ts            # Hono + rutas + /docs + /openapi.json
    ├── db/neon.ts          # Cliente SQL parametrizado (usa DATABASE_URL)
    ├── schemas/
    │   ├── producto.ts     # DTO Producto (zod → documentado en OpenAPI)
    │   ├── venta.ts        # DTO Venta
    │   └── error.ts        # DTO de error estándar { code, message }
    ├── controllers/
    │   ├── productos.ts    # CRUD completo
    │   └── ventas.ts       # POST /api/ventas → crear_venta()
    ├── openapi/
    │   ├── config.ts       # Info del documento OpenAPI
    │   └── validation.ts   # Mapeo de errores de validación (400)
    └── swagger/
        └── generate.ts     # Emite openapi.json + openapi.yaml
```

## 5. Cómo se ejecuta

### Instalación y entorno (desarrollo local)

```bash
npm install
# Completar .dev.vars con la connection string de Neon:
#   DATABASE_URL=postgresql://usuario:clave@host.neon.tech/neondb?sslmode=require
```

### Inicializar la base de datos (una sola vez)

```bash
npm run migrate      # aplica migrations/001_init.sql (usa DATABASE_URL)
```

### Local

```bash
npm run dev          # servidor local + /docs
```

### Generar el contrato OpenAPI (equivalente a generate-swagger.sh)

```bash
npm run generate-docs
# produce public/openapi.json y public/openapi.yaml
```

### Deploy 24/7 a Cloudflare

```bash
wrangler login                       # autorización en navegador
wrangler secret put DATABASE_URL     # guarda la connection string (secreto)
wrangler deploy                      # publica en https://olympus-api.aaahurtado36h.workers.dev
```

### CI/CD desde GitHub

Al hacer `git push` a `main`, Cloudflare despliega la última versión automáticamente.

## 6. Demo para la entrega (Fase 3)

1. Abrir https://olympus-api.aaahurtado36h.workers.dev/docs.
2. En `POST /api/productos` → "Try it out" → pegar `{"nombre":"Altavoz","precio":899.90,"stock":10}` → "Execute".
3. Repetir para `GET`, `PUT`, `DELETE` y el `POST /api/ventas` (verificar que el stock baja en tiempo real).
4. Grabar las capturas/video mostrando respuesta HTTP real y JSON devuelto, **sin abrir Postman**.

## 7. Entregables cumplidos

- **Fase 1** — Código fuente + migraciones SQL (`migrations/001_init.sql`)
- **Fase 2** — `openapi.json`/`.yaml` autogenerado desde el código, servido en `/openapi.json`
- **Fase 3** — Swagger UI interactiva en `/docs` lista para la demo