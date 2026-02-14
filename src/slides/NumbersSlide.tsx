import React from 'react';
import { SlideProps } from '../types';

export const NumbersSlide: React.FC<SlideProps> = () => {
    const basicNumbers = [
        { num: 1, char: '一', pinyin: 'yī' },
        { num: 2, char: '二', pinyin: 'èr' },
        { num: 3, char: '三', pinyin: 'sān' },
        { num: 4, char: '四', pinyin: 'sì' },
        { num: 5, char: '五', pinyin: 'wǔ' },
        { num: 6, char: '六', pinyin: 'liù' },
        { num: 7, char: '七', pinyin: 'qī' },
        { num: 8, char: '八', pinyin: 'bā' },
        { num: 9, char: '九', pinyin: 'jiǔ' },
        { num: 10, char: '十', pinyin: 'shí' },
    ];

    const tens = [
        { num: 10, char: '十', pinyin: 'shí' },
        { num: 20, char: '二十', pinyin: 'èr shí' },
        { num: 30, char: '三十', pinyin: 'sān shí' },
        { num: 40, char: '四十', pinyin: 'sì shí' },
        { num: 50, char: '五十', pinyin: 'wǔ shí' },
        { num: 60, char: '六十', pinyin: 'liù shí' },
        { num: 70, char: '七十', pinyin: 'qī shí' },
        { num: 80, char: '八十', pinyin: 'bā shí' },
        { num: 90, char: '九十', pinyin: 'jiǔ shí' },
        { num: 100, char: '一百', pinyin: 'yī bǎi' },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50 p-12 overflow-y-auto select-none">
            <h2 className="text-4xl font-bold text-indigo-900 mb-8">数字 (Shùzì)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
                {/* Basic 1-10 */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-semibold mb-6 text-slate-700 border-b pb-2">1 - 10</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-xl">
                        {basicNumbers.map(n => (
                            <div key={n.num} className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                                <div className="flex items-baseline gap-3">
                                    <span className="font-mono text-slate-400">{n.num}</span>
                                    <span className="font-extrabold text-indigo-600 text-3xl">{n.char}</span>
                                </div>
                                <span className="text-slate-500 font-medium font-mono">{n.pinyin}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tens */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-semibold mb-6 text-slate-700 border-b pb-2">10 - 100</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-xl">
                        {tens.map(n => (
                            <div key={n.num} className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                                <div className="flex items-baseline gap-3">
                                    <span className="font-mono text-slate-400">{n.num}</span>
                                    <span className="font-extrabold text-indigo-600 text-2xl">{n.char}</span>
                                </div>
                                <span className="text-slate-500 font-medium font-mono text-sm">{n.pinyin}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold mb-4 text-slate-500 uppercase tracking-wide">重要ポイント (Key Points)</h3>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-3xl font-bold text-orange-500">2</span>
                            <span className="text-xl font-bold text-slate-700">二 (èr) vs 兩 (liǎng)</span>
                        </div>
                        <p className="text-orange-900 text-sm leading-relaxed">
                            数字の「2」は通常「二(èr)」ですが、個数を数える時（2個、2人など）は<br />
                            <span className="font-bold">「兩 (liǎng)」</span>を使います。
                        </p>
                    </div>

                    <div className="flex-1 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-3xl font-bold text-blue-500">0</span>
                            <span className="text-xl font-bold text-slate-700">零 (líng)</span>
                        </div>
                        <p className="text-blue-900 text-sm leading-relaxed">
                            ゼロは「零 (líng)」と言います。<br />
                            電話番号などでよく使われます。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
