import { useState, useEffect, useMemo, useCallback } from 'react';
import { SlideDeck, HistoryState } from './components/SlideDeck';
import { Dashboard } from './components/Dashboard';
import { TitleSlide } from './slides/TitleSlide';
import { SelfIntroSlide } from './slides/SelfIntroSlide';
import { PinyinSlide } from './slides/PinyinSlide';
import { NumbersSlide } from './slides/NumbersSlide';
import { MeasureWordsSlide } from './slides/MeasureWordsSlide';
import { NumberSentencesSlide } from './slides/NumberSentencesSlide';
import { NoteSlide } from './slides/NoteSlide';
import { PDFSlide } from './components/PDFSlide';
import { useBroadcast, BroadcastRole } from './hooks/useBroadcast';
import { savePDF, loadPDF } from './utils/pdfStorage';
import { pdfjs } from 'react-pdf';

// Configure PDF worker globally
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// Default slides for any new session
const DEFAULT_SLIDES = [
    TitleSlide,
    SelfIntroSlide,
    PinyinSlide,
    NumbersSlide,
    MeasureWordsSlide,
    NumberSentencesSlide
];

type Collection = {
    id: string;
    title: string;
    date: string;
    template?: 'default' | 'blank' | 'pdf';
    pageCount?: number;
};

