import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { generarPlanificacion, getSabadosRestantes, contarTurnosPorFisio, type Fisio } from '@/lib/rotation'
import Link from 'next/link'
import { LogOut, CalendarDays, Users, Settings2 } from 'lucide-react'

async function getData() {
    const supabase = await createClient()

    // Fetch Fisios
    const { data: fisiosData } = await supabase
        .from('fisioterapeutas')
        .select('*')
        .order('created_at', { ascending: true })

    const fisios = fisiosData || []

    try {
        const today = new Date().toISOString().split('T')[0]
        const { data: turnosData } = await supabase
            .from('turnos_sabado')
            .select('*')
            .order('fecha', { ascending: true })

        const turnos = turnosData || []

        if (turnos.length === 0) {
            const sabados = getSabadosRestantes()
            return { turnos: generarPlanificacion(sabados, fisios), fisios }
        }

        return { turnos, fisios }
    } catch {
        const sabados = getSabadosRestantes()
        return { turnos: generarPlanificacion(sabados, fisios), fisios }
    }
}

export default async function AdminDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    const { turnos, fisios } = await getData()
    const conteos = contarTurnosPorFisio(turnos, fisios)

    const today = new Date().toISOString().split('T')[0]
    const turnosFuturos = turnos.filter(t => t.fecha >= today)
    const proximo = turnosFuturos[0]

    return (
        <div className="gradient-bg min-h-screen">
            {/* Header */}
            <div className="px-4 pt-safe" style={{ paddingTop: `max(env(safe-area-inset-top), 12px)` }}>
                <div className="flex items-center justify-between py-3">
                    <div>
                        <h1 className="text-xl font-extrabold text-white">Panel Admin</h1>
                        <p className="text-xs text-gray-400">Gestión de turnos</p>
                    </div>
                    <form action="/api/auth/logout" method="POST">
                        <Link href="/api/auth/logout" className="p-2.5 glass rounded-xl text-gray-400 hover:text-red-400 transition-colors">
                            <LogOut size={18} />
                        </Link>
                    </form>
                </div>
            </div>

            <div className="px-4 pb-8 max-w-md mx-auto space-y-5 mt-2">
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-2xl p-4">
                        <p className="text-xs text-gray-400 mb-1">Sábados restantes</p>
                        <p className="text-3xl font-extrabold text-indigo-400">{turnosFuturos.length}</p>
                    </div>
                    <div className="glass rounded-2xl p-4">
                        <p className="text-xs text-gray-400 mb-1">Próximo sábado</p>
                        {proximo ? (
                            <p className="text-lg font-bold text-white">
                                {new Date(proximo.fecha + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                            </p>
                        ) : <p className="text-gray-500 text-sm">—</p>}
                    </div>
                </div>

                {/* Equidad por fisio */}
                <div className="glass rounded-2xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Turnos por fisio</p>
                    <div className="space-y-3">
                        {fisios.filter(f => f.activa).map(f => {
                            const count = conteos[f.id] || 0
                            const max = Math.max(...Object.values(conteos))
                            const pct = max > 0 ? (count / max) * 100 : 0
                            return (
                                <div key={f.id} className="flex items-center gap-3">
                                    <div className="avatar text-white text-xs" style={{ background: f.color, width: 32, height: 32, fontSize: '0.65rem' }}>
                                        {f.iniciales}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-200">{f.nombre.split(' ')[0]}</span>
                                            <span className="text-sm font-bold text-white">{count}</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, background: f.color }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Quick actions */}
                <div className="space-y-2">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Acciones</p>
                    <Link href="/admin/planificacion" className="glass card-hover rounded-2xl p-4 flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <CalendarDays size={20} className="text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">Planificación</p>
                            <p className="text-gray-400 text-xs">Ver y editar todos los sábados</p>
                        </div>
                        <span className="text-gray-600">›</span>
                    </Link>
                    <Link href="/admin/fisios" className="glass card-hover rounded-2xl p-4 flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                            <Users size={20} className="text-pink-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">Fisioterapeutas</p>
                            <p className="text-gray-400 text-xs">Gestionar equipo</p>
                        </div>
                        <span className="text-gray-600">›</span>
                    </Link>
                    <Link href="/admin/configuracion" className="glass card-hover rounded-2xl p-4 flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Settings2 size={20} className="text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">Configuración</p>
                            <p className="text-gray-400 text-xs">Regenerar planificación, Supabase</p>
                        </div>
                        <span className="text-gray-600">›</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
