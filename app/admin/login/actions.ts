'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Por favor, ingresa email y contraseña' }
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Credenciales incorrectas. Verifica tu email y contraseña.' }
    }

    // Redirect uses Next.js server routing, setting the cookies firmly
    redirect('/admin')
}
