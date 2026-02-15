import React, { useRef, useEffect, useState } from 'react';
import { DrawingData, Path, Point, TextBox } from '../types';
import { Tool } from './ToolBar';

interface InteractiveOverlayProps {
    tool: Tool;
    color: string;
    data: DrawingData;
    onUpdate: (data: DrawingData) => void;
    width: number;
    height: number;
    readOnly?: boolean;
}

export const InteractiveOverlay: React.FC<InteractiveOverlayProps> = ({
    tool,
    color,
    data,
    onUpdate,
    width,
    height,
    readOnly = false,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState<Point[]>([]);

    // Redraw canvas when data changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        data.paths.forEach((path) => {
            if (path.points.length < 2) return;

            ctx.globalCompositeOperation = path.mode === 'erase' ? 'destination-out' : 'source-over';

            ctx.beginPath();
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.width;
            ctx.moveTo(path.points[0].x, path.points[0].y);
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i].x, path.points[i].y);
            }
            ctx.stroke();
        });

        // Reset composite operation after loop
        ctx.globalCompositeOperation = 'source-over';
    }, [data.paths, width, height]);

    const getPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (tool === 'cursor') return;
        if (tool === 'text') {
            // Handled by click for adding text, but preventing default might be needed?
            return;
        }

        e.preventDefault(); // Prevent scrolling on touch
        setIsDrawing(true);
        const point = getPoint(e);
        setCurrentPath([point]);
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || (tool !== 'pen' && tool !== 'eraser')) return;
        e.preventDefault();
        const point = getPoint(e);

        // Optimistic render for current stroke could be added here for performance
        // For now, let's just update local state or directly draw?
        // React state update on every move is slow. Direct canvas draw is better.

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && currentPath.length > 0) {
            const lastPoint = currentPath[currentPath.length - 1];

            ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';

            ctx.beginPath();
            ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
            ctx.lineWidth = tool === 'eraser' ? 20 : 3;
            ctx.lineCap = 'round';
            ctx.moveTo(lastPoint.x, lastPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();

            // Reset
            ctx.globalCompositeOperation = 'source-over';
        }

        setCurrentPath(prev => [...prev, point]);
    };

    const handleEnd = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (currentPath.length > 0) {
            const newPath: Path = {
                points: currentPath,
                color: tool === 'eraser' ? '#ffffff' : color,
                width: tool === 'eraser' ? 20 : 3,
                mode: tool === 'eraser' ? 'erase' : 'draw'
            };
            onUpdate({
                ...data,
                paths: [...data.paths, newPath]
            });
        }
        setCurrentPath([]);
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (tool !== 'text') return;

        const point = getPoint(e);
        const newBox: TextBox = {
            id: Date.now().toString(),
            x: point.x,
            y: point.y,
            text: 'Type here',
            color: color
        };

        onUpdate({
            ...data,
            textBoxes: [...data.textBoxes, newBox]
        });
    };

    const handleTextChange = (id: string, newText: string) => {
        const newBoxes = data.textBoxes.map(box => box.id === id ? { ...box, text: newText } : box);
        onUpdate({ ...data, textBoxes: newBoxes });
    };

    const handleDeleteText = (id: string) => {
        const newBoxes = data.textBoxes.filter(box => box.id !== id);
        onUpdate({ ...data, textBoxes: newBoxes });
    };

    return (
        <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Canvas for drawing */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className={`absolute inset-0 ${!readOnly && tool !== 'cursor' ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'}`}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                onClick={handleCanvasClick}
            />

            {/* Text Overlays */}
            {data.textBoxes.map(box => (
                <div
                    key={box.id}
                    style={{
                        position: 'absolute',
                        left: box.x,
                        top: box.y,
                        color: box.color,
                        pointerEvents: !readOnly && (tool === 'cursor' || tool === 'text') ? 'auto' : 'none'
                    }}
                    className="group"
                >
                    <div className="relative">
                        <input
                            value={box.text}
                            onChange={(e) => handleTextChange(box.id, e.target.value)}
                            className="bg-transparent border border-dashed border-gray-300 hover:border-blue-400 focus:border-blue-600 outline-none p-1 rounded pr-6" // Added padding-right
                            style={{ minWidth: '100px', color: box.color }}
                            autoFocus={box.text === 'Type here'}
                        />
                        {/* Delete Button (Visible on Hover or Focus) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent canvas click?
                                handleDeleteText(box.id);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Delete text"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
