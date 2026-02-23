-- ================================================
-- TABLA FISIOTERAPEUTAS
-- Pegar en Supabase → SQL Editor → New Query y ejecutar
-- ================================================

CREATE TABLE IF NOT EXISTS fisioterapeutas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  iniciales TEXT NOT NULL,
  color TEXT NOT NULL,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE fisioterapeutas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura publica fisios" ON fisioterapeutas;
CREATE POLICY "Lectura publica fisios" ON fisioterapeutas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solo admin puede escribir fisios" ON fisioterapeutas;
CREATE POLICY "Solo admin puede escribir fisios" ON fisioterapeutas
  FOR ALL USING (auth.role() = 'authenticated');

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_fisios_updated_at ON fisioterapeutas;
CREATE TRIGGER trigger_fisios_updated_at
  BEFORE UPDATE ON fisioterapeutas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insertar las fisioterapeutas iniciales
INSERT INTO fisioterapeutas (id, nombre, iniciales, color, activa) VALUES
  ('blanca', 'Blanca Antonelli', 'BA', '#cc0b0b', true),
  ('samantha', 'Samantha Pineda', 'SP', '#00b11f', true),
  ('mariana', 'Mariana Bravo', 'MB', '#01cebc', true),
  ('betania', 'Betania Garcia', 'BG', '#da7a00', true)
ON CONFLICT (id) DO UPDATE SET color = EXCLUDED.color;
