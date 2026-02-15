import React, { useRef, useState, useEffect } from 'react';
import { Upload, Users, FileText } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { pdfjs } from 'react-pdf';

// Configure PDF worker globally if not already done in App
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Collection {
    id: string;
    title: string;
    date: string;
    template?: 'default' | 'blank' | 'pdf';
    pdfUrl?: string;
    pageCount?: number;
}

interface DashboardProps {
    onSelectCollection: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectCollection }) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [template, setTemplate] = useState<'default' | 'blank' | 'pdf'>('default');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load collections from Firestore
    useEffect(() => {
        const q = query(collection(db, 'collections'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cols = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Collection[];
            setCollections(cols);
        });

        return () => unsubscribe();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        if (template === 'pdf' && !pdfFile) return;

        setIsUploading(true);

        try {
            let pdfUrl = '';
            let pageCount = 0;

            if (template === 'pdf' && pdfFile) {
                // 1. Upload PDF to Firebase Storage
                const storageRef = ref(storage, `pdfs/${Date.now()}_${pdfFile.name}`);
                const snapshot = await uploadBytes(storageRef, pdfFile);
                pdfUrl = await getDownloadURL(snapshot.ref);

                // 2. Count pages
                const arrayBuffer = await pdfFile.arrayBuffer();
                const pdf = await pdfjs.getDocument(arrayBuffer).promise;
                pageCount = pdf.numPages;
            }

            // 3. Save metadata to Firestore
            const collectionData: any = {
                title: newTitle,
                template,
                date: new Date().toLocaleDateString(),
                createdAt: Timestamp.now(),
            };

            if (pdfUrl) collectionData.pdfUrl = pdfUrl;
            if (pageCount) collectionData.pageCount = pageCount;

            await addDoc(collection(db, 'collections'), collectionData);

            setNewTitle('');
            setTemplate('default');
            setPdfFile(null);
        } catch (error: any) {
            console.error("Error creating collection:", error);
            alert(`Failed to create collection: ${error.message || error}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPdfFile(e.target.files[0]);
            setTemplate('pdf');
            if (!newTitle) {
                setNewTitle(e.target.files[0].name.replace('.pdf', ''));
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-12">
            <h1 className="text-4xl font-bold text-indigo-900 mb-8 flex items-center gap-4">
                <Users size={40} />
                Shared Presentations
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Create New Card */}
                <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-indigo-200 flex flex-col justify-center gap-4 hover:border-indigo-400 transition-colors">
                    <h2 className="text-lg font-bold text-indigo-900 text-center">New Shared Presentation</h2>
                    <form onSubmit={handleCreate} className="w-full flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Presentation Name"
                            className="w-full p-2 border border-slate-200 rounded-lg text-center"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            disabled={isUploading}
                        />

                        <div className="flex gap-2 justify-center text-sm flex-wrap">
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="template"
                                    value="default"
                                    checked={template === 'default'}
                                    onChange={() => setTemplate('default')}
                                    disabled={isUploading}
                                />
                                <span>Default</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="template"
                                    value="blank"
                                    checked={template === 'blank'}
                                    onChange={() => setTemplate('blank')}
                                    disabled={isUploading}
                                />
                                <span>Blank</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="template"
                                    value="pdf"
                                    checked={template === 'pdf'}
                                    onChange={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                />
                                <span>Upload PDF</span>
                            </label>
                        </div>

                        <input
                            type="file"
                            accept=".pdf"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {pdfFile && (
                            <div className="text-xs text-center text-slate-500 truncate px-2">
                                Selected: {pdfFile.name}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!newTitle.trim() || (template === 'pdf' && !pdfFile) || isUploading}
                            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold disabled:opacity-50 hover:bg-indigo-700 flex justify-center items-center gap-2"
                        >
                            {isUploading ? 'Uploading...' : '+ Create & Share'}
                        </button>
                    </form>
                </div>

                {/* Existing Collections from Firestore */}
                {collections.map(c => (
                    <button
                        key={c.id}
                        onClick={() => onSelectCollection(c.id)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col text-left hover:shadow-md transition-all group relative"
                    >
                        <div className="absolute top-4 right-4">
                            {c.template === 'pdf' && <Upload size={16} className="text-slate-400" />}
                            {c.template === 'default' && <Users size={16} className="text-slate-400" />}
                            {c.template === 'blank' && <FileText size={16} className="text-slate-400" />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 mb-2 truncate pr-6">{c.title}</h3>
                        <p className="text-sm text-slate-400">{c.date}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};
