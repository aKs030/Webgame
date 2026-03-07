import { useRef, useEffect, useCallback } from 'react';
import { DB } from '../data/threads';

export default function WheelSelector({ sizes, selectedSize, onSelect }) {
    const trackRef = useRef(null);
    const itemRefs = useRef([]);
    const scrollingTimeoutRef = useRef(null);
    const isProgrammaticScroll = useRef(false);

    // Dynamic color coding based on thread size
    const getAccentColor = (sizeStr) => {
        const num = parseFloat(sizeStr);
        if (num <= 4) return {
            glow: 'via-cyan-400',
            text: 'text-cyan-400',
            shadow: 'shadow-[0_8px_32px_rgba(34,211,238,0.15)]'
        };
        if (num >= 14) return {
            glow: 'via-amber-500',
            text: 'text-amber-500',
            shadow: 'shadow-[0_8px_32px_rgba(245,158,11,0.15)]'
        };
        return {
            glow: 'via-[#5ee7c2]',
            text: 'text-accent',
            shadow: 'shadow-[0_8px_32px_rgba(94,231,194,0.15)]'
        };
    };

    const colors = getAccentColor(selectedSize);

    // Vanilla JS update for buttery smooth 60fps 3D lens effect
    const updateVisuals = useCallback(() => {
        if (!trackRef.current) return;
        const track = trackRef.current;
        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        const itemWidth = 72; // matching w-[72px]

        let closestIdx = 0;
        let minDistance = Infinity;

        itemRefs.current.forEach((item, idx) => {
            if (!item) return;
            const itemCenter = item.offsetLeft + item.clientWidth / 2;
            const distance = Math.abs(trackCenter - itemCenter);

            // Calculate 3D Lens Effect
            const normalizedDist = Math.min(distance / (itemWidth * 2.5), 1);

            // Scale peaks at 1.25 in center, drops to 0.75 outside
            const scale = 1.3 - (normalizedDist * 0.55);
            // Opacity drops from 1 to 0.15
            const opacity = 1 - (normalizedDist * 0.85);
            // Rotate backwards slightly the further away they are (3D drum effect)
            const rotateX = normalizedDist * 40;

            item.style.transform = `perspective(300px) rotateX(${rotateX}deg) scale(${scale})`;
            item.style.opacity = Math.max(0.1, opacity);

            if (distance < minDistance) {
                minDistance = distance;
                closestIdx = idx;
            }
        });

        return closestIdx;
    }, []);

    const handleScroll = () => {
        const closestIdx = updateVisuals();

        // Live-Update of the selected Size while scrolling!
        if (sizes[closestIdx] !== selectedSize && !isProgrammaticScroll.current) {
            onSelect(sizes[closestIdx]);
            // Optional: Haptic Feedback API trigger (vibration) for that mechanical "click" feel
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(10); // 10ms tiny click
            }
        }

        // Reset programmatic flag once scrolling stops
        if (scrollingTimeoutRef.current) {
            clearTimeout(scrollingTimeoutRef.current);
        }
        scrollingTimeoutRef.current = setTimeout(() => {
            isProgrammaticScroll.current = false;
        }, 150);
    };

    // Smoother jump when clicking side items
    const handleItemClick = (s, idx) => {
        onSelect(s);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
        const item = itemRefs.current[idx];
        if (item && trackRef.current) {
            isProgrammaticScroll.current = true;
            trackRef.current.scrollTo({
                left: item.offsetLeft - trackRef.current.clientWidth / 2 + item.clientWidth / 2,
                behavior: 'smooth'
            });
        }
    };

    // When selectedSize changes from Quick Buttons, spin the wheel smoothly
    useEffect(() => {
        if (!trackRef.current) return;
        const idx = sizes.indexOf(selectedSize);
        const item = itemRefs.current[idx];

        if (item) {
            const track = trackRef.current;
            const trackCenter = track.scrollLeft + track.clientWidth / 2;
            const itemCenter = item.offsetLeft + item.clientWidth / 2;

            // Only programmatic scroll if not already centered (avoids fighting dragging)
            if (Math.abs(trackCenter - itemCenter) > 20) {
                isProgrammaticScroll.current = true;
                track.scrollTo({
                    left: item.offsetLeft - track.clientWidth / 2 + item.clientWidth / 2,
                    behavior: 'smooth'
                });
            }
        }
    }, [selectedSize, sizes]);

    // Initial Setup
    useEffect(() => {
        // Initial jump to right position without smooth scrolling
        if (trackRef.current && itemRefs.current[sizes.indexOf(selectedSize)]) {
            const track = trackRef.current;
            const item = itemRefs.current[sizes.indexOf(selectedSize)];
            track.scrollLeft = item.offsetLeft - track.clientWidth / 2 + item.clientWidth / 2;
        }

        updateVisuals();
        window.addEventListener('resize', updateVisuals);
        return () => window.removeEventListener('resize', updateVisuals);
    }, [updateVisuals, selectedSize, sizes]); // Added dependencies to trigger on mount

    const handlePrev = () => {
        const idx = sizes.indexOf(selectedSize);
        if (idx > 0) {
            onSelect(sizes[idx - 1]);
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([10, 30, 10]);
        }
    };

    const handleNext = () => {
        const idx = sizes.indexOf(selectedSize);
        if (idx < sizes.length - 1) {
            onSelect(sizes[idx + 1]);
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([10, 30, 10]);
        }
    };

    return (
        <div className="w-full relative overflow-hidden flex flex-col items-center select-none">

            <div
                className="relative h-[80px] w-full mt-2"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)'
                }}
            >

                {/* Mechanics "Lens" Marker in the center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[64px] pointer-events-none z-0">
                    <div className={`absolute inset-0 bg-white/[0.04] backdrop-blur-[2px] rounded-[18px] border border-white/10 transition-shadow duration-500 ${colors.shadow}`}></div>
                    {/* Soft elegant accent glows instead of harsh lines */}
                    <div className={`absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent ${colors.glow} to-transparent transition-all duration-500 opacity-60`}></div>
                    <div className={`absolute inset-x-4 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent ${colors.glow} to-transparent transition-all duration-500 opacity-60`}></div>
                </div>

                {/* The actual scrolling track */}
                <div
                    ref={trackRef}
                    onScroll={handleScroll}
                    className="flex items-center gap-0 overflow-x-auto snap-x snap-mandatory h-full px-[50%] no-scrollbar relative z-10 scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {sizes.map((s, i) => {
                        const isSelected = s === selectedSize;
                        return (
                            <div
                                key={s}
                                ref={el => itemRefs.current[i] = el}
                                onClick={() => handleItemClick(s, i)}
                                className="snap-center shrink-0 w-[72px] flex flex-col items-center justify-center cursor-pointer will-change-transform relative"
                                style={{ transformOrigin: 'center center' }}
                            >
                                <div className="flex items-baseline justify-center gap-0.5 w-full transition-all duration-300">
                                    <span className={`font-sans font-bold text-[11px] uppercase tracking-wider ${isSelected ? colors.text : 'text-gray-500'} transition-colors duration-500`}>M</span>
                                    <span className={`font-sans font-black tracking-tighter text-[26px] leading-none ${isSelected ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'text-gray-400'} transition-all duration-500`}>{s}</span>
                                </div>
                                <span className={`font-mono text-[10px] mt-1 font-medium tracking-widest ${isSelected ? 'text-white/60' : 'text-gray-600'} transition-colors duration-500`}>SW {DB[s].iso}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scroll Buttons - Modern Floating Pill */}
            <div className="relative z-30 mt-0 mb-3">
                <div className="flex items-center bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-full p-1 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={handlePrev}
                        disabled={sizes.indexOf(selectedSize) === 0}
                        className="group w-14 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none active:scale-90"
                    >
                        <svg className="transition-transform duration-150 group-active:-translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <div className="w-[1px] h-4 bg-white/20 mx-1"></div>
                    <button
                        onClick={handleNext}
                        disabled={sizes.indexOf(selectedSize) === sizes.length - 1}
                        className="group w-14 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 active:bg-white/20 transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none active:scale-90"
                    >
                        <svg className="transition-transform duration-150 group-active:translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
