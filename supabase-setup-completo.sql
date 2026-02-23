-- ================================================
-- TURNOS SÁBADOS - Schema + Planificación Completa
-- Pegar en Supabase → SQL Editor → New Query y ejecutar
-- ================================================

-- 1. Crear tabla
CREATE TABLE IF NOT EXISTS turnos_sabado (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha DATE NOT NULL UNIQUE,
  fisio1_id TEXT NOT NULL,
  fisio2_id TEXT NOT NULL,
  nota TEXT,
  estado TEXT DEFAULT 'planificado' CHECK (estado IN ('planificado', 'modificado', 'ausencia')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos_sabado(fecha);

-- 2. Row Level Security
ALTER TABLE turnos_sabado ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica" ON turnos_sabado;
CREATE POLICY "Lectura publica" ON turnos_sabado
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solo admin puede escribir" ON turnos_sabado;
CREATE POLICY "Solo admin puede escribir" ON turnos_sabado
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_turnos_updated_at ON turnos_sabado;
CREATE TRIGGER trigger_turnos_updated_at
  BEFORE UPDATE ON turnos_sabado
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================
-- 4. Planificación 2026 (45 sábados: Feb→Dic)
--    Rotación de 6 parejas cíclicas
-- ================================================
INSERT INTO turnos_sabado (fecha, fisio1_id, fisio2_id, estado) VALUES
  ('2026-02-21', 'mariana',  'betania',  'planificado'),
  ('2026-02-28', 'blanca',   'samantha', 'planificado'),
  ('2026-03-07', 'blanca',   'betania',  'planificado'),
  ('2026-03-14', 'samantha', 'mariana',  'planificado'),
  ('2026-03-21', 'samantha', 'betania',  'planificado'),
  ('2026-03-28', 'blanca',   'mariana',  'planificado'),
  ('2026-04-04', 'mariana',  'betania',  'planificado'),
  ('2026-04-11', 'blanca',   'samantha', 'planificado'),
  ('2026-04-18', 'blanca',   'betania',  'planificado'),
  ('2026-04-25', 'samantha', 'mariana',  'planificado'),
  ('2026-05-02', 'samantha', 'betania',  'planificado'),
  ('2026-05-09', 'blanca',   'mariana',  'planificado'),
  ('2026-05-16', 'mariana',  'betania',  'planificado'),
  ('2026-05-23', 'blanca',   'samantha', 'planificado'),
  ('2026-05-30', 'blanca',   'betania',  'planificado'),
  ('2026-06-06', 'samantha', 'mariana',  'planificado'),
  ('2026-06-13', 'samantha', 'betania',  'planificado'),
  ('2026-06-20', 'blanca',   'mariana',  'planificado'),
  ('2026-06-27', 'mariana',  'betania',  'planificado'),
  ('2026-07-04', 'blanca',   'samantha', 'planificado'),
  ('2026-07-11', 'blanca',   'betania',  'planificado'),
  ('2026-07-18', 'samantha', 'mariana',  'planificado'),
  ('2026-07-25', 'samantha', 'betania',  'planificado'),
  ('2026-08-01', 'blanca',   'mariana',  'planificado'),
  ('2026-08-08', 'mariana',  'betania',  'planificado'),
  ('2026-08-15', 'blanca',   'samantha', 'planificado'),
  ('2026-08-22', 'blanca',   'betania',  'planificado'),
  ('2026-08-29', 'samantha', 'mariana',  'planificado'),
  ('2026-09-05', 'samantha', 'betania',  'planificado'),
  ('2026-09-12', 'blanca',   'mariana',  'planificado'),
  ('2026-09-19', 'mariana',  'betania',  'planificado'),
  ('2026-09-26', 'blanca',   'samantha', 'planificado'),
  ('2026-10-03', 'blanca',   'betania',  'planificado'),
  ('2026-10-10', 'samantha', 'mariana',  'planificado'),
  ('2026-10-17', 'samantha', 'betania',  'planificado'),
  ('2026-10-24', 'blanca',   'mariana',  'planificado'),
  ('2026-10-31', 'mariana',  'betania',  'planificado'),
  ('2026-11-07', 'blanca',   'samantha', 'planificado'),
  ('2026-11-14', 'blanca',   'betania',  'planificado'),
  ('2026-11-21', 'samantha', 'mariana',  'planificado'),
  ('2026-11-28', 'samantha', 'betania',  'planificado'),
  ('2026-12-05', 'blanca',   'mariana',  'planificado'),
  ('2026-12-12', 'mariana',  'betania',  'planificado'),
  ('2026-12-19', 'blanca',   'samantha', 'planificado'),
  ('2026-12-26', 'blanca',   'betania',  'planificado')
ON CONFLICT (fecha) DO NOTHING;

-- Verificar resultado
SELECT COUNT(*) as total_registros FROM turnos_sabado;
SELECT fecha, fisio1_id, fisio2_id FROM turnos_sabado ORDER BY fecha LIMIT 6;
