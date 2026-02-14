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
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 pointer-events-none select-none">
            <Document file={pdfFile}>
                <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-lg"
                    width={window.innerWidth * 0.8} // Responsive width
                />
            </Document>
        </div>
    );
};
