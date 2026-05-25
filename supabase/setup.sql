-- ═══════════════════════════════════════════════════════════════════
-- LIBRERÍA MACHY — SVM v2.0 · SETUP COMPLETO DE SUPABASE
-- ═══════════════════════════════════════════════════════════════════
-- 🚀 Cómo usar:
--   1. Ve a https://supabase.com → tu proyecto → SQL Editor
--   2. Pega TODO este contenido
--   3. Ejecuta (no importa si ya hay tablas, todo es IF NOT EXISTS)
-- ═══════════════════════════════════════════════════════════════════

-- ================================================================
-- 1. EXTENSIONES
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- 2. TABLAS (CREATE FIRST para que existan al hacer DROP después)
-- ================================================================

-- 2.1 Categorías (RF-33)
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT DEFAULT '',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Proveedores (RF-34)
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(200) NOT NULL,
  ruc VARCHAR(11) DEFAULT '',
  contacto VARCHAR(100) DEFAULT '',
  telefono VARCHAR(20) DEFAULT '',
  email VARCHAR(100) DEFAULT '',
  direccion TEXT DEFAULT '',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Productos (RF-16 a RF-20)
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT DEFAULT '',
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  categoria VARCHAR(100) DEFAULT '',
  unidad VARCHAR(50) DEFAULT 'unidad',
  precio_compra DECIMAL(10,2) NOT NULL DEFAULT 0,
  precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 5,
  proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
  proveedor VARCHAR(200) DEFAULT '',
  proveedor_nombre VARCHAR(200) DEFAULT '',
  estado VARCHAR(20) DEFAULT 'activo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Usuarios del sistema (RF-06 a RF-09)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  dni VARCHAR(8) UNIQUE DEFAULT '',
  telefono VARCHAR(20) DEFAULT '',
  correo VARCHAR(200) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol VARCHAR(20) DEFAULT 'vendedor',
  turno VARCHAR(20) DEFAULT 'completo',
  activo BOOLEAN DEFAULT TRUE,
  intentos_fallidos INTEGER DEFAULT 0,
  bloqueado_hasta TIMESTAMPTZ DEFAULT NULL,
  ultimo_acceso TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 Ventas (RF-24, RF-26)
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero INTEGER,
  num_comp INTEGER,
  vendedor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  vendedor VARCHAR(200) DEFAULT '',
  items JSONB DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  descuento DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  igv DECIMAL(10,2) NOT NULL DEFAULT 0,
  cliente VARCHAR(200) DEFAULT 'VENTA AL CONTADO',
  cliente_dni VARCHAR(20) DEFAULT '',
  estado VARCHAR(20) DEFAULT 'confirmada',
  boleta BOOLEAN DEFAULT FALSE,
  boleta_generada BOOLEAN DEFAULT FALSE,
  paga_con DECIMAL(10,2) DEFAULT 0,
  vuelto DECIMAL(10,2) DEFAULT 0,
  motivo_anulacion TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Items de venta (detalle)
CREATE TABLE IF NOT EXISTS venta_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venta_id UUID REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  codigo VARCHAR(50) DEFAULT '',
  nombre_producto VARCHAR(200) DEFAULT '',
  categoria VARCHAR(100) DEFAULT '',
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 Asistencia (RF-12, HU-10)
CREATE TABLE IF NOT EXISTS asistencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(200) DEFAULT '',
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada TIME DEFAULT NULL,
  hora_salida TIME DEFAULT NULL,
  turno VARCHAR(20) DEFAULT 'completo',
  horas DECIMAL(5,2) DEFAULT 0,
  tardanza_min INTEGER DEFAULT 0,
  cumple_turno BOOLEAN DEFAULT TRUE,
  estado_asistencia VARCHAR(20) DEFAULT 'puntual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 Logs del sistema (RNF-14)
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nivel VARCHAR(20) DEFAULT 'info',
  modulo VARCHAR(100) DEFAULT '',
  mensaje TEXT NOT NULL,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  contexto JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 Configuración del sistema (RF-32)
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 3. LIMPIEZA SEGURA (tablas ya existen, DROP es seguro ahora)
-- ================================================================
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_productos_updated_at ON productos; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_ventas_updated_at ON ventas; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_categorias_updated_at ON categorias; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_proveedores_updated_at ON proveedores; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_configuracion_updated_at ON configuracion; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_productos_sync_categoria ON productos; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_productos_sync_proveedor ON productos; EXCEPTION WHEN OTHERS THEN NULL; END; $$;