export default function App() {
    // --- State ---
    const [collections, setCollections] = useState<Collection[]>(() => {
        const saved = localStorage.getItem('collections_meta');
        return saved ? JSON.parse(saved) : [];
    });

    const [customPages, setCustomPages] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem('collections_custom_pages');
        return saved ? JSON.parse(saved) : {};
    });

    const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(() => {
        return localStorage.getItem('current_collection_id');
    });

    // Lifted state from SlideDeck
    const [currentSlide, setCurrentSlide] = useState(0);

    // PDF State
    const [pdfFile, setPdfFile] = useState<Blob | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);

    // Broadcast State
    const [role, setRole] = useState<BroadcastRole>('none');
    const [connectionId, setConnectionId] = useState<string>('');
    const [externalHistory, setExternalHistory] = useState<Record<number, HistoryState>>();

    // --- Effects & Persistence ---

    // Initial load for currentSlide when collection changes
    useEffect(() => {
        if (currentCollectionId) {
            const saved = localStorage.getItem(`collection_slide_index_${currentCollectionId}`);
            setCurrentSlide(saved ? Number(saved) : 0);
        }
    }, [currentCollectionId]);

    // Save currentSlide persistence
    useEffect(() => {
        if (currentCollectionId) {
            localStorage.setItem(`collection_slide_index_${currentCollectionId}`, currentSlide.toString());
        }
    }, [currentSlide, currentCollectionId]);

    useEffect(() => {
        localStorage.setItem('collections_meta', JSON.stringify(collections));
        localStorage.setItem('collections_custom_pages', JSON.stringify(customPages));
        if (currentCollectionId) {
            localStorage.setItem('current_collection_id', currentCollectionId);
        } else {
            localStorage.removeItem('current_collection_id');
        }
    }, [collections, customPages, currentCollectionId]);

    // Load PDF when entering a PDF collection
    useEffect(() => {
        const loadCollectionPDF = async () => {
            const collection = collections.find(c => c.id === currentCollectionId);
            if (collection?.template === 'pdf') {
                setLoadingPdf(true);
                // If we are viewer and just joined, we might wait for PDF from host
                // But check local storage first just in case
                const blob = await loadPDF(currentCollectionId!);
                if (blob) {
                    setPdfFile(blob);
                } else {
                    setPdfFile(null); // Wait for broadcast to receive it?
                }
                setLoadingPdf(false);
            } else {
                setPdfFile(null);
            }
        };

        if (currentCollectionId) {
            loadCollectionPDF();
        }
    }, [currentCollectionId, collections]);


    // --- Broadcast Logic ---

    const handleBroadcastState = useCallback((state: any) => {
        // Viewer receives state
        if (state.slide !== undefined) {
            setCurrentSlide(state.slide);
        }
        if (state.history) {
            // Update external history for SlideDeck to consume
            if (state.slideIndex !== undefined) {
                setExternalHistory(prev => ({
                    ...prev,
                    [state.slideIndex]: state.history
                }));
            }
        }
    }, []);

    const handlePDFData = useCallback(async (blob: Blob, collectionId: string) => {
        // Viewer receives PDF blob
        await savePDF(collectionId, blob);
        // If we are currently on this collection (or should be), switch?
        // For now, assuming we are already joined, or we receive metadata first?
        // Simpler: Just save it. If current collection matches, update state.
        if (currentCollectionId === collectionId) {
            setPdfFile(blob);
        }
    }, [currentCollectionId]);

    const broadcast = useBroadcast({
        onRoleChange: setRole,
        onConnectionId: setConnectionId,
        onStateUpdate: handleBroadcastState,
        onPDFData: handlePDFData
    });

    // Notify peers when local state changes (Host only)
    useEffect(() => {
        if (role === 'host') {
            broadcast.sendState({ slide: currentSlide });
        }
    }, [currentSlide, role, broadcast]);

    const handleHistoryChange = (slideIndex: number, history: HistoryState) => {
        if (role === 'host') {
            broadcast.sendState({ slideIndex, history });
        }
    };


    // --- Handlers ---

    const handleCreateCollection = async (title: string, template: 'default' | 'blank' | 'pdf', pdfFile?: File) => {
        const newId = Date.now().toString();
        let pageCount = 0;

        if (template === 'pdf' && pdfFile) {
            await savePDF(newId, pdfFile);
            const arrayBuffer = await pdfFile.arrayBuffer();
            try {
                const pdf = await pdfjs.getDocument(arrayBuffer).promise;
                pageCount = pdf.numPages;
            } catch (e) {
                console.error("Failed to count PDF pages", e);
            }
        }

        const newCollection: Collection = {
            id: newId,
            title,
            date: new Date().toLocaleDateString(),
            template,
            pageCount: pageCount > 0 ? pageCount : undefined
        };

        setCollections(prev => [...prev, newCollection]);
        setCurrentCollectionId(newId);
    };

    const handleAddPage = () => {
        if (!currentCollectionId) return;
        setCustomPages(prev => ({
            ...prev,
            [currentCollectionId]: (prev[currentCollectionId] || 0) + 1
        }));
    };

    const handleJoinSession = (hostId: string) => {
        broadcast.joinSession(hostId);
        // In a real app, we should probably sync the collection metadata from host too
        // For now, we assume user might need to be on a "Broadcast" collection or similar
        // Or simpler: We just switch to a "Broadcast View" or override everything?
        // Let's create a temporary "Broadcast Session" collection if it doesn't exist?
        // Actually, if we join a session, we should probably just show whatever the host shows.
        // But `activeSlides` depends on `currentCollection`.
        // Let's create a dummy collection for the session
        const sessionId = `session-${hostId}`;
        const sessionCollection: Collection = {
            id: sessionId,
            title: `Broadcast: ${hostId}`,
            date: new Date().toLocaleDateString(),
            template: 'blank' // Default, will update if PDF received
        };
        // Check if exists?
        setCollections(prev => {
            if (prev.find(c => c.id === sessionId)) return prev;
            return [...prev, sessionCollection];
        });
        setCurrentCollectionId(sessionId);
    };

    const handleStartBroadcast = async () => {
        const id = await broadcast.startHost();
        alert(`Broadcast started! Share this ID: ${id}`);
        // If current collection is PDF, send it to connected peers?
        // We need to send it when peers connect. `broadcast` hook handles sending on connection?
        // `useBroadcast` logic needs to support "send current PDF to new peer".
        // For now, we can manually send it if needed, or update `useBroadcast` to handle "late joiners".
        // Let's just send it if we have it when a peer connects - logic exists in hook?
        // Actually hook logic `conn.on('open')` sends nothing.
        // We should send PDF if we have one.
        if (pdfFile && currentCollectionId) {
            broadcast.sendPDF(pdfFile, currentCollectionId);
        }
    };


    // --- Render ---

    if (!currentCollectionId) {
        return (
            <Dashboard
                collections={collections}
                onCreateCollection={handleCreateCollection}
                onSelectCollection={setCurrentCollectionId}
                onJoinSession={handleJoinSession}
            />
        );
    }

    // Construct slides
    const currentCollection = collections.find(c => c.id === currentCollectionId);

    // Memoize slides to prevent recreation on every render
    const activeSlides = useMemo(() => {
        if (!currentCollection) return [];

        const extraPagesCount = customPages[currentCollectionId] || 0;
        const extraSlides = Array(extraPagesCount).fill(NoteSlide);

        if (currentCollection.template === 'pdf') {
            if (currentCollection.pageCount) {
                const pdfSlides = Array.from({ length: currentCollection.pageCount }, (_, i) => {
                    // Create a component that renders this specific page
                    // We wrap it to pass the pdfFile from closure/prop
                    // But we need to ensure pdfFile is available. 
                    // We can pass it as a prop to SlideDeck? No, SlideDeck expects explicit components.
                    // We can create a HOC or closure component.

                    // Helper component for this specific slide
                    const PdfPageSlide = (props: any) => (
                        loadingPdf || !pdfFile ?
                            <div className="flex items-center justify-center h-full">Loading PDF...</div> :
                            <PDFSlide {...props} pdfFile={pdfFile} pageNumber={i + 1} />
                    );
                    return PdfPageSlide;
                });
                return [...pdfSlides, ...extraSlides];
            }
            return extraSlides; // Fallback
        } else if (currentCollection.template === 'blank') {
            return [NoteSlide, ...extraSlides];
        } else {
            return [...DEFAULT_SLIDES, ...extraSlides];
        }
    }, [currentCollection, customPages, currentCollectionId, pdfFile, loadingPdf]);

    return (
        <div className="relative">
            {/* Top Bar Controls */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                {role === 'none' && (
                    <button
                        onClick={handleStartBroadcast}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 shadow-md font-bold"
                    >
                        Start Broadcast
                    </button>
                )}
                {role !== 'none' && (
                    <div className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg shadow-md font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        {role === 'host' ? `Hosting (${connectionId})` : 'Connected'}
                    </div>
                )}
                <button
                    onClick={() => {
                        broadcast.disconnect();
                        setCurrentCollectionId(null);
                    }}
                    className="px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 opacity-90 hover:opacity-100 shadow-md font-bold"
                >
                    Exit
                </button>
            </div>

            <SlideDeck
                key={currentCollectionId}
                slides={activeSlides}
                collectionId={currentCollectionId}
                onAddPage={handleAddPage}
                // Controlled State
                currentSlide={currentSlide}
                onSlideChange={(idx) => {
                    // Viewers cannot change slides
                    if (role !== 'viewer') {
                        setCurrentSlide(idx);
                    }
                }}
                // Sync
                onHistoryChange={handleHistoryChange}
                externalHistory={externalHistory}
            />
        </div>
    );
}
