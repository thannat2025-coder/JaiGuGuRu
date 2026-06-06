import React from 'react';
import { Quote, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import BrandLogo from '@/src/components/BrandLogo';

interface ShareableCardProps {
  type: 'mood' | 'journal';
  data: any;
  userName: string;
}

export default function ShareableCard({ type, data, userName }: ShareableCardProps) {
  const getEmotionEmoji = (type: string) => {
    if (data.emoji) return data.emoji;
    const emojis: Record<string, string> = {
      'Joy (ลั้นลา)': '😆',
      'Sadness (เศร้าซึม)': '😢',
      'Anger (ฉุนเฉียว)': '😡',
      'Fear (กลัว)': '😨',
      'Disgust (หยะแหยง)': '🤢',
      'Anxiety (ว้าวุ่น)': '😟',
      'Envy (อิจฉา)': '🥺',
      'Ennui (เซ็ง)': '😒',
      'Embarrassment (เขินอาย)': '😳',
      'Nostalgia (คิดถึง)': '👵'
    };
    return emojis[type] || '✨';
  };

  return (
    <div id="shareable-card" className="w-[400px] bg-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden border-8 border-indigo-50">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl opacity-50" />
      
      <div className="relative z-10 space-y-6">
        {/* Branding */}
        <BrandLogo size="sm" showText={true} />

        {type === 'mood' ? (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner">
                {getEmotionEmoji(data.emotionType)}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">{data.emotionType}</h3>
                <p className="text-slate-400 text-sm font-medium">ระดับความเข้มข้น {data.mood}/10</p>
              </div>
            </div>

            {data.note && (
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative">
                <Quote className="w-8 h-8 text-indigo-100 absolute -top-2 -left-2 rotate-180" />
                <p className="text-slate-600 text-sm leading-relaxed italic relative z-10">
                  {data.note}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <div className="bg-indigo-600 p-6 rounded-[2rem] text-white space-y-2">
              <h3 className="font-bold flex items-center gap-2">
                <Quote className="w-4 h-4" /> บันทึกความคิด
              </h3>
              <p className="text-indigo-100 text-xs leading-relaxed opacity-90">
                "การก้าวผ่านวันท้าทาย เริ่มต้นจากการกล้าเผชิญหน้ากับความคิด"
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">สถานการณ์</p>
                <p className="text-sm font-bold text-slate-800 leading-snug">{data.situation}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">มุมมองใหม่</p>
                <p className="text-sm text-slate-600 leading-relaxed italic bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  {data.rationalResponse}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">
              {data.date ? format(data.date, 'dd MMMM yyyy', { locale: th }) : 'วันนี้'}
            </span>
          </div>
          <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">
            {userName}'s Journey
          </div>
        </div>
      </div>
    </div>
  );
}
