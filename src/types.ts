import React from 'react';

export type SlideProps = {
    isActive: boolean;
};

export type SlideComponent = React.FC<SlideProps>;

export type Point = { x: number; y: number };
export type Path = { points: Point[]; color: string; width: number; mode?: 'draw' | 'erase' };
export type TextBox = { id: string; x: number; y: number; text: string; color: string };

export type DrawingData = {
    paths: Path[];
    textBoxes: TextBox[];
};
