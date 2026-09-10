-- ============================================================================
-- OLYMPICUS · Sistema de Inventario y Ventas
-- Migración 001 (Neon / PostgreSQL serverless)
-- Tablas, función transaccional crear_venta y datos de ejemplo.
-- Ejecutar con: npm run migrate   (o pegar completo en el SQL Editor de Neon)
-- ============================================================================

-- ============================ TABLAS ========================================

create table if not exists public.productos (
  id          bigint generated always as identity primary key,
  nombre      text not null check (char_length(trim(nombre)) > 0),
  descripcion text,
  precio      numeric(10,2) not null check (precio >= 0),
  stock       integer not null default 0 check (stock >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.ventas (
  id         bigint generated always as identity primary key,
  total      numeric(12,2) not null check (total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.venta_detalles (
  id              bigint generated always as identity primary key,
  venta_id        bigint not null references public.ventas(id) on delete cascade,
  producto_id     bigint not null references public.productos(id),
  cantidad        integer not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null check (precio_unitario >= 0)
);

create index if not exists idx_venta_detalles_producto on public.venta_detalles(producto_id);

-- ============================ FUNCIÓN TRANSACCIONAL =========================
-- Valida stock (bloqueo FOR UPDATE), inserta venta + detalles y descuenta
-- inventario de forma atómica. Devuelve el comprobante en JSON.
create or replace function public.crear_venta(p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_venta_id bigint;
  v_total    numeric(12,2) := 0;
  v_item     record;
  v_precio   numeric(10,2);
  v_stock    integer;
  v_resumen  jsonb;
begin
  -- 1) Validar y bloquear stock de cada producto
  for v_item in
    select (x ->> 'producto_id')::bigint as producto_id,
           (x ->> 'cantidad')::integer  as cantidad
      from jsonb_array_elements(p_items) x
  loop
    if v_item.producto_id is null or v_item.cantidad is null then
      raise exception using errcode = '22000', message = 'PRODUCTO_INEXISTENTE',
                            detail = 'Cada ítem debe indicar producto_id y cantidad';
    end if;

    if v_item.cantidad <= 0 then
      raise exception using errcode = '22000', message = 'CANTIDAD_INVALIDA',
                            detail = 'La cantidad debe ser mayor a 0';
    end if;

    select precio, stock into v_precio, v_stock
      from public.productos
     where id = v_item.producto_id
       for update;

    if not found then
      raise exception using errcode = '22000', message = 'PRODUCTO_INEXISTENTE',
                            detail = 'Producto con id ' || v_item.producto_id || ' no existe';
    end if;

    if v_stock < v_item.cantidad then
      raise exception using errcode = '22000', message = 'STOCK_INSUFICIENTE',
                            detail = 'Stock disponible: ' || v_stock;
    end if;

    v_total := v_total + (v_precio * v_item.cantidad);
  end loop;

  -- 2) Insertar cabecera de venta
  insert into public.ventas (total) values (v_total)
    returning id into v_venta_id;

  -- 3) Insertar detalle y descontar inventario
  for v_item in
    select (x ->> 'producto_id')::bigint as producto_id,
           (x ->> 'cantidad')::integer  as cantidad
      from jsonb_array_elements(p_items) x
  loop
    select precio into v_precio from public.productos where id = v_item.producto_id;

    insert into public.venta_detalles (venta_id, producto_id, cantidad, precio_unitario)
    values (v_venta_id, v_item.producto_id, v_item.cantidad, v_precio);

    update public.productos
       set stock      = stock - v_item.cantidad,
           updated_at = now()
     where id = v_item.producto_id;
  end loop;

  -- 4) Devolver comprobante
  select jsonb_build_object(
           'id',         v.id,
           'total',      v.total::float8,
           'created_at', v.created_at,
           'items', (
             select coalesce(jsonb_agg(
                      jsonb_build_object(
                        'producto_id',     det.producto_id,
                        'cantidad',        det.cantidad,
                        'precio_unitario', det.precio_unitario::float8
                      ) order by det.id), '[]'::jsonb)
               from public.venta_detalles det
              where det.venta_id = v.id
           )
         )
    into v_resumen
    from public.ventas v
   where v.id = v_venta_id;

  return v_resumen;
end;
$$;

-- ============================ DATOS DE EJEMPLO ==============================
insert into public.productos (nombre, descripcion, precio, stock)
select v.nombre, v.descripcion, v.precio, v.stock
  from (values
    ('Smart TV 50" 4K',        'Televisor LED 4K UltraHD con HDR', 5499.99, 20),
    ('Auriculares Bluetooth',  'Inalámbricos con cancelación de ruido', 899.90, 35),
    ('Teclado mecánico RGB',   'Switches red con retroiluminación RGB', 1249.50, 12),
    ('Mouse ergonómico',       'Inalámbrico con sensor de 4000 DPI', 349.00, 50)
  ) as v(nombre, descripcion, precio, stock)
 where not exists (select 1 from public.productos);