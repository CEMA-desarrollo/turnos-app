import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Admin — Turnos Sábados',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-950">
            {children}
        </div>
    )
}
