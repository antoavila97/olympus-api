# SETUP — Neon (base de datos) + Cloudflare

## PARTE 1: Crear la base de datos en Neon (VOS, desde el navegador)

1. Abrí en tu navegador:
   https://console.neon.tech/sign_in
   - Botón **Sign in with Google** (usá la misma cuenta de Gmail).

2. Una vez dentro:
   - Click en **Create a project**.
   - **Name:** `olympus-api`
   - **Region:** elegí la más cercana a tu país (ej. South America).
   - Dejá el plan **Free**.
   - Click **Create project**.

3. Cuando el proyecto esté creado te muestra el panel "Connect".
   - Andá a la pestaña **Connection string** (o click en "Get connection string").
   - Copiá TODO el string que empieza con `postgresql://...` (incluye usuario:clave@host).
   - Ese string es el `DATABASE_URL` que necesitamos.
   - Opcional: también lo podés ver después en **Dashboard → Connect**.

4. PÁSAME por el chat el `DATABASE_URL` completo.
   (La clave del usuario es un SECRETO: solo se guarda como secreto de
   Cloudflare con `wrangler secret put DATABASE_URL`. NUNCA se sube a Git.)

## PARTE 2 (la hago yo cuando me pases el DATABASE_URL)

1. Guardo el secreto en Cloudflare:
   - `wrangler secret put DATABASE_URL`
2. Corro la migración:
   - `npm run migrate`  → crea tablas `productos`, `ventas`, `venta_detalles`,
     la función transaccional `crear_venta()` y 4 productos de ejemplo.
3. Despliego el Worker 24/7:
   - `wrangler deploy`
4. Pruebo el CRUD + ventas en vivo desde `/docs` (Swagger UI).
5. Creo el repo en GitHub y subo todo.

## PARTE 3: Demo para la entrega (Fase 3)

1. Abrí: `https://olympus-api.<tu-subdominio>.workers.dev/docs`
2. En `POST /api/productos` → botón "Try it out" →
   pegar `{"nombre":"Altavoz","precio":899.90,"stock":10}` → "Execute".
3. Repetí con `GET`, `PUT`, `DELETE` y `POST /api/ventas` (verificá que el stock baja).
4. Grabá las capturas o video mostrando la respuesta HTTP real y el JSON devuelto,
   sin abrir Postman.