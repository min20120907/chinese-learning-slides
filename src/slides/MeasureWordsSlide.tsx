import React from 'react';
import { SlideProps } from '../types';

export const MeasureWordsSlide: React.FC<SlideProps> = () => {
    const quantifiers = [
        { char: '個', pinyin: 'gè', usage: '一般 (General)', example: '一個人 (Yī gè rén) - One person' },
        { char: '位', pinyin: 'wèi', usage: '丁寧 (Polite/People)', example: '一位老師 (Yī wèi lǎoshī) - One teacher' },
        { char: '本', pinyin: 'běn', usage: '本 (Books)', example: '兩本書 (Liǎng běn shū) - Two books' },
        { char: '杯', pinyin: 'bēi', usage: 'カップ (Cups)', example: '三杯茶 (Sān bēi chá) - Three cups of tea' },
        { char: '隻', pinyin: 'zhī', usage: '動物 (Animals)', example: '四隻貓 (Sì zhī māo) - Four cats' },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50 p-12 overflow-y-auto select-none">
            <h2 className="text-4xl font-bold text-indigo-900 mb-8">量詞 (Measure Words)</h2>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-5xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quantifiers.map((q) => (
                        <div key={q.char} className="flex flex-col p-4 border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-baseline mb-2">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-extrabold text-indigo-600">{q.char}</span>
                                    <span className="font-mono text-lg text-slate-500">{q.pinyin}</span>
                                </div>
                                <span className="text-sm font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{q.usage}</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-dashed border-slate-100 text-slate-700 font-medium">
                                {q.example.split(' - ')[0]}<br />
                                <span className="text-sm text-slate-400 font-normal">{q.example.split(' - ')[1]}</span>
                            </div>
                        </div>
                    ))}

                    {/* Practice Box */}
                    <div className="flex flex-col p-4 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/20 justify-center items-center text-center">
                        <p className="text-indigo-400 font-bold mb-2">練習 (Practice)</p>
                        <p className="text-sm text-slate-500">例：コーヒー 1杯 = ?</p>
                        <div className="h-8 w-32 border-b border-indigo-300 mt-2"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
