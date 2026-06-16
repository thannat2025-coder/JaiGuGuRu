import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, EyeOff, CheckCircle2, ShieldAlert, Heart } from 'lucide-react';

interface PrivacyConsentProps {
  onAccept: () => void;
}

export default function PrivacyConsent({ onAccept }: PrivacyConsentProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl"
      >
        <div className="bg-indigo-600 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative w-fit mb-4">
            <ShieldCheck className="w-12 h-12 animate-float text-indigo-100" />
            <Heart className="w-6 h-6 text-rose-400 fill-rose-100 absolute -bottom-1 -right-1" />
          </div>
          <h2 className="text-2xl font-bold mb-2">ความปลอดภัยและความเป็นส่วนตัว</h2>
          <p className="text-indigo-100 text-sm leading-relaxed opacity-90">
            JaiGu (GuRu.D) ใจกุ (กูรู ดี) ให้ความสำคัญสูงสุดกับความลับและข้อมูลส่วนตัวของคุณ เพื่อให้คุณเปลาะบางและเปิดใจได้อย่างสบายใจที่สุด
          </p>
        </div>

        <div className="p-8 space-y-6">
          <ul className="space-y-4">
            <PrivacyItem 
              icon={<Lock className="w-5 h-5 text-indigo-500" />}
              title="การรักษาความลับ 100%"
              desc="ข้อมูลอารมณ์และความคิดของคุณจะเป็นความลับระหว่างคุณและ AI หรือผู้เชี่ยวชาญที่คุณอนุญาตเท่านั้น"
            />
            <PrivacyItem 
              icon={<EyeOff className="w-5 h-5 text-indigo-500" />}
              title="ไม่มีการเปิดเผยตัวตน"
              desc="เราใช้การเข้ารหัสข้อมูลที่ทันสมัย เพื่อป้องกันไม่ให้ข้อมูลระบุตัวตนของคุณรั่วไหลสู่ภายนอก"
            />
            <PrivacyItem 
              icon={<CheckCircle2 className="w-5 h-5 text-indigo-500" />}
              title="สิทธิตามกฎหมาย PDPA"
              desc="คุณมีสิทธิในการเข้าถึง แก้ไข หรือร้องขอให้ลบข้อมูลส่วนบุคคลของคุณได้ทุกเมื่อตามนโยบายของเรา"
            />
            <PrivacyItem 
              icon={<Heart className="w-5 h-5 text-rose-500 fill-rose-50" />}
              title="ลิขสิทธิ์และการคุ้มครองเพื่อผู้มีทุกข์ใจ"
              desc="ลิขสิทธิ์แอปพลิเคชันและการออกแบบเป็นของ นพ.ธันวรุจน์ บูรณสุขสกุล ห้ามลอกเลียนแบบ ดัดแปลง หรือทำซ้ำ ให้ใช้ซอฟต์แวร์นี้เพื่อเยียวยาและเป็นประโยชน์ต่อผู้ที่กำลังเผชิญเหตุและทุกข์ใจเท่านั้นค่ะ"
            />
          </ul>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-start">
            <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              *หมายเหตุ: ในกรณีที่มีความเสี่ยงต่อชีวิตหรืออันตรายรุนแรงต่อตนเองหรือผู้อื่น ระบบอาจจำเป็นต้องติดต่อเจ้าหน้าที่หรือบุคคลใกล้ชิดตามแผนความปลอดภัยของคุณ
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div 
                onClick={() => setAgreed(!agreed)}
                className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${agreed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 group-hover:border-indigo-300'}`}
              >
                {agreed && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <span className="text-xs font-medium text-slate-600">ฉันเข้าใจและยอมรับข้อตกลงการคุ้มครองข้อมูลส่วนบุคคล</span>
            </label>

            <button
              onClick={() => agreed && onAccept()}
              disabled={!agreed}
              className={`w-full py-4 rounded-2xl text-sm font-bold shadow-xl transition-all ${agreed ? 'bg-indigo-600 text-white shadow-indigo-200 hover:scale-[1.02] active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              ยินยอมและเริ่มใช้งาน
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PrivacyItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <li className="flex gap-4">
      <div className="p-2 bg-indigo-50 rounded-xl flex-shrink-0 h-fit">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-800 mb-0.5">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}
