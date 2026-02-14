import React, { useRef, useState } from 'react';
import { Upload, Monitor, Users } from 'lucide-react';

interface Collection {
    id: string;
    title: string;
    date: string;
    template?: 'default' | 'blank' | 'pdf';
}

interface DashboardProps {
    collections: Collection[];
    onCreateCollection: (title: string, template: 'default' | 'blank' | 'pdf', pdfFile?: File) => void;
    onSelectCollection: (id: string) => void;
    onJoinSession: (hostId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ collections, onCreateCollection, onSelectCollection, onJoinSession }) => {
    const [newTitle, setNewTitle] = useState('');
    const [template, setTemplate] = useState<'default' | 'blank' | 'pdf'>('default');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [hostId, setHostId] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTitle.trim()) {
            if (template === 'pdf' && !pdfFile) return;
            onCreateCollection(newTitle, template, pdfFile || undefined);
            setNewTitle('');
            setTemplate('default');
            setPdfFile(null);
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
            <h1 className="text-4xl font-bold text-indigo-900 mb-8">My Presentations</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Create New Card */}
                <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-indigo-200 flex flex-col justify-center gap-4 hover:border-indigo-400 transition-colors">
                    <h2 className="text-lg font-bold text-indigo-900 text-center">New Presentation</h2>
                    <form onSubmit={handleCreate} className="w-full flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Presentation Name"
                            className="w-full p-2 border border-slate-200 rounded-lg text-center"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />

                        <div className="flex gap-2 justify-center text-sm flex-wrap">
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="template"
                                    value="default"
                                    checked={template === 'default'}
                                    onChange={() => setTemplate('default')}
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
                                />
                                <span>PDF</span>
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
                            disabled={!newTitle.trim() || (template === 'pdf' && !pdfFile)}
                            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold disabled:opacity-50 hover:bg-indigo-700"
                        >
                            + Create
                        </button>
                    </form>
                </div>

                {/* Join Session Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-center gap-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
                        <Users size={20} />
                        Join Session
                    </h2>
                    <div className="w-full flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Enter Host ID"
                            className="w-full p-2 border border-slate-200 rounded-lg text-center font-mono text-sm"
                            value={hostId}
                            onChange={(e) => setHostId(e.target.value)}
                        />
                        <button
                            onClick={() => onJoinSession(hostId)}
                            disabled={!hostId.trim()}
                            className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold disabled:opacity-50 hover:bg-emerald-700 flex items-center justify-center gap-2"
                        >
                            <Monitor size={16} />
                            Join Broadcast
                        </button>
                    </div>
                </div>

                {/* Existing Collections */}
                {collections.map(c => (
                    <button
                        key={c.id}
                        onClick={() => onSelectCollection(c.id)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col text-left hover:shadow-md transition-all group relative"
                    >
                        <div className="absolute top-4 right-4">
                            {c.template === 'pdf' && <Upload size={16} className="text-slate-400" />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 mb-2 truncate pr-6">{c.title}</h3>
                        <p className="text-sm text-slate-400">{c.date}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};
