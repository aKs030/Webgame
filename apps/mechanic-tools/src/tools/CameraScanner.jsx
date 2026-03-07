import { Camera, RefreshCcw } from 'lucide-react'

export default function CameraScanner() {
    return (
        <div className="card text-center py-16 flex flex-col items-center gap-6 overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent2 to-accent/50 opacity-80" />

            <div className="w-24 h-24 rounded-full bg-accent2/10 flex items-center justify-center text-accent2 animate-pulse">
                <Camera size={48} strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Smart <span className="text-accent2">Scanner</span></h2>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Nutze die Kamera deines Geräts, um Gewindesteigungen und Schraubenköpfe automatisch zu erkennen.
                </p>
            </div>

            <button className="bg-white/5 border border-white/10 px-8 py-3 rounded-full text-sm font-bold text-gray-300 flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95">
                <RefreshCcw size={18} />
                Scanner starten
            </button>

            <div className="mt-8 pt-8 border-t border-white/5 w-full">
                <div className="flex justify-around opacity-30 grayscale pointer-events-none">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-white/10" />
                        <div className="w-12 h-2 bg-white/10 rounded-full" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-white/10" />
                        <div className="w-12 h-2 bg-white/10 rounded-full" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-white/10" />
                        <div className="w-12 h-2 bg-white/10 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
