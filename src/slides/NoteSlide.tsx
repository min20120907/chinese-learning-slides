import React from 'react';
import { SlideProps } from '../types';

export const NoteSlide: React.FC<SlideProps> = () => {
    return (
        <div className="w-full h-full bg-slate-50 pattern-grid">
            {/* Just a blank canvas for notes, pattern background handled by CSS if needed, else plain */}
        </div>
    );
};
