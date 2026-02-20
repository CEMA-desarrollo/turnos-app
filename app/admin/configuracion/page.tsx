'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generarPlanificacion, getSabadosRestantes } from '@/lib/rotation'
import { ArrowLeft, RefreshCw, Info } from 'lucide-react'
import Link from 'next/link'

export default function ConfiguracionPage() {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null)

    async function regenerar() {
        setLoading(true)
        const supabase = createClient()
        const sabados = getSabadosRestantes()
        const planificacion = generarPlanificacion(sabados)

        // Delete existing and reinsert
        const today = new Date().toISOString().split('T')[0]
        await supabase.from('turnos_sabado').delete().gte('fecha', today).eq('estado', 'planificado')

        const { error } = await supabase.from('turnos_sabado').upsert(
            planificacion.map(t => ({ ...t, estado: 'planificado' })),
            { onConflict: 'fecha' }
        )

        if (error) {
            setMsg({ text: 'Error: ' + error.message, type: 'err' })
        } else {
            setMsg({ text: `✓ ${planificacion.length} sábados regenerados correctamente`, type: 'ok' })
        }
        setLoading(false)
        setTimeout(() => setMsg(null), 5000)
    }

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-lg border-b border-white/5 px-4" style={{ paddingTop: `max(env(safe-area-inset-top), 12px)` }}>
                <div className="flex items-center gap-3 py-3">
                    <Link href="/admin" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-white">Configuración</h1>
                        <p className="text-xs text-gray-400">Planificación y sistema</p>
                    </div>
                </div>
            </div>

            <div className="px-4 mt-4 max-w-md mx-auto space-y-4">
                {msg && (
                    <div className={`rounded-xl px-4 py-3 text-sm font-medium ${msg.type === 'ok' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                        {msg.text}
                    </div>
                )}

                {/* Regenerar planificación */}
                <div className="glass rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <RefreshCw size={20} className="text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-sm">Regenerar planificación</h3>
                            <p className="text-xs text-gray-400">Recalcula todos los sábados desde hoy</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 bg-amber-500/10 rounded-xl px-3 py-2.5">
                        <Info size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-300">
                            Solo reemplaza los turnos en estado "planificado". Los turnos modificados manualmente se conservan.
                        </p>
                    </div>
                    <button
                        onClick={regenerar}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all text-sm"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Regenerando...' : 'Regenerar ahora'}
                    </button>
                </div>

                {/* Info del algoritmo */}
                <div className="glass rounded-2xl p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Algoritmo de rotación</p>
                    <div className="space-y-2 text-xs text-gray-300">
                        <p>🔄 <strong className="text-white">6 combinaciones de parejas</strong> rotan cíclicamente</p>
                        <p>⚖️ Cada fisio trabaja aprox. <strong className="text-white">50%</strong> de los sábados</p>
                        <p>👥 Ninguna pareja se repite consecutivamente</p>
                        <p>📅 Planificación hasta <strong className="text-white">31 dic 2026</strong></p>
                    </div>
                </div>
            </div>
        </div>
    )
}
