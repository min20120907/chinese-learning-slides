import { useState, useEffect, useMemo } from 'react';
import { SlideDeck } from './components/SlideDeck';
import { Dashboard } from './components/Dashboard';
import { TitleSlide } from './slides/TitleSlide';
import { SelfIntroSlide } from './slides/SelfIntroSlide';
import { PinyinSlide } from './slides/PinyinSlide';
import { NumbersSlide } from './slides/NumbersSlide';
import { MeasureWordsSlide } from './slides/MeasureWordsSlide';
import { NumberSentencesSlide } from './slides/NumberSentencesSlide';
import { NoteSlide } from './slides/NoteSlide';
import { PDFSlide } from './components/PDFSlide';
import { db } from './firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
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
    pdfUrl?: string;
    pageCount?: number;
};

export default function App() {
    // --- State ---
    const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);
    const [currentCollection, setCurrentCollection] = useState<Collection | null>(null);
    const [customPages, setCustomPages] = useState<Record<string, number>>({});

    // Lifted state
    const [currentSlide, setCurrentSlide] = useState(0);

    // --- Firebase Listeners ---

    // 1. Listen to current collection metadata when ID changes
    useEffect(() => {
        if (!currentCollectionId) {
            setCurrentCollection(null);
            return;
        }

        const unsub = onSnapshot(doc(db, 'collections', currentCollectionId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as Collection;
                setCurrentCollection({ ...data, id: docSnap.id });
            }
        });

        return () => unsub();
    }, [currentCollectionId]);

    // 2. Listen to custom pages count
    useEffect(() => {
        if (!currentCollectionId) return;
        const unsub = onSnapshot(doc(db, 'custom_pages', currentCollectionId), (docSnap) => {
            if (docSnap.exists()) {
                setCustomPages(prev => ({
                    ...prev,
                    [currentCollectionId]: docSnap.data().count || 0
                }));
            }
        });
        return () => unsub();
    }, [currentCollectionId]);

    // 3. Listen to current slide index (Sync Navigation)
    useEffect(() => {
        if (!currentCollectionId) return;

        const unsub = onSnapshot(doc(db, 'slides_state', currentCollectionId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.currentSlide !== undefined) {
                    setCurrentSlide(data.currentSlide);
                }
            }
        });
        return () => unsub();
    }, [currentCollectionId]);


    // --- Persistence Handlers (Writes) ---

    // NOTE: This implementation assumes "Everyone is Host", i.e., shared control.
    // If we wanted role-based, we'd check a 'role' state before writing.
    const updateCurrentSlide = async (index: number) => {
        setCurrentSlide(index); // Optimistic update
        if (currentCollectionId) {
            await setDoc(doc(db, 'slides_state', currentCollectionId), {
                currentSlide: index
            }, { merge: true });
        }
    };

    const handleAddPage = async () => {
        if (!currentCollectionId) return;
        const newCount = (customPages[currentCollectionId] || 0) + 1;
        setCustomPages(prev => ({ ...prev, [currentCollectionId]: newCount })); // Optimistic
        await setDoc(doc(db, 'custom_pages', currentCollectionId), {
            count: newCount
        }, { merge: true });
    };

    const handleSelectCollection = (id: string) => {
        setCurrentCollectionId(id);
    };

    // --- Render ---

    if (!currentCollectionId) {
        return (
            <Dashboard
                onSelectCollection={handleSelectCollection}
            />
        );
    }

    // Determine slides to render
    const activeSlides = useMemo(() => {
        if (!currentCollection) return [];

        const extraPagesCount = customPages[currentCollectionId] || 0;
        const extraSlides = Array(extraPagesCount).fill(NoteSlide);

        if (currentCollection.template === 'pdf') {
            if (currentCollection.pageCount) {
                const pdfSlides = Array.from({ length: currentCollection.pageCount }, (_, i) => {
                    const PdfPageSlide = (props: any) => (
                        <PDFSlide
                            {...props}
                            pdfFile={currentCollection.pdfUrl}
                            pageNumber={i + 1}
                        />
                    );
                    return PdfPageSlide;
                });
                return [...pdfSlides, ...extraSlides];
            }
            return extraSlides;
        } else if (currentCollection.template === 'blank') {
            return [NoteSlide, ...extraSlides];
        } else {
            return [...DEFAULT_SLIDES, ...extraSlides];
        }
    }, [currentCollection, customPages, currentCollectionId]);

    return (
        <div className="relative">
            <button
                onClick={() => setCurrentCollectionId(null)}
                className="absolute top-4 right-20 z-50 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 opacity-50 hover:opacity-100 transition-all font-bold"
            >
                Dashboard
            </button>
            <SlideDeck
                key={currentCollectionId}
                slides={activeSlides}
                collectionId={currentCollectionId}
                onAddPage={handleAddPage}
                // Controlled State
                currentSlide={currentSlide}
                onSlideChange={updateCurrentSlide}
            />
        </div>
    );
}
