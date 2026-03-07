import { useState } from 'react'
import ThreadCalculator from './tools/ThreadCalculator'
import CameraScanner from './tools/CameraScanner'
import ToolMenu from './components/ToolMenu'

function App() {
    const [activeTool, setActiveTool] = useState('threads')

    return (
        <div className="min-h-screen max-w-lg mx-auto px-4 pt-8 pb-24">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-black tracking-tighter text-white inline-flex items-baseline gap-2">
                    MECHANIC<span className="text-accent underline decoration-4 underline-offset-4">TOOLS</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-mono">Premium Workshop Suite</p>
            </header>

            <main>
                {activeTool === 'threads' && <ThreadCalculator />}
                {activeTool === 'camera' && <CameraScanner />}
            </main>

            <ToolMenu active={activeTool} onSelect={setActiveTool} />
        </div>
    )
}

export default App
