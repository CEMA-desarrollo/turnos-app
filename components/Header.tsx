import Link from 'next/link'
import { Settings } from 'lucide-react'

interface HeaderProps {
    title: string;
    subtitle: string;
    showSettings?: boolean;
}

export default function Header({ title, subtitle, showSettings = false }: HeaderProps) {
    return (
        <div className="sticky top-0 z-40 px-4 pb-3 bg-black/40 backdrop-blur-xl border-b border-white/10" style={{ paddingTop: `max(env(safe-area-inset-top), 16px)` }}>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-white tracking-tight">{title}</h1>
                    <p className="text-xs text-gray-400">{subtitle}</p>
                </div>
                {showSettings && (
                    <Link href="/admin/login" className="p-2.5 glass rounded-xl text-gray-400 hover:text-white transition-colors">
                        <Settings size={18} />
                    </Link>
                )}
            </div>
        </div>
    )
}
