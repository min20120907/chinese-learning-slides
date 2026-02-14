import React from 'react';
import { MousePointer2, Pen, Eraser, Type, Undo, Redo } from 'lucide-react';

export type Tool = 'cursor' | 'pen' | 'eraser' | 'text';

interface ToolBarProps {
    currentTool: Tool;
    setTool: (tool: Tool) => void;
    currentColor: string;
    setColor: (color: string) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const COLORS = ['#000000', '#FF0000', '#0000FF', '#008000'];

export const ToolBar: React.FC<ToolBarProps> = ({
    currentTool, setTool, currentColor, setColor,
    onUndo, onRedo, canUndo, canRedo
}) => {
    return (
        <div className="absolute bottom-6 left-8 flex items-center gap-4 z-50 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-slate-200">
            <div className="flex gap-2 border-r border-slate-200 pr-4">
                <button
                    onClick={() => setTool('cursor')}
                    className={`p-2 rounded-xl transition-all ${currentTool === 'cursor' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}
                    title="Cursor (Navigation)"
                >
                    <MousePointer2 size={20} />
                </button>
                <button
                    onClick={() => setTool('pen')}
                    className={`p-2 rounded-xl transition-all ${currentTool === 'pen' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}
                    title="Pen"
                >
                    <Pen size={20} />
                </button>
                <button
                    onClick={() => setTool('eraser')}
                    className={`p-2 rounded-xl transition-all ${currentTool === 'eraser' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}
                    title="Eraser"
                >
                    <Eraser size={20} />
                </button>
                <button
                    onClick={() => setTool('text')}
                    className={`p-2 rounded-xl transition-all ${currentTool === 'text' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}
                    title="Text Box"
                >
                    <Type size={20} />
                </button>
            </div>

            {/* Undo/Redo */}
            <div className="flex gap-2 border-r border-slate-200 pr-4">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className={`p-2 rounded-xl transition-all ${!canUndo ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-600'}`}
                    title="Undo"
                >
                    <Undo size={20} />
                </button>
                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className={`p-2 rounded-xl transition-all ${!canRedo ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-600'}`}
                    title="Redo"
                >
                    <Redo size={20} />
                </button>
            </div>

            {(currentTool === 'pen' || currentTool === 'text') && (
                <div className="flex gap-2">
                    {COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => setColor(color)}
                            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${currentColor === color ? 'border-slate-400 scale-110 shadow-sm' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select color ${color}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
