import React from 'react';
import { SlideProps } from '../types';

export const PinyinSlide: React.FC<SlideProps> = () => {
    return (
        <div className="flex flex-col h-full bg-slate-50 p-12 overflow-y-auto select-none">
            <h2 className="text-4xl font-bold text-indigo-900 mb-8">発音・ピンイン (Pinyin & Tones)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Tones */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-semibold mb-6 text-slate-700 border-b pb-2">四声 (4 Tones)</h3>
                    <div className="flex justify-around items-end h-32">
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-5xl font-bold text-indigo-500">ā</div>
                            <div className="w-16 h-1 bg-indigo-200"></div>
                            <span className="text-sm text-slate-500">平 (Level)</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-5xl font-bold text-indigo-500">á</div>
                            <div className="w-16 h-1 bg-indigo-200 rotate-[-15deg] transform origin-left"></div>
                            <span className="text-sm text-slate-500">上 (Rising)</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-5xl font-bold text-indigo-500">ǎ</div>
                            <div className="w-16 h-10 border-b-4 border-r-4 border-indigo-200 transform rotate-45 rounded-bl-xl border-t-0 border-l-0"></div>
                            <span className="text-sm text-slate-500 block mt-[-30px]">低 (Dip)</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-5xl font-bold text-indigo-500">à</div>
                            <div className="w-16 h-1 bg-indigo-200 rotate-[15deg] transform origin-right"></div>
                            <span className="text-sm text-slate-500">下 (Falling)</span>
                        </div>
                    </div>
                </div>

                {/* Initials/Finals Practice */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-semibold mb-6 text-slate-700 border-b pb-2">練習 (Practice)</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                            <span className="font-bold text-xl text-slate-600 w-12">m</span>
                            <div className="flex gap-4 font-mono text-xl">
                                <span>mā</span>
                                <span>má</span>
                                <span>mǎ</span>
                                <span>mà</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                            <span className="font-bold text-xl text-slate-600 w-12">b</span>
                            <div className="flex gap-4 font-mono text-xl">
                                <span>bā</span>
                                <span>bá</span>
                                <span>bǎ</span>
                                <span>bà</span>
                            </div>
                        </div>
                        <div className="p-4 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 text-center text-indigo-400">
                            ここに書いて練習しましょう<br />(Write tones here)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
