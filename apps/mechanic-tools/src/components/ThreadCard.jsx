import { DB, CLEARANCE_DB, TORQUE_EXT_DB } from '../data/threads'
import { Info, Drill, Settings2, Gauge } from 'lucide-react'

export default function ThreadCard({ size, data }) {
    const clearance = CLEARANCE_DB[size] || null
    const subTorque = TORQUE_EXT_DB[size] || null

    return (
        <div className="card space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

            {/* Header Info */}
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <Settings2 size={24} />
                    </div>
                    <h3 className="text-lg font-mono font-bold text-white/90">Gewinde Details</h3>
                </div>

                <div className="space-y-4">
                    <DetailRow label="Gewinde" value={`M${size}`} subValue="Regelgewinde DIN 13-1" />
                    <DetailRow label="Steigung P" value={`${data.pitch} mm`} />
                    <DetailRow label="Flankentiefe h3" value={`${(0.6134 * parseFloat(data.pitch)).toFixed(3)} mm`} subValue="Theoretisch" />
                    <DetailRow label="Einschraubtiefe" value={`${(1.2 * parseFloat(size)).toFixed(1)} mm`} subValue="Empfehlung (Stahl)" />
                    <DetailRow label="Mindest-Material" value={`${(2.5 * parseFloat(data.pitch)).toFixed(2)} mm`} subValue="Grob-Richtwert" />
                    <DetailRow label="Schlüsselweite" value={data.iso} isHighlight />
                </div>
            </section>

            {/* Drill Info */}
            <section className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent2/10 flex items-center justify-center text-accent2">
                        <Drill size={24} />
                    </div>
                    <h3 className="text-lg font-mono font-bold text-white/90">Bohren & Senken</h3>
                </div>

                <div className="space-y-4">
                    <DetailRow label="Kernloch Ø" value={`${data.drill} mm`} subValue="DIN 336" isHighlight />
                    {clearance && (
                        <>
                            <DetailRow label="Durchgang (Fein)" value={`${clearance.fine} mm`} subValue="ISO 273" />
                            <DetailRow label="Durchgang (Mittel)" value={`${clearance.medium} mm`} />
                            <DetailRow label="Durchgang (Grob)" value={`${clearance.coarse} mm`} />
                        </>
                    )}
                </div>
            </section>

            {/* Torque Info */}
            <section className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Gauge size={24} />
                    </div>
                    <h3 className="text-lg font-mono font-bold text-white/90">Drehmomente (Nm)</h3>
                </div>

                {subTorque ? (
                    <div className="grid grid-cols-3 gap-2">
                        <TorqueChip label="8.8" value={subTorque['8.8']} />
                        <TorqueChip label="10.9" value={subTorque['10.9']} />
                        <TorqueChip label="12.9" value={subTorque['12.9']} />
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm italic">Keine Drehmomentdaten für diese Größe verfügbar.</p>
                )}
            </section>
        </div>
    )
}

function DetailRow({ label, value, subValue, isHighlight }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">{label}</span>
                {subValue && <span className="text-gray-600 text-[10px]">{subValue}</span>}
            </div>
            <span className={`font-mono text-lg font-bold ${isHighlight ? 'text-accent' : 'text-gray-200'}`}>
                {value}
            </span>
        </div>
    )
}

function TorqueChip({ label, value }) {
    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-500 font-black tracking-tighter">FK {label}</span>
            <span className="text-base font-black text-amber-400 font-mono">{value}</span>
        </div>
    )
}
