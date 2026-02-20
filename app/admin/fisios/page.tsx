'use client'

import { useEffect, useState } from 'react'
import { FISIOS, getFisioById } from '@/lib/rotation'
import { ArrowLeft, UserCheck, UserX } from 'lucide-react'
import Link from 'next/link'

export default function FisiosPage() {
    const [stats, setStats] = useState<Record<string, number>>({})

    // In a full implementation this reads from Supabase
    // For now, show static info with team data
    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-lg border-b border-white/5 px-4" style={{ paddingTop: `max(env(safe-area-inset-top), 12px)` }}>
                <div className="flex items-center gap-3 py-3">
                    <Link href="/admin" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-white">Fisioterapeutas</h1>
                        <p className="text-xs text-gray-400">Equipo activo</p>
                    </div>
                </div>
            </div>

            <div className="px-4 mt-4 max-w-md mx-auto space-y-3">
                {FISIOS.map((f, i) => (
                    <div key={f.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                        <div
                            className="avatar text-white shadow-lg flex-shrink-0"
                            style={{ background: f.color, boxShadow: `0 4px 16px ${f.color}44`, width: 48, height: 48, fontSize: '0.85rem' }}
                        >
                            {f.iniciales}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold text-sm">{f.nombre}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <UserCheck size={12} className="text-emerald-400" />
                                <span className="text-xs text-emerald-400">Activa</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ background: f.color }}
                            />
                        </div>
                    </div>
                ))}

                <div className="glass rounded-2xl p-4 mt-4">
                    <p className="text-xs text-gray-400 mb-2">ℹ️ Información</p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Las 4 fisioterapeutas están activas y se rotan en 6 combinaciones de parejas posibles.
                        Cada una trabaja aproximadamente el 50% de los sábados del año.
                    </p>
                </div>
            </div>
        </div>
    )
}
