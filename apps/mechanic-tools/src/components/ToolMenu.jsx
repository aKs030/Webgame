import { Wrench, Camera } from 'lucide-react'

export default function ToolMenu({ active, onSelect }) {
    const items = [
        { id: 'threads', label: 'SW Rechner', icon: Wrench },
        { id: 'camera', label: 'Kamera', icon: Camera }
    ]

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-bg/80 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex gap-2 shadow-2xl z-50">
            {items.map(item => {
                const Icon = item.icon
                const isActive = active === item.id
                return (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className={`
              flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300
              ${isActive
                                ? 'bg-accent text-bg font-bold shadow-lg shadow-accent/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
                    >
                        <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                        <span className="text-sm font-medium">{item.label}</span>
                    </button>
                )
            })}
        </nav>
    )
}
