'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type Fisio } from '@/lib/rotation'
import { ArrowLeft, UserCheck, UserX, Plus, Edit2, Save, X } from 'lucide-react'
import Link from 'next/link'

export default function FisiosPage() {
    const [fisios, setFisios] = useState<Fisio[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState<string | null>(null)
    const [editData, setEditData] = useState<Partial<Fisio>>({})
    const [isCreating, setIsCreating] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadFisios()
    }, [])

    async function loadFisios() {
        setLoading(true)
        const supabase = createClient()
        const { data } = await supabase.from('fisioterapeutas').select('*').order('created_at', { ascending: true })
        if (data) setFisios(data)
        setLoading(false)
    }

    async function saveFisio(id: string | null) {
        setSaving(true)
        const supabase = createClient()

        if (id) {
            // Update
            await supabase.from('fisioterapeutas').update({
                nombre: editData.nombre,
                iniciales: editData.iniciales,
                color: editData.color,
                activa: editData.activa
            }).eq('id', id)
        } else {
            // Create
            await supabase.from('fisioterapeutas').insert({
                id: editData.id?.toLowerCase().replace(/\s+/g, ''),
                nombre: editData.nombre,
                iniciales: editData.iniciales,
                color: editData.color,
                activa: true
            })
        }

        await loadFisios()
        setIsEditing(null)
        setIsCreating(false)
        setEditData({})
        setSaving(false)
    }

    function startEdit(f: Fisio) {
        setIsEditing(f.id)
        setEditData(f)
        setIsCreating(false)
    }

    function startCreate() {
        setIsCreating(true)
        setIsEditing(null)
        setEditData({ color: '#6366f1', activa: true })
    }

    function cancel() {
        setIsEditing(null)
        setIsCreating(false)
        setEditData({})
    }

    return (
        <div className="min-h-screen bg-gray-950 pb-8">
            <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-lg border-b border-white/5 px-4" style={{ paddingTop: `max(env(safe-area-inset-top), 12px)` }}>
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-white">Fisioterapeutas</h1>
                            <p className="text-xs text-gray-400">Gestión del equipo</p>
                        </div>
                    </div>
                    {!isCreating && !isEditing && (
                        <button onClick={startCreate} className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors text-white">
                            <Plus size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="px-4 mt-4 max-w-md mx-auto space-y-3">
                {isCreating && (
                    <div className="glass rounded-2xl p-4 border border-indigo-500/50">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-white font-bold text-sm">Nueva Fisioterapeuta</h3>
                            <button onClick={cancel} className="text-gray-400"><X size={18} /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-400">ID Único (sin espacios)</label>
                                <input type="text" value={editData.id || ''} onChange={e => setEditData({ ...editData, id: e.target.value })} className="w-full bg-gray-800 rounded-xl border border-white/10 px-3 py-2 text-sm text-white mt-1" placeholder="Ej: valeria" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Nombre Completo</label>
                                <input type="text" value={editData.nombre || ''} onChange={e => setEditData({ ...editData, nombre: e.target.value })} className="w-full bg-gray-800 rounded-xl border border-white/10 px-3 py-2 text-sm text-white mt-1" placeholder="Ej: Valeria Torres" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-400">Iniciales</label>
                                    <input type="text" value={editData.iniciales || ''} onChange={e => setEditData({ ...editData, iniciales: e.target.value })} className="w-full bg-gray-800 rounded-xl border border-white/10 px-3 py-2 text-sm text-white mt-1" placeholder="Ej: VT" maxLength={2} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Color (HEX)</label>
                                    <div className="flex gap-2 mt-1">
                                        <input type="color" value={editData.color || '#6366f1'} onChange={e => setEditData({ ...editData, color: e.target.value })} className="w-10 h-9 rounded-lg bg-gray-800 border border-white/10 p-1 cursor-pointer" />
                                        <input type="text" value={editData.color || ''} onChange={e => setEditData({ ...editData, color: e.target.value })} className="flex-1 bg-gray-800 rounded-xl border border-white/10 px-3 py-2 text-sm text-white uppercase" />
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => saveFisio(null)} disabled={saving || !editData.id || !editData.nombre} className="w-full flex justify-center items-center gap-2 bg-indigo-600 py-2.5 rounded-xl text-white text-sm font-semibold mt-2">
                                <Save size={16} /> {saving ? 'Guardando...' : 'Crear'}
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Cargando equipo...</div>
                ) : (
                    fisios.map((f) => (
                        isEditing === f.id ? (
                            <div key={f.id} className="glass rounded-2xl p-4 border border-indigo-500/50">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-white font-bold text-sm">Editar {f.nombre}</h3>
                                    <button onClick={cancel} className="text-gray-400"><X size={18} /></button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-400">Nombre Completo</label>
                                        <input type="text" value={editData.nombre || ''} onChange={e => setEditData({ ...editData, nombre: e.target.value })} className="w-full bg-gray-800 rounded-xl border border-white/10 px-3 py-2 text-sm text-white mt-1" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-400">Iniciales</label>
                                            <input type="text" value={editData.iniciales || ''} onChange={e => setEditData({ ...editData, iniciales: e.target.value })} className="w-full bg-gray-800 rounded-xl border border-white/10 px-3 py-2 text-sm text-white mt-1" maxLength={2} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400">Color (HEX)</label>
                                            <div className="flex gap-2 mt-1">
                                                <input type="color" value={editData.color || '#6366f1'} onChange={e => setEditData({ ...editData, color: e.target.value })} className="w-10 h-9 rounded-lg bg-gray-800 border border-white/10 p-1 cursor-pointer" />
                                                <input type="text" value={editData.color || ''} onChange={e => setEditData({ ...editData, color: e.target.value })} className="flex-1 bg-gray-800 rounded-xl border border-white/10 px-3 py-2 text-sm text-white uppercase" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl border border-white/5">
                                        <input type="checkbox" checked={editData.activa} onChange={e => setEditData({ ...editData, activa: e.target.checked })} id={`activa-${f.id}`} className="w-4 h-4 rounded text-indigo-500 border-gray-600 focus:ring-indigo-500" />
                                        <label htmlFor={`activa-${f.id}`} className="text-sm text-white flex-1">Fisioterapeuta Activa</label>
                                    </div>
                                    <button onClick={() => saveFisio(f.id)} disabled={saving} className="w-full flex justify-center items-center gap-2 bg-indigo-600 py-2.5 rounded-xl text-white text-sm font-semibold mt-2">
                                        <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div key={f.id} className={`glass rounded-2xl p-4 flex items-center gap-4 ${!f.activa ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                <div
                                    className="avatar text-white shadow-lg flex-shrink-0"
                                    style={{ background: f.color, boxShadow: `0 4px 16px ${f.color}44`, width: 48, height: 48, fontSize: '0.85rem' }}
                                >
                                    {f.iniciales}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold text-sm">{f.nombre}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {f.activa ? (
                                            <><UserCheck size={12} className="text-emerald-400" /><span className="text-xs text-emerald-400">Activa</span></>
                                        ) : (
                                            <><UserX size={12} className="text-red-400" /><span className="text-xs text-red-400">Inactiva</span></>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => startEdit(f)} className="p-2.5 hover:bg-white/10 rounded-xl text-gray-400 transition-colors">
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        )
                    ))
                )}

                <div className="glass rounded-2xl p-4 mt-6 border border-amber-500/20">
                    <p className="text-xs text-amber-400 mb-2 font-semibold">⚠️ Cambio de Equipo</p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                        Si desactivas a una fisioterapeuta o añades a una nueva, recuerda ir a <strong>Configuración {'>'} Regenerar</strong> para que las futuras planificaciones (los turnos que tienen el estado <i>planificado</i>) incluyan al nuevo equipo activo.
                    </p>
                </div>
            </div>
        </div>
    )
}
