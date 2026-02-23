'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FISIOS, generarPlanificacion, getSabadosRestantes, getFisioById } from '@/lib/rotation'
import { ChevronLeft, Save, X, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Turno {
    id?: string
    fecha: string
    fisio1_id: string
    fisio2_id: string
    nota?: string
    estado?: string
}

export default function PlanificacionPage() {
    const [turnos, setTurnos] = useState<Turno[]>([])
    const [loading, setLoading] = useState(true)
    const [editId, setEditId] = useState<string | null>(null)
    const [editData, setEditData] = useState<Partial<Turno>>({})
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null)

    useEffect(() => {
        loadTurnos()
    }, [])

    async function loadTurnos() {
        setLoading(true)
        const supabase = createClient()
        const { data } = await supabase
            .from('turnos_sabado')
            .select('*')
            .order('fecha', { ascending: true })

        if (data && data.length > 0) {
            setTurnos(data)
        } else {
            // No data in DB yet, show generated ones
            const generated = generarPlanificacion(getSabadosRestantes())
            setTurnos(generated)
        }
        setLoading(false)
    }

    async function saveTurno(turno: Turno) {
        setSaving(true)
        const supabase = createClient()
        if (turno.id) {
            const { error } = await supabase
                .from('turnos_sabado')
                .update({ fisio1_id: turno.fisio1_id, fisio2_id: turno.fisio2_id, nota: turno.nota, estado: 'modificado' })
                .eq('id', turno.id)
            if (error) {
                setMsg({ text: 'Error al guardar', type: 'err' })
            } else {
                setMsg({ text: 'Guardado correctamente', type: 'ok' })
                setEditId(null)
                loadTurnos()
            }
        } else {
            const { error } = await supabase.from('turnos_sabado').insert({
                fecha: turno.fecha,
                fisio1_id: turno.fisio1_id,
                fisio2_id: turno.fisio2_id,
                nota: turno.nota,
                estado: 'modificado',
            })
            if (error) {
                setMsg({ text: 'Error al guardar', type: 'err' })
            } else {
                setMsg({ text: 'Guardado', type: 'ok' })
                setEditId(null)
                loadTurnos()
            }
        }
        setSaving(false)
        setTimeout(() => setMsg(null), 3000)
    }

    async function generarYGuardar() {
        setSaving(true)
        const supabase = createClient()
        const sabados = getSabadosRestantes()
        const planificacion = generarPlanificacion(sabados)

        const { error } = await supabase.from('turnos_sabado').upsert(
            planificacion.map(t => ({ ...t, estado: 'planificado' })),
            { onConflict: 'fecha' }
        )

        if (error) {
            setMsg({ text: 'Error al generar: ' + error.message, type: 'err' })
        } else {
            setMsg({ text: `✓ ${planificacion.length} sábados generados`, type: 'ok' })
            loadTurnos()
        }
        setSaving(false)
        setTimeout(() => setMsg(null), 4000)
    }

    function startEdit(t: Turno) {
        setEditId(t.fecha)
        setEditData({ fisio1_id: t.fisio1_id, fisio2_id: t.fisio2_id, nota: t.nota || '' })
    }

    function cancelEdit() {
        setEditId(null)
        setEditData({})
    }

    const fisioOptions = FISIOS.map(f => ({ value: f.id, label: f.nombre }))

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-lg border-b border-white/5 px-4" style={{ paddingTop: `max(env(safe-area-inset-top), 12px)` }}>
                <div className="flex items-center gap-3 py-3">
                    <Link href="/admin" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-white">Planificación</h1>
                        <p className="text-xs text-gray-400">{turnos.length} sábados restantes</p>
                    </div>
                    <button
                        onClick={generarYGuardar}
                        disabled={saving}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                    >
                        <RefreshCw size={14} className={saving ? 'animate-spin' : ''} />
                        Regenerar
                    </button>
                </div>
            </div>

            {/* Toast */}
            {msg && (
                <div className={`mx-4 mt-3 rounded-xl px-4 py-3 text-sm font-medium ${msg.type === 'ok' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                    {msg.text}
                </div>
            )}

            <div className="px-4 mt-3 max-w-md mx-auto space-y-2">
                {loading ? (
                    <div className="text-center py-16 text-gray-500">Cargando...</div>
                ) : (
                    turnos.map(t => {
                        const f1 = getFisioById(t.fisio1_id)
                        const f2 = getFisioById(t.fisio2_id)
                        const dateObj = new Date(t.fecha + 'T12:00:00')
                        const isEditing = editId === t.fecha

                        return (
                            <div key={t.fecha} className={`glass rounded-xl overflow-hidden transition-all ${isEditing ? 'border border-indigo-500/50' : ''}`}>
                                {/* View row */}
                                {!isEditing ? (
                                    <button
                                        onClick={() => startEdit(t)}
                                        className="w-full p-3 flex items-center gap-3 text-left active:bg-white/5"
                                    >
                                        <div className="text-center min-w-[40px]">
                                            <div className="text-base font-bold text-white">{dateObj.getDate()}</div>
                                            <div className="text-xs text-gray-500 uppercase">{dateObj.toLocaleDateString('es', { month: 'short' })}</div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {[f1, f2].map(f => f && (
                                                <div key={f.id} className="avatar text-white" style={{ background: f.color, width: 28, height: 28, fontSize: '0.6rem' }}>
                                                    {f.iniciales}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-gray-200 truncate">{f1?.nombre.split(' ')[0]} & {f2?.nombre.split(' ')[0]}</div>
                                            {t.nota && <div className="text-xs text-amber-400 truncate">{t.nota}</div>}
                                        </div>
                                        {t.estado === 'modificado' && <span className="text-xs text-amber-400 flex-shrink-0">●</span>}
                                        <span className="text-gray-600 flex-shrink-0">›</span>
                                    </button>
                                ) : (
                                    /* Edit form */
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-bold text-white">
                                                Sábado {dateObj.getDate()} de {dateObj.toLocaleDateString('es', { month: 'long' })}
                                            </p>
                                            <button onClick={cancelEdit} className="text-gray-500 hover:text-white">
                                                <X size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-400">Fisio 1</label>
                                            <select
                                                value={editData.fisio1_id}
                                                onChange={e => setEditData(d => ({ ...d, fisio1_id: e.target.value }))}
                                                className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            >
                                                {fisioOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-400">Fisio 2</label>
                                            <select
                                                value={editData.fisio2_id}
                                                onChange={e => setEditData(d => ({ ...d, fisio2_id: e.target.value }))}
                                                className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            >
                                                {fisioOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                            </select>
                                        </div>

                                        {editData.fisio1_id === editData.fisio2_id && (
                                            <div className="flex items-center gap-2 bg-red-500/10 rounded-lg px-3 py-2">
                                                <AlertTriangle size={14} className="text-red-400" />
                                                <span className="text-xs text-red-300">Las dos fisios deben ser diferentes</span>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-400">Nota (opcional)</label>
                                            <input
                                                type="text"
                                                value={editData.nota || ''}
                                                onChange={e => setEditData(d => ({ ...d, nota: e.target.value }))}
                                                placeholder="Ej: Ausencia cubierta, cambio solicitado..."
                                                className="w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                            />
                                        </div>

                                        <button
                                            onClick={() => saveTurno({ ...t, ...editData } as Turno)}
                                            disabled={saving || editData.fisio1_id === editData.fisio2_id}
                                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                                        >
                                            <Save size={16} />
                                            {saving ? 'Guardando...' : 'Guardar cambio'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
