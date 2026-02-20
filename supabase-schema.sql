-- ================================================
-- TURNOS SÁBADOS - Supabase SQL Schema
-- Ejecuta esto en el SQL Editor de tu proyecto Supabase
-- ================================================

-- Tabla de turnos de sábado
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

-- Índice para consultas por fecha
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos_sabado(fecha);

-- Habilitar Row Level Security
ALTER TABLE turnos_sabado ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede leer (vista pública del calendario)
CREATE POLICY "Lectura pública" ON turnos_sabado
  FOR SELECT USING (true);

-- Política: solo usuarios autenticados pueden modificar
CREATE POLICY "Solo admin puede escribir" ON turnos_sabado
  FOR ALL USING (auth.role() = 'authenticated');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_turnos_updated_at
  BEFORE UPDATE ON turnos_sabado
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