DO $$ BEGIN DROP POLICY IF EXISTS "Productos all anon" ON productos; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Ventas all anon" ON ventas; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP POLICY IF EXISTS "venta_items all anon" ON venta_items; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Usuarios all anon" ON usuarios; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Config all anon" ON configuracion; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Logs all anon" ON logs; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Asistencia all anon" ON asistencia; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Categorías all anon" ON categorias; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
DO $$ BEGIN DROP POLICY IF EXISTS "Proveedores all anon" ON proveedores; EXCEPTION WHEN OTHERS THEN NULL; END; $$;

-- ================================================================
-- 4. COLUMNAS ADICIONALES (para tablas ya existentes)
-- ================================================================
DO $$ BEGIN
  ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE productos ADD COLUMN IF NOT EXISTS proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_minimo INTEGER DEFAULT 5;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE productos ADD COLUMN IF NOT EXISTS proveedor_nombre VARCHAR(200) DEFAULT '';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE ventas ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE ventas ADD COLUMN IF NOT EXISTS num_comp INTEGER;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE ventas ADD COLUMN IF NOT EXISTS paga_con DECIMAL(10,2) DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE ventas ADD COLUMN IF NOT EXISTS vuelto DECIMAL(10,2) DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cliente VARCHAR(200) DEFAULT 'VENTA AL CONTADO';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cliente_dni VARCHAR(20) DEFAULT '';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE ventas ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT DEFAULT '';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS intentos_fallidos INTEGER DEFAULT 0;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellidos TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Asegurar constraints UNIQUE
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categorias_nombre_key') THEN
    ALTER TABLE categorias ADD CONSTRAINT categorias_nombre_key UNIQUE (nombre);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'configuracion_clave_key') THEN
    ALTER TABLE configuracion ADD CONSTRAINT configuracion_clave_key UNIQUE (clave);
  END IF;
END $$;

