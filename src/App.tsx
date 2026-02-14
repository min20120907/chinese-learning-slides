import { useState, useEffect } from 'react';
import { SlideDeck } from './components/SlideDeck';
import { Dashboard } from './components/Dashboard';
import { TitleSlide } from './slides/TitleSlide';
import { SelfIntroSlide } from './slides/SelfIntroSlide';
import { PinyinSlide } from './slides/PinyinSlide';
import { NumbersSlide } from './slides/NumbersSlide';
import { MeasureWordsSlide } from './slides/MeasureWordsSlide';
import { NumberSentencesSlide } from './slides/NumberSentencesSlide';
import { NoteSlide } from './slides/NoteSlide';

// Default slides for any new session
const DEFAULT_SLIDES = [
    TitleSlide,
    SelfIntroSlide,
    PinyinSlide,
    NumbersSlide,
    MeasureWordsSlide,
    NumberSentencesSlide
];

export default function App() {
    const [collections, setCollections] = useState<{ id: string; title: string; date: string; template?: 'default' | 'blank' }[]>(() => {
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

    useEffect(() => {
        localStorage.setItem('collections_meta', JSON.stringify(collections));
        localStorage.setItem('collections_custom_pages', JSON.stringify(customPages));
        if (currentCollectionId) {
            localStorage.setItem('current_collection_id', currentCollectionId);
        } else {
            localStorage.removeItem('current_collection_id');
        }
    }, [collections, customPages, currentCollectionId]);

    const handleCreateCollection = (title: string, template: 'default' | 'blank') => {
        const newId = Date.now().toString();
        const newCollection = {
            id: newId,
            title,
            date: new Date().toLocaleDateString(),
            template
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

    if (!currentCollectionId) {
        return (
            <Dashboard
                collections={collections}
                onCreateCollection={handleCreateCollection}
                onSelectCollection={setCurrentCollectionId}
            />
        );
    }

    // Construct slides: Default + Custom Note Slides
    const currentCollection = collections.find(c => c.id === currentCollectionId);
    const isBlank = currentCollection?.template === 'blank';
    const baseSlides = isBlank ? [NoteSlide] : DEFAULT_SLIDES;

    const extraPagesCount = customPages[currentCollectionId] || 0;
    const extraSlides = Array(extraPagesCount).fill(NoteSlide);
    const activeSlides = [...baseSlides, ...extraSlides];

    return (
        <div className="relative">
            <button
                onClick={() => setCurrentCollectionId(null)}
                className="absolute top-4 right-4 z-50 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 opacity-50 hover:opacity-100 transition-all font-bold"
            >
                Exit to Dashboard
            </button>
            <SlideDeck
                key={currentCollectionId} // Remount on change
                slides={activeSlides}
                collectionId={currentCollectionId}
                onAddPage={handleAddPage}
            />
        </div>
    );
}
