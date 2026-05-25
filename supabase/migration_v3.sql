-- ═══════════════════════════════════════════════════════════════════
-- LIBRERÍA MACHY — SVM v3.0 · MIGRACIÓN ESCÁNER REMOTO
-- ═══════════════════════════════════════════════════════════════════
-- 1. Crear tabla scan_sessions para escaneo remoto vía Supabase Realtime
-- 2. Habilitar Realtime para la tabla (se hace desde Dashboard)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scan_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  code TEXT DEFAULT NULL,
  usuario_id TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_scan_sessions_session ON scan_sessions(session_id);

-- Habilitar RLS
ALTER TABLE scan_sessions ENABLE ROW LEVEL SECURITY;

-- Policy anon-friendly (igual que las demás tablas)
DO $$ BEGIN
  DROP POLICY IF EXISTS "scan_sessions all anon" ON scan_sessions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "scan_sessions all anon" ON scan_sessions
  FOR ALL USING (auth.role() = 'anon') WITH CHECK (auth.role() = 'anon');

-- ⚠️ IMPORTANTE: Después de ejecutar este SQL, ve a:
--    Supabase Dashboard → Database → Replication
--    y habilita Realtime para la tabla "scan_sessions"
--    (evento: INSERT, schema: public, tabla: scan_sessions)
