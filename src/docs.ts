export const docsHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OLYMPICUS API — Documentación interactiva</title>
  <link rel="stylesheet" href="/swagger-ui/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow: auto; }
    *, *:before, *:after { box-sizing: inherit; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="/swagger-ui/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script>
    window.onload = function () {
      window.ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout'
      })
    }
  </script>
</body>
</html>`