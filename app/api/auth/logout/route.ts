import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function getBaseUrl(request: NextRequest) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (appUrl) return appUrl
    // Derive from request origin
    const { protocol, host } = new URL(request.url)
    return `${protocol}//${host}`
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/admin/login', getBaseUrl(request)))
}

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/admin/login', getBaseUrl(request)))
}
