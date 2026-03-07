import { Search } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function SearchBar({ sizes, onSelect }) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef(null)

    const filtered = sizes.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5)

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div ref={containerRef} className="relative w-full mb-4 z-40">
            <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent transition-colors">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Gewindegröße suchen... (z.B. M8)"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 focus:bg-white/[0.05] transition-all"
                />
            </div>

            {isOpen && query && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-bg/95 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {filtered.map(s => (
                        <button
                            key={s}
                            onClick={() => {
                                onSelect(s)
                                setQuery('')
                                setIsOpen(false)
                            }}
                            className="w-full px-5 py-3 text-left text-gray-300 hover:bg-accent/10 hover:text-white border-b border-white/5 last:border-0 transition-colors flex items-center justify-between"
                        >
                            <span className="font-mono font-bold">M{s}</span>
                            <span className="text-[10px] uppercase text-gray-500 tracking-widest">Wählen</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
