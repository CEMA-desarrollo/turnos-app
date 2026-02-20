import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3002'))
}

export async function GET() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return NextResponse.redirect('http://localhost:3002/admin/login')
}
