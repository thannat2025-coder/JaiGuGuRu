import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Star, 
  Smile, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  BarChart, 
  Users, 
  Award, 
  ShieldAlert,
  Frown,
  TrendingUp,
  BrainCircuit,
  Settings,
  Flame,
  Info
} from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AppEvaluationProps {
  user: User;
}

interface EvaluationResult {
  easeOfUse: number;
  cbtDojo: number;
  mentalFirstAid: number;
  privacyFeeling: number;
  comment: string;
  email: string;
  userName: string;
  createdAt?: any;
}

export default function AppEvaluation({ user }: AppEvaluationProps) {
  const [activeTab, setActiveTab] = useState<'evaluate' | 'creator-dashboard'>('evaluate');
  
  // Form States
  const [easeOfUse, setEaseOfUse] = useState<number>(0);
  const [cbtDojo, setCbtDojo] = useState<number>(0);
  const [mentalFirstAid, setMentalFirstAid] = useState<number>(0);
  const [privacyFeeling, setPrivacyFeeling] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Creator Dashboard States
  const [feedbacks, setFeedbacks] = useState<EvaluationResult[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  const isCreator = user.email === 'thannat2025@gmail.com';

  useEffect(() => {
    if (isCreator) {
      setActiveTab('creator-dashboard');
    }
  }, [isCreator]);

  const loadAllFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const q = query(collection(db, 'appFeedback'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetched: EvaluationResult[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          easeOfUse: data.easeOfUse || 0,
          cbtDojo: data.cbtDojo || 0,
          mentalFirstAid: data.mentalFirstAid || 0,
          privacyFeeling: data.privacyFeeling || 0,
          comment: data.comment || '',
          email: data.email || 'แฝงตัวตน',
          userName: data.userName || 'ผู้ประเมินแฝงตัว',
          createdAt: data.createdAt
        });
      });
      setFeedbacks(fetched);
    } catch (e) {
      console.error("Error loading feedbacks:", e);
      toast.error("ไม่สามารถดึงผลประเมินสรุปได้");
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'creator-dashboard') {
      loadAllFeedbacks();
    }
  }, [activeTab]);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (easeOfUse === 0 || cbtDojo === 0 || mentalFirstAid === 0 || privacyFeeling === 0) {
      toast.error('กรุณาประเมินความพึงพอใจให้ครบทุกด้าน 🤍');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'appFeedback'), {
        uid: user.uid,
        userName: user.displayName || 'ผู้บำบัดใจนิรนาม',
        email: user.email || 'guest@jaiguguru.org',
        easeOfUse,
        cbtDojo,
        mentalFirstAid,
        privacyFeeling,
        comment,
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
      toast.success('ขอบพระคุณสำหรับความคิดเห็นค่ะ ระบบส่งต่อข้อมูลไปยัง นพ.ธันวรุจน์ เรียบร้อยแล้วค่ะ 🤍');
    } catch (err) {
      console.error("Firebase submit error:", err);
      toast.error('ระบบอินเทอร์เน็ตขัดข้อง กรุณาลองใหม่อีกครั้งนะ');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations for Admin Dashboard
  const getAverage = (key: keyof EvaluationResult) => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + (f[key] as number), 0);
    return parseFloat((sum / feedbacks.length).toFixed(2));
  };

  const avgEase = getAverage('easeOfUse');
  const avgCbt = getAverage('cbtDojo');
  const avgAid = getAverage('mentalFirstAid');
  const avgPrivacy = getAverage('privacyFeeling');
  const overallAvg = parseFloat(((avgEase + avgCbt + avgAid + avgPrivacy) / 4).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Header and Brand */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2.5 bg-rose-50 rounded-xl text-rose-600 block">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">วัดผลประเมินความพึงพอใจต่อแอปฯ</h3>
              <p className="text-slate-400 text-xs font-sans">
                เพื่อส่งเสริมประวัติศาสตร์ สรุปสถิติความพร้อมใช้งาน และวัดผลร่วมกันเพื่อประโยชน์ต่อผู้ทุกข์ใจ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Only Switcher Tool tab */}
      {isCreator && (
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/50">
          <button
            onClick={() => setActiveTab('creator-dashboard')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'creator-dashboard' ? 'bg-white text-rose-700 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <BarChart className="w-4 h-4" />
            📊 แดชบอร์ดสรุปผลผู้สร้างสรรค์ (Creator Statistics)
          </button>
          <button
            onClick={() => setActiveTab('evaluate')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'evaluate' ? 'bg-white text-slate-800 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Smile className="w-4 h-4" />
            📝 แบบฟอร์มจำลองประเมิน (Rating Form)
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'evaluate' ? (
          <motion.div
            key="evaluation-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-6"
          >
            {!submitted ? (
              <form onSubmit={handleRatingSubmit} className="space-y-6">
                <div className="space-y-1 text-center max-w-sm mx-auto">
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">ร่วมส่งความคิดเห็นของคุณ 🤍</h4>
                  <p className="text-slate-500 text-xs font-sans leading-relaxed">
                    เสียงสะท้อนของคุณมีคุณค่าสูงสุดในการพัฒนาระบบบำบัดจิตแพทย์ร่วมกันเพื่อเพื่อนมนุษย์ผู้มีทุกข์
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Aspect 1 */}
                  <RatingAspect 
                    title="1. ความสะดวกและหน้าตาสถาปัตยกรรม (UI/UX & Design)"
                    desc="ความประณีตของคู่สี การจัดวางNegative space ความเร็ว และใช้งานง่ายสะดวกล่องไหล"
                    value={easeOfUse}
                    onChange={setEaseOfUse}
                  />

                  {/* Aspect 2 */}
                  <RatingAspect 
                    title="2. ประโยชน์จากนวตกรรมห้องเรียนบำบัดความคิด (CBT Dojo)"
                    desc="การวิเคราะห์อคติในสมอง ความนุ่มนวลอบอุ่นของข้อความตอบกลับเพื่อสยบความกังวล"
                    value={cbtDojo}
                    onChange={setCbtDojo}
                  />

                  {/* Aspect 3 */}
                  <RatingAspect 
                    title="3. ประโยชน์จากกล่องฉุกเฉินสากล (Mental First Aid & 3ป.)"
                    desc="ความรู้ Look, Listen, Link และเครื่องมือฝึกคุมลมหายใจลดแผลตกใจ / แพนิก"
                    value={mentalFirstAid}
                    onChange={setMentalFirstAid}
                  />

                  {/* Aspect 4 */}
                  <RatingAspect 
                    title="4. ความรู้สึกในด้านความเป็นส่วนตัวและคุ้มครองลับ (Privacy)"
                    desc="ความเชื่อมั่น ปลอดภัย สิทธิการคุ้มครองตามกรอบคำกล่าวยอบรับและจริยธรรมแพทย์"
                    value={privacyFeeling}
                    onChange={setPrivacyFeeling}
                  />
                </div>

                {/* Open-Ended Feedback Comment */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 tracking-wide gap-1.5 flex items-center">
                    <MessageSquare className="w-4 h-4 text-rose-500" />
                    เขียนความคิดเห็นเสนอแนะเพิ่มเติม (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="เล่าความรู้สึก ประสบการณ์ หรือเรื่องราวน่าประทับใจที่อยากช่วยย้อนสะท้อนกลับไปแด่วงการผู้สร้างแอปค่ะ..."
                    className="w-full p-4 bg-slate-50 text-slate-800 border border-slate-200/80 rounded-2xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-rose-50 focus:border-rose-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Submitter */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-rose-100 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'กำลังส่งผลการประเมิน...' : 'ส่งผลประเมินเชื่อมต่อสู่ นพ.ธันวรุจน์ (Submit Evaluation)'}
                </button>
              </form>
            ) : (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-10 space-y-6 max-w-md mx-auto"
              >
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto border-2 border-rose-100 animate-pulse">
                    <Heart className="w-12 h-12 text-rose-500 fill-rose-100" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-2 rounded-full border-4 border-white text-white">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">ขอบคุณสำหรับความรักและฟีดแบค!</h4>
                  <p className="text-slate-500 text-xs font-sans leading-relaxed">
                    ผลลัพธ์การวัดระดับความพึงพอใจของคุณได้รับการเข้ารหัสความปลอดภัย และเชื่อมต่อกลับไปจัดสถิติยังแดชบอร์ดสรุปผลของ <strong>นพ.ธันวรุจน์ บูรณสุขสกุล (ผู้สร้างสรรค์หลัก)</strong> บนฐานข้อมูล Firestore เรียบร้อยแล้วค่ะ เพื่อความงอกงามและการช่วยเหลือผู้รับอิทธิพลแห่งทุกข์ใจที่ดีถัดไป 🤍
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setComment(''); setEaseOfUse(0); setCbtDojo(0); setMentalFirstAid(0); setPrivacyFeeling(0); }}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition-all active:scale-95 cursor-pointer"
                >
                  📥 ส่งแบบประเมินฉบับใหม่อีกครั้ง
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="creator-dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Dr. Thanwaruj welcome header */}
            <div className="p-6 bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 text-white rounded-[2.5rem] shadow-md border border-rose-900/30 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 bg-rose-500/20 w-fit px-3 py-1 rounded-full text-[10px]/none font-black tracking-widest uppercase text-rose-300">
                <Flame className="w-3.5 h-3.5" /> creator administration room
              </div>
              <h3 className="text-lg font-extrabold tracking-tight">ยินดีต้อนรับกลับค่ะ นพ.ธันวรุจน์ บูรณสุขสกุล</h3>
              <p className="text-white/85 text-xs font-sans leading-relaxed">
                ห้องส่วนตัวบริหารประสิทธิภาพของสถิติใจผู้ใช้ทั้งหมด ระบบรวบรวมฟีดแบคและความพึงพอใจการตอบสนองของวัยรุ่นและผู้เผชิญภัยทั้งหมดที่ใช้แอปฯ จากการดึงคีย์และสถิติ GitHub กลับมาสรุปแบบเรียลไทม์ไว้ในฐานข้อมูล ณ ที่นี้ค่ะ
              </p>
            </div>

            {/* Statistics Widgets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard 
                icon={<Users className="w-5 h-5 text-indigo-500" />} 
                title="จำนวนผู้ประเมิน" 
                value={`${feedbacks.length} คน`} 
                color="bg-indigo-50/50 text-indigo-900"
              />
              <StatCard 
                icon={<Star className="w-5 h-5 text-amber-500 fill-amber-400" />} 
                title="ความพึงพอใจรวม" 
                value={`${overallAvg || '0'} / 5`} 
                color="bg-amber-50/60 text-amber-950" 
              />
              <StatCard 
                icon={<BrainCircuit className="w-5 h-5 text-emerald-500" />} 
                title="ระดับ Dojo" 
                value={`${avgCbt || '0'} ⭐`} 
                color="bg-emerald-50/50 text-emerald-950" 
              />
              <StatCard 
                icon={<Heart className="w-5 h-5 text-rose-500 fill-rose-100" />} 
                title="เยียวยาวิกฤต" 
                value={`${avgAid || '0'} ⭐`} 
                color="bg-rose-50/50 text-rose-950" 
              />
            </div>

            {/* Detailed Average Meters */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-4">
              <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                รายละเอียดผลการวิเคราะห์ระดับความพึงพอใจของประชากร
              </h4>

              <div className="space-y-3.5">
                <ProgressMeter label="ความรู้สึกสะดวกในการดีไซน์ (UI/UX)" score={avgEase} scoreMax={5} />
                <ProgressMeter label="อรรถประโยชน์ห้องคิดใจ CBT" score={avgCbt} scoreMax={5} />
                <ProgressMeter label="ทักษะสากลช่วยเหลือฉุกเฉิน (First Aid)" score={avgAid} scoreMax={5} />
                <ProgressMeter label="ความเชื่อถือและความเป็นส่วนตัว (Privacy)" score={avgPrivacy} scoreMax={5} />
              </div>
            </div>

            {/* List of user comments \& suggestions */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  เสียงจากใจและความรู้สึกต่อแอปฯ ({feedbacks.filter(f => f.comment.trim() !== '').length} ข้อความ)
                </h4>
                <button 
                  onClick={loadAllFeedbacks}
                  className="text-[10px] text-indigo-650 font-black hover:underline cursor-pointer"
                >
                  🔄 โหลดข้อมูลใหม่ (Refresh)
                </button>
              </div>

              {loadingFeedbacks ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-sans italic p-4 border border-dashed border-slate-100 rounded-3xl">
                  ยังฟื้นฟูไม่พบข้อมูลการประเมินแบบสอบถามบนคลีนิกระบบนี้
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {feedbacks.map((f, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-sans space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-800">{f.userName} <span className="text-slate-400 font-medium font-sans">({f.email})</span></span>
                        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-slate-100 text-[9px]/tight font-bold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          {((f.easeOfUse + f.cbtDojo + f.mentalFirstAid + f.privacyFeeling) / 4).toFixed(1)}
                        </div>
                      </div>
                      <p className="text-slate-655 text-xs leading-relaxed italic">
                        "{f.comment || 'ไม่มีความเห็นเพิ่มเติม'}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================
   Helper Sub-components for Evaluation
   ========================================================== */

interface RatingAspectProps {
  title: string;
  desc: string;
  value: number;
  onChange: (val: number) => void;
}

function RatingAspect({ title, desc, value, onChange }: RatingAspectProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const getEmojiTh = (val: number) => {
    if (val === 5) return 'ประทับใจที่สุด ยอดเยี่ยมมาก! 😍';
    if (val === 4) return 'ดีมาก รู้สึกอบอุ่นใช้งานดี 😊';
    if (val === 3) return 'ปานกลาง มีประโยชน์พอดี 😐';
    if (val === 2) return 'ค่อนข้างน้อย ควรปรับปรุงเพิ่ม 🙁';
    if (val === 1) return 'ไม่น่าพึงพอใจเลยดิ่งมาก 😞';
    return 'กรุณาแตะระดับดวงดาว';
  };

  return (
    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-3xl space-y-2 text-left font-sans transition-all">
      <div className="space-y-0.5">
        <h5 className="font-extrabold text-slate-900 text-xs tracking-tight">{title}</h5>
        <p className="text-slate-400 text-[10px] leading-relaxed">{desc}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(null)}
              onClick={() => onChange(star)}
              className="p-1 transition-transform active:scale-90 hover:scale-110 cursor-pointer"
            >
              <Star 
                className={`w-6 h-6 transition-all ${
                  star <= (hoverValue ?? value) 
                    ? 'text-amber-500 fill-amber-400 filter drop-shadow-sm' 
                    : 'text-slate-250 hover:text-slate-400'
                }`} 
              />
            </button>
          ))}
        </div>
        <span className="text-[10px] font-black text-rose-700 bg-white/80 px-2.5 py-1 rounded-full border border-slate-100">
          {getEmojiTh(hoverValue ?? value)}
        </span>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}

function StatCard({ icon, title, value, color }: StatCardProps) {
  return (
    <div className={`p-4 rounded-[2.2rem] border border-slate-100/50 flex flex-col justify-between space-y-3 font-sans ${color}`}>
      <div className="bg-white/80 p-2.5 rounded-2xl w-fit shrink-0 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px]/none font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-lg font-black text-slate-900 mt-1 tracking-tight leading-none">{value}</p>
      </div>
    </div>
  );
}

interface ProgressMeterProps {
  label: string;
  score: number;
  scoreMax: number;
}

function ProgressMeter({ label, score, scoreMax }: ProgressMeterProps) {
  const pct = Math.min((score / scoreMax) * 100, 100);

  return (
    <div className="space-y-1 text-slate-800 font-sans text-xs font-semibold">
      <div className="flex justify-between items-center text-[11px]">
        <span>{label}</span>
        <span className="font-mono font-black text-rose-700 bg-rose-50 px-2  py-0.5 rounded-full">{score || 0} / {scoreMax} คะแนน</span>
      </div>
      <div className="h-2 bg-slate-100/80 rounded-full overflow-hidden w-full border border-slate-200/20">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full transition-all duration-500" 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  );
}
