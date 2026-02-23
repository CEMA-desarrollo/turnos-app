'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

/**
 * Hook to automatically subscribe to Supabase Realtime changes
 * and refresh the Next.js router locally.
 */
export function useRealtime() {
    const router = useRouter()

    useEffect(() => {
        const supabase = createClient()

        // Suscribirse a la tabla de Turnos
        const turnsChannel = supabase
            .channel('turnos_cambios')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'turnos_sabado' },
                (payload) => {
                    console.log('Cambio detectado en turnos, refrescando...', payload)
                    router.refresh()
                }
            )
            .subscribe()

        // Suscribirse a la tabla de Fisioterapeutas
        const fisiosChannel = supabase
            .channel('fisios_cambios')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'fisioterapeutas' },
                (payload) => {
                    console.log('Cambio detectado en fisios, refrescando...', payload)
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(turnsChannel)
            supabase.removeChannel(fisiosChannel)
        }
    }, [router])
}
