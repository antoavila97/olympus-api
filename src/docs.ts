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
    header.topbar-doc {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #0b1b3a 0%, #123a6b 100%);
      color: #e6edf7;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    }
    header.topbar-doc .logo { font-weight: 700; color: #4ec5ff; }
    header.topbar-doc a.back {
      color: #fff;
      text-decoration: none;
      font-weight: 600;
      background: #2b6cb0;
      padding: 0.5rem 1rem;
      border-radius: 999px;
    }
    header.topbar-doc a.back:hover { background: #3273c9; }
  </style>
</head>
<body>
  <header class="topbar-doc">
    <span class="logo">OLYMPICUSAPI · Documentación</span>
    <a class="back" href="/">← Volver a la página principal</a>
  </header>
  <div id="swagger-ui"></div>
  <script src="/swagger-ui/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script>
    window.onload = function () {
      window.ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout',
        lang: 'es'
      })
    }
  </script>
</body>
</html>`