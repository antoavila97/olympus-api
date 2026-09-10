export const docConfig = {
  openapi: '3.0.3',
  info: {
    title: 'API OLYMPICUS — Sistema de Inventario y Ventas',
    version: '1.0.0',
    description:
      'API RESTful para la gestión de productos y stock en tiempo real, ' +
      'documentada con el estándar OpenAPI. Incluye CRUD de catálogo y un endpoint ' +
      'transaccional de ventas que descuenta inventario de forma atómica.',
  },
  servers: [{ url: '/' }],
}