import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { SlideProps } from '../types';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFSlideProps extends SlideProps {
    pdfFile: Blob;
    pageNumber: number;
}

export const PDFSlide: React.FC<PDFSlideProps> = ({ pdfFile, pageNumber }) => {
    const [scale, setScale] = React.useState(1);
    const [pageDimensions, setPageDimensions] = React.useState<{ width: number; height: number } | null>(null);

    const handlePageLoadSuccess = ({ width, height }: { width: number; height: number }) => {
        setPageDimensions({ width, height });
    };

    // Calculate optimal scale to "contain" the page
    React.useEffect(() => {
        if (!pageDimensions) return;

        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;

        const widthRatio = containerWidth / pageDimensions.width;
        const heightRatio = containerHeight / pageDimensions.height;

        // Use the smaller ratio to ensure it fits both dimensions (contain)
        // Multiply by 0.9 to add a little padding/margin safety
        const bestScale = Math.min(widthRatio, heightRatio) * 0.9;
        setScale(bestScale);
    }, [pageDimensions]);

    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 pointer-events-none select-none overflow-hidden">
            <Document file={pdfFile}>
                <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-lg"
                    scale={scale}
                    onLoadSuccess={handlePageLoadSuccess}
                />
            </Document>
        </div>
    );
};
