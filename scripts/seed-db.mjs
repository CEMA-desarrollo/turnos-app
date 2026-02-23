/**
 * seed-db.mjs
 * Crea la tabla turnos_sabado en Supabase y siembra la planificación
 * completa desde el primer sábado del ciclo hasta dic 2026.
 *
 * Uso: node scripts/seed-db.mjs
 */

const SUPABASE_URL = 'https://kqsfgfueyodzfrwxmtfx.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxc2ZnZnVleW9kemZyd3htdGZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTYxMTc5MSwiZXhwIjoyMDg3MTg3NzkxfQ.A4-A-QSzkorojTxFOVz3hJVxiTPj8IONwOYOHSkDWpc'

// ── Configuración ─────────────────────────────────────────────────────────────

// 6 parejas rotativas (mismo orden que la app)
const PAREJAS = [
    ['mariana', 'betania'],   // 1
    ['blanca', 'samantha'],  // 2
    ['blanca', 'betania'],   // 3
    ['samantha', 'mariana'],   // 4
    ['samantha', 'betania'],   // 5
    ['blanca', 'mariana'],   // 6
]

// Primer sábado del ciclo (21 Feb 2026 según el walkthrough)
const INICIO = new Date('2026-02-21')
const FIN = new Date('2026-12-31')

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSabados(desde, hasta) {
    const sabados = []
    // Asegurarse de arrancar en sábado
    let d = new Date(desde)
    // día 6 = sábado
    while (d.getDay() !== 6) d = new Date(d.getTime() + 86400000)

    while (d <= hasta) {
        sabados.push(d.toISOString().split('T')[0])
        d = new Date(d.getTime() + 7 * 86400000)
    }
    return sabados
}

function generarPlanificacion(sabados) {
    return sabados.map((fecha, i) => {
        const [fisio1_id, fisio2_id] = PAREJAS[i % PAREJAS.length]
        return { fecha, fisio1_id, fisio2_id, estado: 'planificado', nota: null }
    })
}

async function supabaseFetch(path, options = {}) {
    const res = await fetch(`${SUPABASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'Prefer': 'return=minimal',
            ...(options.headers || {}),
        },
    })
    return res
}

// ── Ejecutar SQL via Management API ──────────────────────────────────────────

async function ejecutarSQL(sql) {
    // Supabase permite ejecutar SQL raw via la Management API
    const res = await fetch(`https://api.supabase.com/v1/projects/kqsfgfueyodzfrwxmtfx/database/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
    })

    if (!res.ok) {
        const text = await res.text()
        // Si falla la management API, intentamos via postgrest RPC
        return null
    }
    return await res.json()
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🚀 Iniciando seed de Supabase...\n')

    // 1. Crear tabla si no existe
    console.log('📦 Creando tabla turnos_sabado...')

    const schema = `
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

    ALTER TABLE turnos_sabado ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Lectura publica" ON turnos_sabado;
    CREATE POLICY "Lectura publica" ON turnos_sabado
      FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Solo admin puede escribir" ON turnos_sabado;
    CREATE POLICY "Solo admin puede escribir" ON turnos_sabado
      FOR ALL USING (auth.role() = 'authenticated');

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
  `

    const sqlResult = await ejecutarSQL(schema)
    if (sqlResult === null) {
        console.log('⚠️  Management API no disponible — la tabla debe existir ya o se creará manualmente.')
        console.log('   Continuando con inserción de datos...\n')
    } else {
        console.log('✅ Schema creado correctamente\n')
    }

    // 2. Generar planificación desde el inicio del ciclo
    const sabados = getSabados(INICIO, FIN)
    const turnos = generarPlanificacion(sabados)

    console.log(`📅 Generando ${turnos.length} sábados (${sabados[0]} → ${sabados[sabados.length - 1]})`)

    // Mostrar preview
    console.log('\nPreview de los primeros 6:')
    turnos.slice(0, 6).forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.fecha} → ${t.fisio1_id} + ${t.fisio2_id}`)
    })
    console.log('')

    // 3. Insertar en Supabase (upsert por fecha para que sea idempotente)
    console.log('💾 Insertando en Supabase...')

    // Insertar en bloques de 50
    const CHUNK = 50
    let insertados = 0

    for (let i = 0; i < turnos.length; i += CHUNK) {
        const batch = turnos.slice(i, i + CHUNK)

        const res = await supabaseFetch('/rest/v1/turnos_sabado', {
            method: 'POST',
            headers: {
                'Prefer': 'resolution=merge-duplicates,return=minimal',
                'on_conflict': 'fecha',
            },
            body: JSON.stringify(batch),
        })

        if (!res.ok) {
            const err = await res.text()
            console.error(`❌ Error en batch ${i}-${i + CHUNK}:`, err)

            // Si la tabla no existe, mostrar instrucciones
            if (err.includes('does not exist') || err.includes('relation')) {
                console.error('\n⚠️  La tabla no existe. Seguí estos pasos:')
                console.error('1. Ve a https://supabase.com/dashboard/project/kqsfgfueyodzfrwxmtfx/sql/new')
                console.error('2. Pega el contenido de supabase-schema.sql')
                console.error('3. Ejecuta el SQL')
                console.error('4. Volvé a correr este script\n')
            }
            process.exit(1)
        }

        insertados += batch.length
        process.stdout.write(`\r   Progreso: ${insertados}/${turnos.length} registros`)
    }

    console.log(`\n\n✅ ¡Listo! ${insertados} sábados guardados en Supabase.`)
    console.log('\n📋 Próximos pasos:')
    console.log('   1. Crear usuario admin en Supabase → Authentication → Users → Add User')
    console.log('   2. Abrir la app y verificar que los turnos aparecen correctamente')
    console.log('   3. Iniciar sesión en /admin y editar si hace falta\n')
}

main().catch(err => {
    console.error('Error fatal:', err)
    process.exit(1)
})
