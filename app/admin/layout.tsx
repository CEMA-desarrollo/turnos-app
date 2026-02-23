import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Admin — Turnos Sábados',
}

export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-950">
            {children}
        </div>
    )
}
