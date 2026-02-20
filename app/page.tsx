import { createClient } from '@/lib/supabase/server'
import { generarPlanificacion, getSabadosRestantes, FISIOS, contarTurnosPorFisio } from '@/lib/rotation'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import TurnoCard from '@/components/TurnoCard'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import { Settings } from 'lucide-react'

async function getTurnos() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('turnos_sabado')
      .select('*')
      .gte('fecha', new Date().toISOString().split('T')[0])
      .order('fecha', { ascending: true })
      .limit(20)
    return data || []
  } catch {
    // Fallback: generate from algorithm if DB not set up yet
    const sabados = getSabadosRestantes()
    return generarPlanificacion(sabados).slice(0, 20)
  }
}

export default async function HomePage() {
  const turnos = await getTurnos()
  const proximo = turnos[0]
  const siguientes = turnos.slice(1, 10)

  return (
    <div className="gradient-bg min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 pt-safe" style={{ paddingTop: `max(env(safe-area-inset-top), 12px)` }}>
        <div className="flex items-center justify-between py-3">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Turnos Sábados</h1>
            <p className="text-xs text-gray-400">Fisioterapia</p>
          </div>
          <Link href="/admin/login" className="p-2.5 glass rounded-xl text-gray-400 hover:text-white transition-colors">
            <Settings size={18} />
          </Link>
        </div>
      </div>

      <div className="px-4 pt-2 space-y-6 max-w-md mx-auto">
        {/* Team Banner */}
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Equipo</p>
          <div className="grid grid-cols-2 gap-2">
            {FISIOS.map(f => (
              <div key={f.id} className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2">
                <div className="avatar text-white text-xs" style={{ background: f.color, width: 32, height: 32, fontSize: '0.65rem' }}>
                  {f.iniciales}
                </div>
                <span className="text-sm text-gray-200 font-medium leading-tight">{f.nombre.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Próximo sábado */}
        {proximo && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">Próximo sábado</p>
            <TurnoCard
              fecha={proximo.fecha}
              fisio1_id={proximo.fisio1_id}
              fisio2_id={proximo.fisio2_id}
              nota={(proximo as any).nota}
              isNext
            />
          </div>
        )}

        {/* Siguientes turnos */}
        {siguientes.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">Próximas fechas</p>
            <div className="space-y-2">
              {siguientes.map((t: any) => (
                <TurnoCard
                  key={t.fecha}
                  fecha={t.fecha}
                  fisio1_id={t.fisio1_id}
                  fisio2_id={t.fisio2_id}
                  nota={t.nota}
                  compact
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  )
}
