import Link from 'next/link'
import { Calendar, Clock, Users } from 'lucide-react'

export default function BottomNav({ active }: { active: 'home' | 'calendar' }) {
    return (
        <nav className="bottom-nav">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                <Link href="/" className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${active === 'home' ? 'text-indigo-400' : 'text-gray-500'}`}>
                    <Clock size={22} />
                    <span className="text-xs font-medium">Próximos</span>
                </Link>
                <Link href="/calendario" className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${active === 'calendar' ? 'text-indigo-400' : 'text-gray-500'}`}>
                    <Calendar size={22} />
                    <span className="text-xs font-medium">Calendario</span>
                </Link>
            </div>
        </nav>
    )
}
