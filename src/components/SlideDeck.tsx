import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { SlideProps, DrawingData } from '../types';
import { ToolBar, Tool } from './ToolBar';
import { InteractiveOverlay } from './InteractiveOverlay';

interface SlideDeckProps {
    slides: React.ComponentType<SlideProps>[];
    collectionId: string; // Identifier for storage
    onAddPage: () => void; // New prop
}

// History state architecture
type HistoryState = {
    past: DrawingData[];
    present: DrawingData;
    future: DrawingData[];
};

export const SlideDeck: React.FC<SlideDeckProps> = ({ slides, collectionId, onAddPage }) => {
    const [currentSlide, setCurrentSlide] = useState(() => {
        const saved = localStorage.getItem(`collection_slide_index_${collectionId}`);
        return saved ? Number(saved) : 0;
    });

    const [tool, setTool] = useState<Tool>('cursor');
    const [color, setColor] = useState('#FF0000');

    // Stores history for each slide
    const [fullHistory, setFullHistory] = useState<Record<number, HistoryState>>(() => {
        const saved = localStorage.getItem(`slides_data_${collectionId}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const restoredHistory: Record<number, HistoryState> = {};
                Object.keys(parsed).forEach(key => {
                    const k = Number(key);
                    restoredHistory[k] = {
                        past: [],
                        present: parsed[key],
                        future: []
                    };
                });
                return restoredHistory;
            } catch (e) {
                console.error("Failed to load data", e);
            }
        }
        return {};
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Save to local storage whenever fullHistory changes
    useEffect(() => {
        // Extract only 'present' state for persistence
        const toSave: Record<number, DrawingData> = {};
        Object.keys(fullHistory).forEach(key => {
            const k = Number(key);
            toSave[k] = fullHistory[k].present;
        });
        localStorage.setItem(`slides_data_${collectionId}`, JSON.stringify(toSave));
    }, [fullHistory, collectionId]);

    // Save current slide index
    useEffect(() => {
        localStorage.setItem(`collection_slide_index_${collectionId}`, currentSlide.toString());
    }, [currentSlide, collectionId]);


    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                // Undo/Redo shortcuts? 
                if (e.shiftKey) handleRedo();
                else handleUndo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slides.length, currentSlide, fullHistory]); // depend on history for undo?

    // --- Undo / Redo Logic ---

    const getCurrentHistory = () => {
        return fullHistory[currentSlide] || {
            past: [],
            present: { paths: [], textBoxes: [] },
            future: []
        };
    };

    const updateCurrentHistory = (newHistory: HistoryState) => {
        setFullHistory(prev => ({
            ...prev,
            [currentSlide]: newHistory
        }));
    };

    const handleUpdateDrawing = (newData: DrawingData) => {
        const current = getCurrentHistory();
        // Push current present to past, set new present, clear future
        updateCurrentHistory({
            past: [...current.past, current.present],
            present: newData,
            future: []
        });
    };

    const handleUndo = () => {
        const current = getCurrentHistory();
        if (current.past.length === 0) return;

        const previous = current.past[current.past.length - 1];
        const newPast = current.past.slice(0, -1);

        updateCurrentHistory({
            past: newPast,
            present: previous,
            future: [current.present, ...current.future]
        });
    };

    const handleRedo = () => {
        const current = getCurrentHistory();
        if (current.future.length === 0) return;

        const next = current.future[0];
        const newFuture = current.future.slice(1);

        updateCurrentHistory({
            past: [...current.past, current.present],
            present: next,
            future: newFuture
        });
    };

    const currentHistory = getCurrentHistory();

    return (
        <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-white text-slate-800">
            {/* Slide Content Area */}
            <div className="w-full h-full relative">
                {slides.map((Slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                    >
                        <Slide isActive={index === currentSlide} />
                    </div>
                ))}

                {/* Interactive Overlay on top of current slide */}
                <div className="absolute inset-0 z-30 pointer-events-none">
                    <InteractiveOverlay
                        tool={tool}
                        color={color}
                        data={currentHistory.present}
                        onUpdate={handleUpdateDrawing}
                        width={dimensions.width}
                        height={dimensions.height}
                    />
                </div>
            </div>

            {/* Navigation Controls Overlay */}
            <div className="absolute bottom-6 right-8 flex items-center gap-4 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm border border-slate-200">
                <button
                    onClick={onAddPage}
                    className="p-2 hover:bg-slate-100 rounded-full transition-all text-indigo-600 hover:text-indigo-900 border-r border-slate-200 mr-2"
                    title="Add New Note Page"
                >
                    <Plus size={24} />
                </button>
                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="p-2 hover:bg-slate-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 hover:text-slate-900"
                    aria-label="Previous Slide"
                >
                    <ChevronLeft size={24} />
                </button>
                <span className="font-mono text-sm text-slate-500 font-medium min-w-[3rem] text-center select-none">
                    {currentSlide + 1} / {slides.length}
                </span>
                <button
                    onClick={nextSlide}
                    disabled={currentSlide === slides.length - 1}
                    className="p-2 hover:bg-slate-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 hover:text-slate-900"
                    aria-label="Next Slide"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Toolbar */}
            <ToolBar
                currentTool={tool}
                setTool={setTool}
                currentColor={color}
                setColor={setColor}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={currentHistory.past.length > 0}
                canRedo={currentHistory.future.length > 0}
            />
        </div>
    );
};
