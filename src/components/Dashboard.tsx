import React from 'react';

interface Collection {
    id: string;
    title: string;
    date: string;
}

interface DashboardProps {
    collections: Collection[];
    onCreateCollection: (title: string, template: 'default' | 'blank') => void;
    onSelectCollection: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ collections, onCreateCollection, onSelectCollection }) => {
    const [newTitle, setNewTitle] = React.useState('');
    const [template, setTemplate] = React.useState<'default' | 'blank'>('default');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTitle.trim()) {
            onCreateCollection(newTitle, template);
            setNewTitle('');
            setTemplate('default');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-12">
            <h1 className="text-4xl font-bold text-indigo-900 mb-8">My Presentations</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Create New Card */}
                <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-indigo-200 flex flex-col justify-center items-center gap-4 hover:border-indigo-400 transition-colors">
                    <form onSubmit={handleCreate} className="w-full flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="New Presentation Name"
                            className="w-full p-2 border border-slate-200 rounded-lg text-center"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />

                        <div className="flex gap-2 justify-center text-sm">
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="template"
                                    value="default"
                                    checked={template === 'default'}
                                    onChange={() => setTemplate('default')}
                                />
                                <span>Default Lesson</span>
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
                        </div>

                        <button
                            type="submit"
                            disabled={!newTitle.trim()}
                            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold disabled:opacity-50 hover:bg-indigo-700"
                        >
                            + Create New
                        </button>
                    </form>
                </div>

                {/* Existing Collections */}
                {collections.map(c => (
                    <button
                        key={c.id}
                        onClick={() => onSelectCollection(c.id)}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col text-left hover:shadow-md transition-all group"
                    >
                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 mb-2">{c.title}</h3>
                        <p className="text-sm text-slate-400">{c.date}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};
