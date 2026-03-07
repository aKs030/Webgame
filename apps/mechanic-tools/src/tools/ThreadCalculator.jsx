import { useState } from 'react'
import { DB } from '../data/threads'
import WheelSelector from '../components/WheelSelector'
import SearchBar from '../components/SearchBar'
import ThreadCard from '../components/ThreadCard'
import FullTorqueTable from '../components/FullTorqueTable'

const SIZES = Object.keys(DB).sort((a, b) => parseFloat(a) - parseFloat(b))
const QUICK_SIZES = ["3", "4", "5", "6", "8", "10", "12", "16"]

export default function ThreadCalculator() {
    const [size, setSize] = useState("8")
    const [view, setView] = useState('rechner') // 'rechner' or 'tabelle'

    return (
        <div className="space-y-6">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                <button
                    onClick={() => setView('rechner')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'rechner' ? 'bg-accent text-bg shadow-lg' : 'text-gray-400'}`}
                >
                    Einzel-Rechner
                </button>
                <button
                    onClick={() => setView('tabelle')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'tabelle' ? 'bg-accent text-bg shadow-lg' : 'text-gray-400'}`}
                >
                    Gesamt-Tabelle
                </button>
            </div>

            {view === 'rechner' ? (
                <>
                    <SearchBar sizes={SIZES} onSelect={setSize} />

                    <div className="card w-full border border-white/10 rounded-[24px] shadow-2xl overflow-hidden relative isolate">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent to-accent2/50 opacity-80" />
                        <h2 className="text-xl font-mono font-semibold mb-6 tracking-tight text-white/90">
                            Gewinde <span className="text-accent font-light">Rechner</span>
                        </h2>

                        <WheelSelector sizes={SIZES} selectedSize={size} onSelect={setSize} />

                        <div className="mt-4 mb-2 grid grid-cols-3 sm:grid-cols-4 gap-2.5 px-1">
                            {QUICK_SIZES.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSize(s)}
                                    className={`
                            group relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 border
                            active:scale-95 overflow-hidden
                            ${size === s
                                            ? 'bg-accent/15 border-accent/50 text-accent shadow-[0_0_20px_rgba(94,231,194,0.2)]'
                                            : 'bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-100 hover:border-white/20 hover:shadow-lg'
                                        }
                        `}
                                >
                                    {size === s && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                    )}
                                    <span className={`font-sans font-bold text-sm tracking-tight ${size === s ? 'text-white' : 'text-gray-300 group-hover:text-white transition-colors'}`}>
                                        M{s}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-[1px] h-3.5 ${size === s ? 'bg-accent/50' : 'bg-gray-600/50'} rounded-full transition-colors`} />
                                        <span className={`font-sans font-bold text-sm tracking-tight ${size === s ? 'text-accent' : 'text-gray-400 group-hover:text-gray-300 transition-colors'}`}>
                                            SW {DB[s].iso}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <ThreadCard size={size} data={DB[size]} />
                </>
            ) : (
                <FullTorqueTable />
            )}
        </div>
    )
}
