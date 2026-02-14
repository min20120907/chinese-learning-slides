import React, { useState, useEffect } from 'react';
import { SlideDeck } from './components/SlideDeck';
import { Dashboard } from './components/Dashboard';
import { TitleSlide } from './slides/TitleSlide';
import { SelfIntroSlide } from './slides/SelfIntroSlide';
import { PinyinSlide } from './slides/PinyinSlide';
import { NumbersSlide } from './slides/NumbersSlide';
import { MeasureWordsSlide } from './slides/MeasureWordsSlide';
import { NumberSentencesSlide } from './slides/NumberSentencesSlide';
import { NoteSlide } from './slides/NoteSlide';
import { SlideProps } from './types';

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
    const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null);
    const [collections, setCollections] = useState<{ id: string; title: string; date: string }[]>([]);
    // Store custom pages count per collection to reconstruct the deck
    const [customPages, setCustomPages] = useState<Record<string, number>>({});

    useEffect(() => {
        const savedCollections = localStorage.getItem('collections_meta');
        const savedCustomPages = localStorage.getItem('collections_custom_pages');
        const savedCurrentId = localStorage.getItem('current_collection_id');

        if (savedCollections) setCollections(JSON.parse(savedCollections));
        if (savedCustomPages) setCustomPages(JSON.parse(savedCustomPages));
        if (savedCurrentId) setCurrentCollectionId(savedCurrentId);
    }, []);

    useEffect(() => {
        localStorage.setItem('collections_meta', JSON.stringify(collections));
        localStorage.setItem('collections_custom_pages', JSON.stringify(customPages));
        if (currentCollectionId) {
            localStorage.setItem('current_collection_id', currentCollectionId);
        } else {
            localStorage.removeItem('current_collection_id');
        }
    }, [collections, customPages, currentCollectionId]);

    const handleCreateCollection = (title: string) => {
        const newId = Date.now().toString();
        const newCollection = {
            id: newId,
            title,
            date: new Date().toLocaleDateString()
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
    const extraPagesCount = customPages[currentCollectionId] || 0;
    const extraSlides = Array(extraPagesCount).fill(NoteSlide);
    const activeSlides = [...DEFAULT_SLIDES, ...extraSlides];

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
