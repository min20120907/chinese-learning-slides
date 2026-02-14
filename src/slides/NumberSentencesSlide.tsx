import React from 'react';
import { SlideProps } from '../types';

export const NumberSentencesSlide: React.FC<SlideProps> = () => {
    return (
        <div className="flex flex-col h-full bg-slate-50 p-12 overflow-y-auto select-none">
            <h2 className="text-4xl font-bold text-indigo-900 mb-8">数字を使った文 (Number Sentences)</h2>

            <div className="space-y-8 max-w-4xl mx-auto w-full">

                {/* Price */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl">💰</div>
                    <div className="flex-grow space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-700">這多少錢？ (Zhè duōshǎo qián?)</h3>
                            <span className="text-sm text-slate-400">これはいくらですか？</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-indigo-600">100</span>
                            <span className="text-lg text-slate-600">元 (yuán)</span>
                        </div>
                    </div>
                </div>

                {/* Time */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl">⏰</div>
                    <div className="flex-grow space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-700">現在幾點？ (Xiànzài jǐ diǎn?)</h3>
                            <span className="text-sm text-slate-400">今何時ですか？</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-indigo-600">3</span>
                            <span className="text-lg text-slate-600">點 (diǎn)</span>
                            <span className="text-2xl font-bold text-indigo-600 ml-4">30</span>
                            <span className="text-lg text-slate-600">分 (fēn)</span>
                        </div>
                    </div>
                </div>

                {/* People Count */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-3xl">👥</div>
                    <div className="flex-grow space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-700">幾位？ (Jǐ wèi?)</h3>
                            <span className="text-sm text-slate-400">何名様ですか？</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-indigo-600">2</span>
                            <span className="text-lg text-slate-600">位 (wèi)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
