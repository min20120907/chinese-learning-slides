import React from 'react';
import { SlideProps } from '../types';

export const TitleSlide: React.FC<SlideProps> = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-900 pointer-events-none select-none">
            <div className="absolute top-8 left-8 text-slate-400 font-bold text-xl tracking-wider">
                福百
            </div>

            <h1 className="text-5xl font-bold mb-6 tracking-tight text-indigo-900 text-center leading-tight">
                你好世界 中國語サークル<br />
                <span className="text-6xl block mt-4 text-indigo-600">第三回</span>
            </h1>

            <div className="mt-8 px-8 py-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                <p className="text-2xl text-slate-600 font-medium">数字與自己介紹的複習</p>
                <p className="text-lg text-slate-400 mt-1 text-center">(数字と自己紹介の復習)</p>
            </div>

            <div className="mt-12 text-sm text-slate-400 font-jp">
                矢印キー(← →)またはスペースキーでスライドを移動
            </div>
        </div>
    );
};
