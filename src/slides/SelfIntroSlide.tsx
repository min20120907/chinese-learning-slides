import React from 'react';
import { SlideProps } from '../types';

export const SelfIntroSlide: React.FC<SlideProps> = () => {
    const vocabList = [
        { zh: '泡溫泉', py: 'pào wēnquán', jp: '温泉に入ること' },
        { zh: '攝影', py: 'shèyǐng', jp: '撮影' },
        { zh: '騎腳踏車', py: 'qí jiǎotàchē', jp: '自転車に乗ること' },
        { zh: '語言學習', py: 'yǔyán xuéxí', jp: '語学学習' },
        { zh: '吃蕎麥麵', py: 'chī qiáomàimiàn', jp: 'そばを食べること' },
        { zh: '吃鳳梨', py: 'chī fènglí', jp: 'パイナップルを食べること' },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50 p-8 overflow-y-auto select-none">
            <h2 className="text-3xl font-bold text-indigo-900 mb-6">自己介紹 (Zìjǐ jièshào)</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                {/* Sentence Patterns */}
                <div className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-fit">

                    <div className="space-y-1">
                        <p className="text-sm text-slate-400 font-bold uppercase">Greeting</p>
                        <p className="text-2xl font-bold text-slate-800">大家好 (Dàjiā hǎo)</p>
                        <p className="text-sm text-slate-500">皆さん、こんにちは</p>
                    </div>

                    <div className="space-y-1 group">
                        <p className="text-sm text-slate-400 font-bold uppercase">Name</p>
                        <div className="flex items-baseline gap-2 text-xl font-medium text-slate-800">
                            <span>我的名字叫做</span>
                            <span className="border-b-2 border-indigo-300 min-w-[100px] text-center text-indigo-600">〇〇</span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">Wǒ de míngzì jiàozuò ...</p>
                    </div>

                    <div className="space-y-1 group">
                        <p className="text-sm text-slate-400 font-bold uppercase">Affiliation / Job</p>
                        <div className="flex items-baseline gap-2 text-xl font-medium text-slate-800">
                            <span>我就讀</span>
                            <span className="border-b-2 border-indigo-300 min-w-[100px] text-center text-indigo-600">〇〇</span>
                            <span>大學</span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">Wǒ jiùdú ... dàxué</p>
                    </div>

                    <div className="space-y-1 group">
                        <p className="text-sm text-slate-400 font-bold uppercase">Age</p>
                        <div className="flex items-baseline gap-2 text-xl font-medium text-slate-800">
                            <span>我今年</span>
                            <span className="border-b-2 border-indigo-300 min-w-[60px] text-center text-indigo-600">〇〇</span>
                            <span>歲</span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">Wǒ jīnnián ... suì</p>
                    </div>

                    <div className="space-y-1 group">
                        <p className="text-sm text-slate-400 font-bold uppercase">Hobby</p>
                        <div className="flex items-baseline gap-2 text-xl font-medium text-slate-800">
                            <span>我的興趣是</span>
                            <span className="border-b-2 border-indigo-300 min-w-[100px] text-center text-indigo-600">〇〇</span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">Wǒ de xìngqù shì ...</p>
                    </div>

                    <div className="space-y-1 pt-4 border-t border-slate-100">
                        <p className="text-sm text-slate-400 font-bold uppercase">Closing</p>
                        <p className="text-2xl font-bold text-slate-800">請多多指教 (Qǐng duōduō zhǐjiào)</p>
                        <p className="text-sm text-slate-500">よろしくおねがいします</p>
                    </div>
                </div>

                {/* Vocabulary List */}
                <div className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100 h-fit">
                    <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        參考單字 (Vocabulary)
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {vocabList.map((v, i) => (
                            <div key={i} className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm flex flex-col">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg font-bold text-indigo-700">{v.zh}</span>
                                    <span className="text-xs text-slate-400">{v.jp}</span>
                                </div>
                                <span className="text-sm font-mono text-slate-500">{v.py}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
