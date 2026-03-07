import { DB, TORQUE_EXT_DB } from '../data/threads'

export default function FullTorqueTable() {
    const sizes = Object.keys(DB).sort((a, b) => parseFloat(a) - parseFloat(b))

    return (
        <div className="card !p-0 overflow-hidden border border-white/10 rounded-[24px] shadow-2xl">
            <div className="p-6 bg-white/[0.02] border-b border-white/5">
                <h2 className="text-xl font-mono font-semibold tracking-tight text-white/90">
                    Norm <span className="text-accent font-light">Tabelle</span>
                </h2>
                <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">ISO Regelgewinde & Drehmomente</p>
            </div>

            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.03] border-b border-white/5">
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-tighter text-gray-500">Größe</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-tighter text-gray-500">Kernloch</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-tighter text-gray-500">SW</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-tighter text-amber-500">8.8 (Nm)</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-tighter text-amber-500">10.9 (Nm)</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-tighter text-amber-500">12.9 (Nm)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sizes.map(s => {
                            const d = DB[s]
                            const t = TORQUE_EXT_DB[s] || {}
                            return (
                                <tr key={s} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-4 py-4 font-mono font-bold text-white group-hover:text-accent transition-colors">M{s}</td>
                                    <td className="px-4 py-4 font-mono text-gray-400">Ø{d.drill}</td>
                                    <td className="px-4 py-4 font-mono text-gray-400">SW {d.iso}</td>
                                    <td className={`px-4 py-4 font-mono font-bold ${t['8.8'] ? 'text-amber-500/80' : 'text-gray-700'}`}>{t['8.8'] || '-'}</td>
                                    <td className={`px-4 py-4 font-mono font-bold ${t['10.9'] ? 'text-amber-500/90' : 'text-gray-700'}`}>{t['10.9'] || '-'}</td>
                                    <td className={`px-4 py-4 font-mono font-bold ${t['12.9'] ? 'text-amber-500' : 'text-gray-700'}`}>{t['12.9'] || '-'}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-white/[0.01] text-[9px] text-gray-600 text-center uppercase tracking-[0.2em]">
                Werte nach DIN 13-1 / ISO 273 Richtwerten
            </div>
        </div>
    )
}
