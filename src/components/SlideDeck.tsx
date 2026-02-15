import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, Download } from 'lucide-react';
import { SlideProps, DrawingData } from '../types';
import { ToolBar, Tool } from './ToolBar';
import { InteractiveOverlay } from './InteractiveOverlay';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// History state architecture
export type HistoryState = {
    past: DrawingData[];
    present: DrawingData;
    future: DrawingData[];
};

interface SlideDeckProps {
    slides: React.ComponentType<SlideProps>[];
    collectionId: string;
    onAddPage: () => void;
    currentSlide: number;
    onSlideChange: (index: number) => void;
}

export const SlideDeck: React.FC<SlideDeckProps> = ({
    slides,
    collectionId,
    onAddPage,
    currentSlide,
    onSlideChange
}) => {
    const [tool, setTool] = useState<Tool>('cursor');
    const [color, setColor] = useState('#FF0000');

    // Current Slide History State
    const [history, setHistory] = useState<HistoryState>({
        past: [],
        present: { paths: [], textBoxes: [] },
        future: []
    });

    const [isExporting, setIsExporting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const isRemoteUpdate = useRef(false);

    // --- Firestore Sync ---

    useEffect(() => {
        if (!collectionId) return;

        const slideDocRef = doc(db, 'collections', collectionId, 'slides', currentSlide.toString());

        const unsubscribe = onSnapshot(slideDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.drawing) {
                    // Only update if the change didn't originate from us (simple check: compare stringified?)
                    // Or better: Use a flag or timestamp.
                    // For now, simpler: Just update local state, but try to preserve undo stack if possible?
                    // Actually, if remote updates, we should probably reset undo stack or merge?
                    // "Google Drive" style: Latest wins. To avoid overwriting our own work while drawing,
                    // we need to be careful.
                    // But `onSnapshot` fires for local writes too (latency compensation).
                    // We need to distinguish.
                    // For this MVP, let's just accept the update.
                    // If we are drawing, this might interrupt?
                    // Let's rely on standard Firestore behavior.

                    // We only want to update 'present'.
                    // If 'present' matches what we have, ignore.
                    if (JSON.stringify(data.drawing) !== JSON.stringify(history.present)) {
                        isRemoteUpdate.current = true;
                        setHistory(prev => ({
                            ...prev,
                            present: data.drawing
                        }));
                    }
                }
            } else {
                // If doc doesn't exist, it's empty.
                if (history.present.paths.length > 0 || history.present.textBoxes.length > 0) {
                    // We have local data but remote is empty? Maybe we should save ours?
                    // Or remote is authoritative (empty).
                    // Let's assume empty.
                    isRemoteUpdate.current = true;
                    setHistory(prev => ({ ...prev, present: { paths: [], textBoxes: [] } }));
                }
            }
        });

        return () => unsubscribe();
    }, [collectionId, currentSlide]);

    // Debounced Write to Firestore
    useEffect(() => {
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }

        const timeoutId = setTimeout(async () => {
            // Save 'present' to Firestore
            if (collectionId) {
                await setDoc(doc(db, 'collections', collectionId, 'slides', currentSlide.toString()), {
                    drawing: history.present,
                    updatedAt: serverTimestamp()
                }, { merge: true });
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [history.present, collectionId, currentSlide]);


    // --- Resize ---
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

    // --- Navigation ---
    const nextSlide = () => onSlideChange(Math.min(currentSlide + 1, slides.length - 1));
    const prevSlide = () => onSlideChange(Math.max(currentSlide - 1, 0));

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                if (e.shiftKey) handleRedo();
                else handleUndo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slides.length, currentSlide]);

    // --- Undo/Redo ---
    const handleUpdateDrawing = (newData: DrawingData) => {
        setHistory(prev => ({
            past: [...prev.past, prev.present],
            present: newData,
            future: []
        }));
    };

    const handleUndo = () => {
        setHistory(prev => {
            if (prev.past.length === 0) return prev;
            const previous = prev.past[prev.past.length - 1];
            const newPast = prev.past.slice(0, -1);
            return {
                past: newPast,
                present: previous,
                future: [prev.present, ...prev.future]
            };
        });
    };

    const handleRedo = () => {
        setHistory(prev => {
            if (prev.future.length === 0) return prev;
            const next = prev.future[0];
            const newFuture = prev.future.slice(1);
            return {
                past: [...prev.past, prev.present],
                present: next,
                future: newFuture
            };
        });
    };

    const [exportData, setExportData] = useState<Record<string, DrawingData> | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // --- PDF Export ---
    const handleExportPDF = async () => {
        if (isExporting) return;
        setIsExporting(true);

        try {
            // 1. Fetch all drawing data
            const slidesCollection = await import('firebase/firestore').then(mod =>
                mod.getDocs(mod.collection(db, 'collections', collectionId, 'slides'))
            );

            const allData: Record<string, DrawingData> = {};
            slidesCollection.forEach(doc => {
                const data = doc.data();
                if (data.drawing) {
                    allData[doc.id] = data.drawing;
                }
            });

            // Include current unsaved changes if valid
            allData[currentSlide.toString()] = history.present;

            setExportData(allData);

            // Wait for React to render the print view
            await new Promise(resolve => setTimeout(resolve, 2000)); // Give it time to load dynamic content (like PDFs)

            if (printRef.current) {
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [dimensions.width, dimensions.height]
                });

                const slideElements = Array.from(printRef.current.children);

                for (let i = 0; i < slideElements.length; i++) {
                    const slideEl = slideElements[i] as HTMLElement;

                    // Skip if not a slide container
                    if (!slideEl.dataset.slideIndex) continue;

                    if (i > 0) pdf.addPage([dimensions.width, dimensions.height], 'landscape');

                    // 1. Capture Base Slide (Background + HTML Content)
                    const contentEl = slideEl.querySelector('.slide-content-base') as HTMLElement;
                    if (contentEl) {
                        const canvas = await html2canvas(contentEl, {
                            useCORS: true,
                            scale: 2, // 2x scale for crisp text on the background
                            backgroundColor: '#ffffff',
                            logging: false
                        });
                        const imgData = canvas.toDataURL('image/jpeg', 0.8); // JPEG 0.8 is smaller than PNG
                        pdf.addImage(imgData, 'JPEG', 0, 0, dimensions.width, dimensions.height);
                    }

                    // 2. Render Vector Drawings (Paths)
                    const slideData = allData[i.toString()] || { paths: [], textBoxes: [] };

                    slideData.paths.forEach(path => {
                        if (path.points.length < 2) return;

                        // Convert hex color to RGB for jsPDF
                        const hex = path.color.replace('#', '');
                        const r = parseInt(hex.substring(0, 2), 16);
                        const g = parseInt(hex.substring(2, 4), 16);
                        const b = parseInt(hex.substring(4, 6), 16);

                        pdf.setDrawColor(r, g, b);
                        pdf.setLineWidth(path.width);

                        // Draw lines
                        // jsPDF line: (x1, y1, x2, y2)
                        // This might be inefficient for long paths. `pdf.lines` is better but complex relative coords.
                        // Simple loop is robust.
                        for (let j = 0; j < path.points.length - 1; j++) {
                            const p1 = path.points[j];
                            const p2 = path.points[j + 1];
                            pdf.line(p1.x, p1.y, p2.x, p2.y);
                        }
                    });

                    // 3. Render Native Text (TextBoxes)
                    slideData.textBoxes.forEach(box => {
                        // Convert hex color
                        const hex = box.color.replace('#', '');
                        const r = parseInt(hex.substring(0, 2), 16);
                        const g = parseInt(hex.substring(2, 4), 16);
                        const b = parseInt(hex.substring(4, 6), 16);

                        pdf.setTextColor(r, g, b);
                        pdf.setFontSize(16); // Approximate size matching input
                        pdf.text(box.text, box.x + 2, box.y + 18); // Adjust for baseline/padding
                    });
                }

                pdf.save('presentation_export.pdf');
            }

        } catch (e) {
            console.error("Export failed", e);
            alert("Export failed: " + e);
        } finally {
            setIsExporting(false);
            setExportData(null);
        }
    };

    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-white text-slate-800">
            {/* Export Overlay */}
            {isExporting && (
                <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center text-white flex-col">
                    <div className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl flex flex-col items-center max-w-sm text-center">
                        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-6"></div>
                        <h3 className="text-xl font-bold mb-2">Generating PDF...</h3>
                        <p className="text-slate-500 mb-4">Rendering {slides.length} slides. Please wait.</p>
                        <p className="text-xs text-slate-400">Do not close this window.</p>
                    </div>
                </div>
            )}

            {/* Print Container (Hidden from view but rendered for capture) */}
            {isExporting && exportData && (
                <div ref={printRef} className="absolute top-0 left-0 z-0 pointer-events-none opacity-0" style={{ width: dimensions.width, height: 'auto' }}>
                    {slides.map((Slide, index) => (
                        <div
                            key={`print-${index}`}
                            data-slide-index={index}
                            className="relative overflow-hidden bg-white"
                            style={{ width: dimensions.width, height: dimensions.height }}
                        >
                            {/* Slide Content */}
                            <div className="absolute inset-0 w-full h-full slide-content-base">
                                <Slide isActive={true} />
                            </div>

                            {/* Overlay - Not rendered in print view as we draw vectors directly */}\n
                        </div>
                    ))}
                </div>
            )}

            {/* Normal Slide Content Area */}
            {!isExporting && (
                <div ref={contentRef} className="w-full h-full relative">
                    {slides.map((Slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                        >
                            <Slide isActive={index === currentSlide} />
                        </div>
                    ))}

                    {/* Interactive Overlay */}
                    <div className="absolute inset-0 z-30 pointer-events-none">
                        <InteractiveOverlay
                            tool={tool}
                            color={color}
                            data={history.present}
                            onUpdate={handleUpdateDrawing}
                            width={dimensions.width}
                            height={dimensions.height}
                        />
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-6 right-8 flex items-center gap-4 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm border border-slate-200">
                <button
                    onClick={onAddPage}
                    className="p-2 hover:bg-slate-100 rounded-full transition-all text-indigo-600 hover:text-indigo-900 border-r border-slate-200 mr-2"
                    title="Add New Note Page"
                >
                    <Plus size={24} />
                </button>
                <button
                    onClick={handleExportPDF}
                    className="p-2 hover:bg-slate-100 rounded-full transition-all text-emerald-600 hover:text-emerald-900 border-r border-slate-200 mr-2"
                    title="Export Current Slide to PDF"
                >
                    <Download size={24} />
                </button>
                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="p-2 hover:bg-slate-100 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 hover:text-slate-900"
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
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <ToolBar
                currentTool={tool}
                setTool={setTool}
                currentColor={color}
                setColor={setColor}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={history.past.length > 0}
                canRedo={history.future.length > 0}
            />
        </div>
    );
};
