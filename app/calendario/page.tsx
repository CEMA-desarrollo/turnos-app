'use client'

import { useState, useEffect } from 'react'
import { getFisioById, type Fisio } from '@/lib/rotation'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSaturday, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

interface Turno {
    fecha: string;
    fisio1_id: string;
    fisio2_id: string;
    estado?: string;
    nota?: string | null;
}

export default function CalendarioPage() {
    const [turnos, setTurnos] = useState<Turno[]>([])
    const [loading, setLoading] = useState(true)

    const [fisios, setFisios] = useState<Fisio[]>([])

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const supabase = createClient()

            const [turnosRes, fisiosRes] = await Promise.all([
                supabase.from('turnos_sabado').select('*').order('fecha', { ascending: true }),
                supabase.from('fisioterapeutas').select('*').order('created_at', { ascending: true })
            ])

            if (turnosRes.data) setTurnos(turnosRes.data)
            if (fisiosRes.data) setFisios(fisiosRes.data)

            setLoading(false)
        }
        fetchData()
    }, [])

    const turnosByDate = Object.fromEntries(turnos.map(t => [t.fecha, t]))

    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), 1)
    })

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Fill leading empty days (Mon=0 start)
    const startDow = (getDay(monthStart) + 6) % 7 // 0=Mon
    const emptyDays = Array(startDow).fill(null)

    const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

    const today = new Date().toISOString().split('T')[0]

    return (
        <div className="gradient-bg min-h-screen pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 px-4" style={{ paddingTop: `max(env(safe-area-inset-top), 12px)` }}>
                <div className="py-3">
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Calendario</h1>
                    <p className="text-xs text-gray-400">Turnos sábados 2026</p>
                </div>
            </div>

            <div className="px-4 max-w-md mx-auto space-y-4">
                {/* Month Navigator */}
                <div className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <ChevronLeft size={20} className="text-gray-300" />
                        </button>
                        <h2 className="text-lg font-bold text-white capitalize">
                            {format(currentMonth, 'MMMM yyyy', { locale: es })}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                            <ChevronRight size={20} className="text-gray-300" />
                        </button>
                    </div>

                    {/* Days of week header */}
                    <div className="grid grid-cols-7 mb-2">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                            <div key={d} className={`text-center text-xs font-semibold py-1 ${i === 5 ? 'text-indigo-400' : 'text-gray-500'}`}>{d}</div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {emptyDays.map((_, i) => <div key={`e${i}`} />)}
                        {daysInMonth.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd')
                            const turno = turnosByDate[dateStr]
                            const isSat = isSaturday(day)
                            const isToday = dateStr === today

                            return (
                                <div
                                    key={dateStr}
                                    className={`relative flex flex-col items-center justify-start rounded-xl py-1.5 min-h-[52px] transition-all
                    ${isSat && turno ? 'bg-indigo-500/15 border border-indigo-500/30' : ''}
                    ${isToday ? 'ring-2 ring-white/30' : ''}
                  `}
                                >
                                    <span className={`text-xs font-semibold ${isSat ? 'text-indigo-300' : 'text-gray-400'} ${isToday ? 'text-white' : ''}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {isSat && turno && (
                                        <div className="flex gap-0.5 mt-1">
                                            {[turno.fisio1_id, turno.fisio2_id].map(id => {
                                                const f = getFisioById(fisios, id)
                                                return f ? (
                                                    <div
                                                        key={id}
                                                        className="rounded-full"
                                                        style={{ background: f.color, width: 8, height: 8 }}
                                                        title={f.nombre}
                                                    />
                                                ) : null
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="glass rounded-xl p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Fisioterapeutas</p>
                    <div className="grid grid-cols-2 gap-2">
                        {fisios.filter(f => f.activa).map(f => (
                            <div key={f.id} className="flex items-center gap-2">
                                <div className="rounded-full" style={{ background: f.color, width: 10, height: 10, flexShrink: 0 }} />
                                <span className="text-xs text-gray-300">{f.nombre}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sábados del mes actual */}
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">
                        Sábados de {format(currentMonth, 'MMMM', { locale: es })}
                    </p>
                    <div className="space-y-2">
                        {daysInMonth
                            .filter(d => isSaturday(d))
                            .map(d => {
                                const dateStr = format(d, 'yyyy-MM-dd')
                                const turno = turnosByDate[dateStr]
                                if (!turno) return null
                                const f1 = getFisioById(fisios, turno.fisio1_id)
                                const f2 = getFisioById(fisios, turno.fisio2_id)
                                return (
                                    <div key={dateStr} className="glass card-hover rounded-xl p-3 flex items-center gap-3">
                                        <div className="text-center min-w-[36px]">
                                            <div className="text-lg font-bold text-white leading-none">{format(d, 'd')}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            {[f1, f2].map(f => f && (
                                                <div key={f.id} className="avatar text-white text-xs" style={{ background: f.color, width: 32, height: 32, fontSize: '0.65rem' }}>
                                                    {f.iniciales}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-sm text-gray-200">
                                            {turno.estado === 'cancelado' ? (
                                                <span className="text-red-400 font-semibold text-xs tracking-wider">CERRADO</span>
                                            ) : f1 && f2 ? (
                                                `${f1.nombre.split(' ')[0]} & ${f2.nombre.split(' ')[0]}`
                                            ) : f1 || f2 ? (
                                                `Solo ${(f1 || f2)?.nombre.split(' ')[0]}`
                                            ) : 'Sin asignar'}
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                </div>
            </div>

            <BottomNav active="calendar" />
        </div>
    )
}
