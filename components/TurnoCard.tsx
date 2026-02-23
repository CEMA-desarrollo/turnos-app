'use client'

import { getFisioById, type Fisio } from '@/lib/rotation'
import { format, parseISO, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

interface TurnoCardProps {
    fecha: string
    fisio1_id: string
    fisio2_id: string
    nota?: string | null
    compact?: boolean
    isNext?: boolean
    fisios: Fisio[]
}

export default function TurnoCard({ fecha, fisio1_id, fisio2_id, nota, compact, isNext, fisios }: TurnoCardProps) {
    const fisio1 = getFisioById(fisios, fisio1_id)
    const fisio2 = getFisioById(fisios, fisio2_id)
    const date = parseISO(fecha)
    const dayNum = format(date, 'd')
    const month = format(date, 'MMM', { locale: es })
    const year = format(date, 'yyyy')

    if (compact) {
        return (
            <div className="glass card-hover flex items-center gap-3 p-3 rounded-xl">
                <div className="text-center min-w-[44px]">
                    <div className="text-lg font-bold text-white leading-none">{dayNum}</div>
                    <div className="text-xs text-gray-400 uppercase">{month}</div>
                </div>
                <div className="flex gap-2 flex-1">
                    {[fisio1, fisio2].map(f => f && (
                        <div
                            key={f.id}
                            className="avatar text-white text-xs"
                            style={{ background: f.color, width: 32, height: 32, fontSize: '0.7rem' }}
                            title={f.nombre}
                        >
                            {f.iniciales}
                        </div>
                    ))}
                    <div className="flex flex-col justify-center">
                        <div className="text-sm font-medium text-white">{fisio1?.nombre.split(' ')[0]} & {fisio2?.nombre.split(' ')[0]}</div>
                        {nota && <div className="text-xs text-amber-400">{nota}</div>}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`glass card-hover rounded-2xl p-5 relative overflow-hidden ${isNext ? 'border border-indigo-500/40' : ''}`}>
            {isNext && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-indigo-500/20 rounded-full px-2.5 py-1">
                    <span className="pulse-dot w-2 h-2 bg-indigo-400 rounded-full inline-block"></span>
                    <span className="text-xs text-indigo-300 font-medium">Próximo</span>
                </div>
            )}
            <div className="flex items-start gap-4">
                <div className="bg-indigo-500/10 rounded-xl px-3 py-2 text-center min-w-[56px]">
                    <div className="text-3xl font-extrabold text-white leading-none">{dayNum}</div>
                    <div className="text-sm text-indigo-300 uppercase font-semibold">{month}</div>
                    <div className="text-xs text-gray-500">{year}</div>
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-medium">Fisioterapeutas</p>
                    <div className="flex flex-col gap-2">
                        {[fisio1, fisio2].map(f => f && (
                            <div key={f.id} className="flex items-center gap-3">
                                <div
                                    className="avatar text-white shadow-lg"
                                    style={{ background: f.color, boxShadow: `0 4px 12px ${f.color}40` }}
                                >
                                    {f.iniciales}
                                </div>
                                <span className="font-semibold text-white text-sm">{f.nombre}</span>
                            </div>
                        ))}
                    </div>
                    {nota && (
                        <div className="mt-3 flex items-center gap-2 bg-amber-500/10 rounded-lg px-3 py-1.5">
                            <span className="text-amber-400 text-xs">⚠️ {nota}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
