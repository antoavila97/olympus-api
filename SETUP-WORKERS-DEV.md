# SIGUIENTE PASO — Registrar subdominio workers.dev (VOS, 2 minutos)

Todo el proyecto ya está construido, la base de datos en Neon está creada y la API quedó
desplegada a medias. Solo falta UN paso manual en Cloudflare:

## Pasos

1. En tu navegador tenés abierta esta página (se abrió automáticamente):
   https://dash.cloudflare.com/cbea54933f688150f60c98165078a574/workers/onboarding

2. Elegí un **subdominio** (ej. `antoavila`). Con eso tu API quedará en:
   `https://olympus-api.<tu-subdominio>.workers.dev`
   (ej: `https://olympus-api.antoavila.workers.dev`)

3. Click en **Register** (o **Save**).

4. Cuando lo hayas registrado, avísame por el chat ("listo") y yo repito el deploy.
   En unos segundos tu API quedará online 24/7.

## Qué hace cada uno (recordatorio)

| Quién | Qué pasa |
|---|---|
| Vos | Registrás el subdominio workers.dev (el paso de arriba) |
| Yo | Repito `wrangler deploy` y pruebo los endpoints en vivo |
| Nosotros | Probamos CRUD + ventas desde Swagger UI (`/docs`) y subimos todo a GitHub |

## Después del deploy (para la entrega / Fase 3)

1. Abrí: `https://olympus-api.<tu-subdominio>.workers.dev/docs`
2. En `POST /api/productos` → "Try it out" → pegar
   `{"nombre":"Altavoz","precio":899.90,"stock":10}` → "Execute".
3. Repetí con `GET`, `PUT`, `DELETE` y `POST /api/ventas` (mirá cómo baja el stock).
4. Grabá capturas/video mostrando la respuesta HTTP real y el JSON devuelto, sin Postman.