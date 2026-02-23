'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Mail, AlertCircle, Stethoscope } from 'lucide-react'
import { loginAction } from './actions'

export default function AdminLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleAction(formData: FormData) {
        setLoading(true)
        setError('')
        const result = await loginAction(formData)
        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 mb-4">
                        <Stethoscope size={32} className="text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-white">Panel Admin</h1>
                    <p className="text-gray-400 text-sm mt-1">Turnos Sábados · Fisioterapia</p>
                </div>

                {/* Form */}
                <form action={handleAction} className="glass rounded-2xl p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-400 uppercase tracking-widest font-medium">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="email"
                                name="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@ejemplo.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-400 uppercase tracking-widest font-medium">Contraseña</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="password"
                                name="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                            <p className="text-red-300 text-xs">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm active:scale-95"
                    >
                        {loading ? 'Accediendo...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    )
}
