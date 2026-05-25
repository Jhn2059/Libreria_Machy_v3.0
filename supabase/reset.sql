-- ═══════════════════════════════════════════════════════════════════
-- LIBRERÍA MACHY — RESET COMPLETO (TODO → CERO)
-- ═══════════════════════════════════════════════════════════════════
-- ⚠️  ESTO ELIMINA TODAS LAS TABLAS, FUNCIONES, TIPOS Y DATOS
-- ⚠️  Después de ejecutar esto, corre setup.sql para recrear todo
-- ═══════════════════════════════════════════════════════════════════

-- 1. Políticas RLS
DROP POLICY IF EXISTS "Productos all anon" ON productos;
DROP POLICY IF EXISTS "Ventas all anon" ON ventas;
DROP POLICY IF EXISTS "venta_items all anon" ON venta_items;
DROP POLICY IF EXISTS "Usuarios all anon" ON usuarios;
DROP POLICY IF EXISTS "Config all anon" ON configuracion;
DROP POLICY IF EXISTS "Logs all anon" ON logs;
DROP POLICY IF EXISTS "Asistencia all anon" ON asistencia;
DROP POLICY IF EXISTS "Categorías all anon" ON categorias;
DROP POLICY IF EXISTS "Proveedores all anon" ON proveedores;
DROP POLICY IF EXISTS "Productos escritura admin" ON productos;
DROP POLICY IF EXISTS "Productos update admin" ON productos;
DROP POLICY IF EXISTS "Ventas insert authenticated" ON ventas;
DROP POLICY IF EXISTS "Ventas select own or admin" ON ventas;
DROP POLICY IF EXISTS "venta_items insert authenticated" ON venta_items;
DROP POLICY IF EXISTS "Usuarios login anon" ON usuarios;
DROP POLICY IF EXISTS "Config select anon" ON configuracion;
DROP POLICY IF EXISTS "Config insert auth" ON configuracion;
DROP POLICY IF EXISTS "Config update auth" ON configuracion;
DROP POLICY IF EXISTS "Logs insert auth" ON logs;
DROP POLICY IF EXISTS "Productos lectura pública activos" ON productos;
DROP POLICY IF EXISTS "Categorías lectura pública activas" ON categorias;
DROP POLICY IF EXISTS "Proveedores lectura pública activos" ON proveedores;
DROP POLICY IF EXISTS "Productos lectura pública" ON productos;
DROP POLICY IF EXISTS "Categorías lectura pública" ON categorias;
DROP POLICY IF EXISTS "Proveedores lectura pública" ON proveedores;

-- 2. Triggers
DROP TRIGGER IF EXISTS trg_productos_updated_at ON productos;
DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
DROP TRIGGER IF EXISTS trg_ventas_updated_at ON ventas;
DROP TRIGGER IF EXISTS trg_categorias_updated_at ON categorias;
DROP TRIGGER IF EXISTS trg_proveedores_updated_at ON proveedores;
DROP TRIGGER IF EXISTS trg_configuracion_updated_at ON configuracion;
DROP TRIGGER IF EXISTS trg_productos_sync_categoria ON productos;
DROP TRIGGER IF EXISTS trg_productos_sync_proveedor ON productos;

-- 3. Funciones (con y sin tipos enum, para cubrir ambos casos)
DROP FUNCTION IF EXISTS verificar_password(TEXT, TEXT);
DROP FUNCTION IF EXISTS generar_hash_password(TEXT);
DROP FUNCTION IF EXISTS registrar_log(TEXT, TEXT, TEXT, UUID, JSONB);
DROP FUNCTION IF EXISTS registrar_log(nivel_log, VARCHAR, TEXT, UUID, JSONB);
DROP FUNCTION IF EXISTS registrar_entrada(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS registrar_entrada(UUID, turno_laboral, VARCHAR);
DROP FUNCTION IF EXISTS registrar_salida(UUID);
DROP FUNCTION IF EXISTS incrementar_intentos_fallidos(TEXT);
DROP FUNCTION IF EXISTS reset_intentos_fallidos(UUID);
DROP FUNCTION IF EXISTS get_dashboard_kpis();
DROP FUNCTION IF EXISTS get_stock_alerts(INTEGER);
DROP FUNCTION IF EXISTS get_ventas_por_periodo(DATE, DATE);
DROP FUNCTION IF EXISTS get_top_productos(INTEGER, DATE, DATE);
DROP FUNCTION IF EXISTS get_asistencia_semanal(DATE);
DROP FUNCTION IF EXISTS get_dashboard_data();
DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS sync_categoria_texto();
DROP FUNCTION IF EXISTS sync_proveedor_texto();
DROP FUNCTION IF EXISTS log_error_trigger();

-- 4. Tablas (orden inverso por foreign keys)
DROP TABLE IF EXISTS venta_items CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS asistencia CASCADE;
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS configuracion CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;

-- 5. Tipos enum
DROP TYPE IF EXISTS rol_usuario;
DROP TYPE IF EXISTS turno_laboral;
DROP TYPE IF EXISTS estado_producto;
DROP TYPE IF EXISTS estado_venta;
DROP TYPE IF EXISTS estado_asistencia;
DROP TYPE IF EXISTS nivel_log;

-- ═══════════════════════════════════════════════════════════════════
-- ✅ TODO ELIMINADO · Ahora ejecuta setup.sql para recrear
-- ═══════════════════════════════════════════════════════════════════