-- ================================================================
-- 5. ÍNDICES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_estado ON productos(estado);
CREATE INDEX IF NOT EXISTS idx_ventas_vendedor ON ventas(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado);
CREATE INDEX IF NOT EXISTS idx_ventas_created ON ventas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_venta_items_venta ON venta_items(venta_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_usuario ON asistencia(usuario_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_fecha ON asistencia(fecha);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_logs_nivel ON logs(nivel);
CREATE INDEX IF NOT EXISTS idx_logs_modulo ON logs(modulo);

-- ================================================================
-- 6. FUNCIONES
-- ================================================================

-- 6.1 Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- 6.2 Verificar contraseña con pgcrypto (RNF-04)
CREATE OR REPLACE FUNCTION verificar_password(p_password TEXT, p_hash TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN p_hash = crypt(p_password, p_hash); END;
$$;

-- 6.3 Generar hash de contraseña
CREATE OR REPLACE FUNCTION generar_hash_password(p_password TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN RETURN crypt(p_password, gen_salt('bf', 12)); END;
$$;

-- 6.4 Registrar log (RNF-14)
CREATE OR REPLACE FUNCTION registrar_log(
  p_nivel TEXT, p_modulo TEXT, p_mensaje TEXT,
  p_usuario_id UUID DEFAULT NULL, p_contexto JSONB DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE log_id UUID;
BEGIN
  INSERT INTO logs (nivel, modulo, mensaje, usuario_id, contexto)
  VALUES (p_nivel, p_modulo, p_mensaje, p_usuario_id, p_contexto)
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$;

-- 6.5 Registrar entrada de asistencia
CREATE OR REPLACE FUNCTION registrar_entrada(
  p_usuario_id UUID, p_turno TEXT, p_nombre TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE asistencia_id UUID;
BEGIN
  INSERT INTO asistencia (usuario_id, nombre, fecha, hora_entrada, turno)
  VALUES (p_usuario_id, p_nombre, CURRENT_DATE, CURRENT_TIME, p_turno)
  RETURNING id INTO asistencia_id;
  RETURN asistencia_id;
END;
$$;

-- 6.6 Registrar salida de asistencia
CREATE OR REPLACE FUNCTION registrar_salida(p_usuario_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE asistencia SET hora_salida = CURRENT_TIME
  WHERE usuario_id = p_usuario_id AND fecha = CURRENT_DATE AND hora_salida IS NULL;
END;
$$;

-- 6.7 Incrementar intentos fallidos (RF-01)
CREATE OR REPLACE FUNCTION incrementar_intentos_fallidos(p_username TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  usuario RECORD;
  max_intentos INTEGER := 5;
  bloqueo_min INTEGER := 15;
BEGIN
  SELECT * INTO usuario FROM usuarios WHERE username = p_username;
  IF usuario.id IS NULL THEN RETURN jsonb_build_object('error', 'Usuario no encontrado'); END IF;
  UPDATE usuarios SET
    intentos_fallidos = COALESCE(intentos_fallidos, 0) + 1,
    bloqueado_hasta = CASE WHEN COALESCE(intentos_fallidos, 0) + 1 >= max_intentos
      THEN NOW() + (bloqueo_min || ' minutes')::INTERVAL ELSE NULL END
  WHERE id = usuario.id;
  RETURN jsonb_build_object('intentos_fallidos', COALESCE(usuario.intentos_fallidos, 0) + 1);
END;
$$;

-- 6.8 Resetear intentos fallidos
CREATE OR REPLACE FUNCTION reset_intentos_fallidos(p_usuario_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_acceso = NOW()
  WHERE id = p_usuario_id;
END;
$$;

-- 6.9 Obtener KPIs del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_kpis()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'productos_activos', (SELECT COUNT(*) FROM productos WHERE estado = 'activo'),
    'productos_descontinuados', (SELECT COUNT(*) FROM productos WHERE estado = 'descontinuado'),
    'alertas_stock', (SELECT COUNT(*) FROM productos WHERE estado = 'activo' AND stock <= stock_minimo),
    'valor_inventario', (SELECT COALESCE(SUM(precio_venta * stock), 0) FROM productos WHERE estado = 'activo'),
    'ventas_hoy', (SELECT COUNT(*) FROM ventas WHERE estado = 'confirmada' AND created_at::date = CURRENT_DATE),
    'ventas_totales', (SELECT COUNT(*) FROM ventas WHERE estado = 'confirmada'),
    'ingresos_totales', (SELECT COALESCE(SUM(total), 0) FROM ventas WHERE estado = 'confirmada'),
    'empleados_activos', (SELECT COUNT(*) FROM usuarios WHERE activo = TRUE AND rol = 'vendedor')
  ) INTO result;
  RETURN result;
END;
$$;

-- ================================================================
-- 7. TRIGGERS
-- ================================================================
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_productos_updated_at ON productos; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
CREATE TRIGGER trg_productos_updated_at
  BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_ventas_updated_at ON ventas; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
CREATE TRIGGER trg_ventas_updated_at
  BEFORE UPDATE ON ventas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_categorias_updated_at ON categorias; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
CREATE TRIGGER trg_categorias_updated_at
  BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_proveedores_updated_at ON proveedores; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
CREATE TRIGGER trg_proveedores_updated_at
  BEFORE UPDATE ON proveedores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DO $$ BEGIN DROP TRIGGER IF EXISTS trg_configuracion_updated_at ON configuracion; EXCEPTION WHEN OTHERS THEN NULL; END; $$;
CREATE TRIGGER trg_configuracion_updated_at
  BEFORE UPDATE ON configuracion FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- 8. ROW LEVEL SECURITY (RLS) — ANON-FRIENDLY
-- ================================================================
-- La seguridad se maneja a nivel de aplicación (variable CU en app.js)
-- auth.role() = 'anon' porque el frontend usa anon key sin Supabase Auth

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Productos all anon" ON productos
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Ventas all anon" ON ventas
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (auth.role() = 'anon');
CREATE POLICY "venta_items all anon" ON venta_items
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Usuarios all anon" ON usuarios
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Asistencia all anon" ON asistencia
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Categorías all anon" ON categorias
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Proveedores all anon" ON proveedores
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Logs all anon" ON logs
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Config all anon" ON configuracion
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (auth.role() = 'anon');

-- ================================================================
-- 9. DATOS INICIALES (SEED) — idempotente
-- ================================================================

-- 9.1 Configuración inicial
INSERT INTO configuracion (clave, valor, tipo) VALUES
  ('nombre_negocio', 'Librería Machy', 'text'),
  ('ruc', '20XXXXXXXXXX', 'text'),
  ('direccion', 'Av. Principal 123, Lima, Perú', 'text'),
  ('telefono', '01-XXXXXXX', 'text'),
  ('correo', 'contacto@libreriamachy.com', 'text'),
  ('igv', '18', 'number'),
  ('monto_minimo_boleta', '5.00', 'number'),
  ('stock_minimo_global', '5', 'number'),
  ('descuento_max_vendedor', '10', 'number'),
  ('zona_horaria', 'America/Lima', 'text'),
  ('inactividad_minutos', '30', 'number')
ON CONFLICT (clave) DO NOTHING;

-- 9.2 Categorías por defecto
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Útiles escolares', 'Lápices, cuadernos, mochilas, etc.'),
  ('Papelería', 'Papel, sobres, cartulinas, etc.'),
  ('Libros', 'Textos escolares, literatura, etc.'),
  ('Manualidades', 'Témperas, plastilina, acuarelas, etc.'),
  ('Juguetes', 'Rompecabezas, bloques, etc.'),
  ('Otros', 'Productos no categorizados')
ON CONFLICT (nombre) DO NOTHING;

-- 9.3 Usuarios demo
-- Passwords: admin=admin123, vendedor=vend123, miguel=vend456
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'admin') THEN
    INSERT INTO usuarios (nombre, apellidos, dni, telefono, correo, username, password_hash, rol, turno)
    VALUES ('Jhon', 'Taipe', '12345678', '999001001', 'jhon@machy.com', 'admin',
      (SELECT generar_hash_password('admin123')), 'admin', 'completo');
  ELSE
    UPDATE usuarios SET nombre = 'Jhon', apellidos = 'Taipe',
      correo = 'jhon@machy.com', dni = '12345678', telefono = '999001001'
    WHERE username = 'admin' AND (nombre != 'Jhon' OR apellidos != 'Taipe');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'vendedor') THEN
    INSERT INTO usuarios (nombre, apellidos, dni, telefono, correo, username, password_hash, rol, turno)
    VALUES ('Ana', 'Flores', '87654321', '999001002', 'ana@machy.com', 'vendedor',
      (SELECT generar_hash_password('vend123')), 'vendedor', 'manana');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'miguel') THEN
    INSERT INTO usuarios (nombre, apellidos, dni, telefono, correo, username, password_hash, rol, turno)
    VALUES ('Miguel', 'Torres', '11223344', '999001003', 'miguel@machy.com', 'miguel',
      (SELECT generar_hash_password('vend456')), 'vendedor', 'tarde');
  END IF;
END;
$$;

-- ================================================================
-- 🎉 LISTO — El sistema está configurado correctamente.
-- ================================================================

