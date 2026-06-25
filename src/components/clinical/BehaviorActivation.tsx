import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Calendar, 
  Smile, 
  Award, 
  Info, 
  Clock, 
  Sparkles, 
  Trash2, 
  CheckCircle, 
  Lightbulb, 
  Flame, 
  Target, 
  X,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Check
} from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface BAActivity {
  id?: string;
  userId: string;
  title: string;
  category: string;
  scheduledTime: string;
  status: 'planned' | 'completed' | 'skipped';
  pleasure: number; // 0 - 10
  mastery: number;  // 0 - 10
  notes: string;
  createdAt?: any;
}

interface BehaviorActivationProps {
  user: User;
  onBackToHome?: () => void;
}

const CATEGORIES = [
  { id: 'body', label: 'ร่างกายและกล้ามเนื้อ (Physical)', desc: 'ยืดเหยียด เดินเล่น ออกแรงเบาๆ', color: 'bg-emerald-50 text-emerald-800 border-emerald-100', icon: '🏃‍♂️' },
  { id: 'self-care', label: 'ดูแลใส่ใจตนเอง (Self-Care)', desc: 'อาบน้ำอุ่น แต่งตัว ทานอาหารดีๆ', color: 'bg-sky-50 text-sky-850 border-sky-100', icon: '🧼' },
  { id: 'social', label: 'พบปะสังเคราะห์ใจ (Social)', desc: 'โทรหาคนใกล้ชิด ทักทายเพื่อส่งยิ้ม', color: 'bg-purple-50 text-purple-800 border-purple-100', icon: '💬' },
  { id: 'hobby', label: 'ความเพลิดเพลิน (Hobbies)', desc: 'ฟังเพลง วาดภาพ อ่านหนังสือ ปลูกต้นไม้', color: 'bg-amber-50 text-amber-850 border-amber-100', icon: '🎨' },
  { id: 'duty', label: 'หน้าที่และภารกิจ (Mastery/Duty)', desc: 'จัดห้องสั้นๆ ทำความสะอาด สรุปงานง่ายๆ', color: 'bg-rose-50 text-rose-800 border-rose-100', icon: '🧹' }
];

export default function BehaviorActivation({ user, onBackToHome }: BehaviorActivationProps) {
  const [activities, setActivities] = useState<BAActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom BA Goals
  const [userGoal, setUserGoal] = useState('');
  const [isSubmitGoalLoading, setIsSubmitGoalLoading] = useState(false);

  // New Activity Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('body');
  const [scheduledTime, setScheduledTime] = useState('08:00');
  const [notes, setNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Update Evaluation States
  const [evaluatingActivityId, setEvaluatingActivityId] = useState<string | null>(null);
  const [evalPleasure, setEvalPleasure] = useState(5);
  const [evalMastery, setEvalMastery] = useState(5);
  const [evalNotes, setEvalNotes] = useState('');

  // Education state
  const [showEduDetail, setShowEduDetail] = useState(false);

  // Load goals & activities
  useEffect(() => {
    fetchBData();
  }, [user.uid]);

  const fetchBData = async () => {
    setLoading(true);
    try {
      // 1. Load User Goal
      const savedGoal = localStorage.getItem(`ba_goal_${user.uid}`) || '';
      setUserGoal(savedGoal);

      // 2. Load Activities
      if (user.uid.startsWith('local_')) {
        const localData = JSON.parse(localStorage.getItem(`ba_activities_${user.uid}`) || '[]');
        setActivities(localData);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'users', user.uid, 'behaviorActivation'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const fetched: BAActivity[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        fetched.push({
          id: docSnap.id,
          userId: data.userId,
          title: data.title,
          category: data.category,
          scheduledTime: data.scheduledTime,
          status: data.status,
          pleasure: data.pleasure,
          mastery: data.mastery,
          notes: data.notes,
          createdAt: data.createdAt?.toDate()?.toISOString() || null
        });
      });
      setActivities(fetched);
    } catch (err) {
      console.error("Error loading activation data: ", err);
      toast.error('โหลดข้อมูลผิดพลาดจำลองโหมดเครื่องถิ่นออฟไลน์');
    } finally {
      setLoading(false);
    }
  };

  const saveGoal = async (newGoal: string) => {
    setIsSubmitGoalLoading(true);
    try {
      localStorage.setItem(`ba_goal_${user.uid}`, newGoal);
      setUserGoal(newGoal);
      toast.success('บันทึกเป้าหมายฟื้นฟูพลังรอยยิ้มสำเร็จแล้วครับ! 🏆');
    } catch (err) {
      toast.error('ไม่สามารถบันทึกเป้าหมายได้');
    } finally {
      setIsSubmitGoalLoading(false);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('กรุณาระบุชื่อกิจกรรมบำบัดด้วยนะ');
      return;
    }

    const payload: Omit<BAActivity, 'id'> = {
      userId: user.uid,
      title: title.trim(),
      category,
      scheduledTime,
      status: 'planned',
      pleasure: 0,
      mastery: 0,
      notes: notes.trim()
    };

    try {
      if (user.uid.startsWith('local_')) {
        const localData = JSON.parse(localStorage.getItem(`ba_activities_${user.uid}`) || '[]');
        const newAct = { ...payload, id: `local_${Date.now()}`, createdAt: new Date().toISOString() };
        localData.unshift(newAct);
        localStorage.setItem(`ba_activities_${user.uid}`, JSON.stringify(localData));
        setActivities(localData);
        toast.success('บันทึกเพิ่มกิจกรรมในแผนศิระบำบัดแล้วครับ! 🏃‍♂️');
      } else {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'behaviorActivation'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        const newAct = { ...payload, id: docRef.id, createdAt: new Date().toISOString() };
        setActivities([newAct, ...activities]);
        toast.success('บันทึกพิทักษ์ลงระบบฐานข้อมูลสำเร็จแล้วครับ!');
      }

      // Reset
      setTitle('');
      setNotes('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Create error:', err);
      toast.error('เกิดปัญหาระหว่างบันทึกข้อมูล');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      if (user.uid.startsWith('local_')) {
        const localData = JSON.parse(localStorage.getItem(`ba_activities_${user.uid}`) || '[]');
        const filtered = localData.filter((x: any) => x.id !== id);
        localStorage.setItem(`ba_activities_${user.uid}`, JSON.stringify(filtered));
        setActivities(filtered);
      } else {
        await deleteDoc(doc(db, 'users', user.uid, 'behaviorActivation', id));
        setActivities(activities.filter(x => x.id !== id));
      }
      toast.success('ลบกิจกรรมออกจากแผนสำเร็จ');
    } catch (err) {
      toast.error('ลบไม่สำเร็จ กรุณาลองอีกครั้ง');
    }
  };

  const handleEvaluateSubmit = async () => {
    if (!evaluatingActivityId) return;

    try {
      const target = activities.find(x => x.id === evaluatingActivityId);
      if (!target) return;

      const updatedFields = {
        status: 'completed' as const,
        pleasure: evalPleasure,
        mastery: evalMastery,
        notes: evalNotes.trim()
      };

      if (user.uid.startsWith('local_')) {
        const localData = JSON.parse(localStorage.getItem(`ba_activities_${user.uid}`) || '[]');
        const updated = localData.map((x: any) => x.id === evaluatingActivityId ? { ...x, ...updatedFields } : x);
        localStorage.setItem(`ba_activities_${user.uid}`, JSON.stringify(updated));
        setActivities(updated);
      } else {
        await updateDoc(doc(db, 'users', user.uid, 'behaviorActivation', evaluatingActivityId), updatedFields);
        setActivities(activities.map(x => x.id === evaluatingActivityId ? { ...x, ...updatedFields } : x));
      }

      toast.success('สะสมพลังแห่งการลงมือทำเรียบร้อย! ขยับความสุขขึ้นอีกก้าวครับ ✨');
      setEvaluatingActivityId(null);
      setEvalNotes('');
      setEvalPleasure(5);
      setEvalMastery(5);
    } catch (err) {
      toast.error('ประเมินไม่สำเร็จ กรุณาลองอีกครั้ง');
    }
  };

  const handleSkipActivity = async (id: string) => {
    try {
      const updatedFields = {
        status: 'skipped' as const,
        pleasure: 0,
        mastery: 0
      };

      if (user.uid.startsWith('local_')) {
        const localData = JSON.parse(localStorage.getItem(`ba_activities_${user.uid}`) || '[]');
        const updated = localData.map((x: any) => x.id === id ? { ...x, ...updatedFields } : x);
        localStorage.setItem(`ba_activities_${user.uid}`, JSON.stringify(updated));
        setActivities(updated);
      } else {
        await updateDoc(doc(db, 'users', user.uid, 'behaviorActivation', id), updatedFields);
        setActivities(activities.map(x => x.id === id ? { ...x, ...updatedFields } : x));
      }

      toast.success('รับรู้และปล่อยผ่าน ไม่เป็นไรนะ วันพรุ่งนี้เอาใหม่ตามแผนเดิมครับ 🤍');
    } catch (err) {
      toast.error('แก้ไขสถานะไม่สำเร็จ');
    }
  };

  const handleResetActivity = async (id: string) => {
    try {
      const updatedFields = {
        status: 'planned' as const,
        pleasure: 0,
        mastery: 0
      };

      if (user.uid.startsWith('local_')) {
        const localData = JSON.parse(localStorage.getItem(`ba_activities_${user.uid}`) || '[]');
        const updated = localData.map((x: any) => x.id === id ? { ...x, ...updatedFields } : x);
        localStorage.setItem(`ba_activities_${user.uid}`, JSON.stringify(updated));
        setActivities(updated);
      } else {
        await updateDoc(doc(db, 'users', user.uid, 'behaviorActivation', id), updatedFields);
        setActivities(activities.map(x => x.id === id ? { ...x, ...updatedFields } : x));
      }

      toast.success('ย้ายกิจกรรมกลับไปเป็นแผนที่ตั้งใจไว้นะครับ 💡');
    } catch (err) {
      toast.error('แก้ไขสถานะไม่สำเร็จ');
    }
  };

  // Helper values
  const completedCount = activities.filter(x => x.status === 'completed').length;
  const plannedCount = activities.filter(x => x.status === 'planned').length;
  const skippedCount = activities.filter(x => x.status === 'skipped').length;
  const motivationLevel = activities.length > 0 ? Math.round((completedCount / activities.length) * 100) : 0;

  // Best outcomes
  const bestPleasure = activities.filter(x => x.status === 'completed').reduce((max, x) => x.pleasure > max ? x.pleasure : max, 0);
  const bestMastery = activities.filter(x => x.status === 'completed').reduce((max, x) => x.mastery > max ? x.mastery : max, 0);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Back Header & Title */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            ชาร์จพลังพฤติกรรม 🏃‍♂️✨
          </h2>
          <p className="text-slate-500 font-sans text-xs">
            Behavioral Activation (BA) — ใช้ภายนอกขับเคลื่อนภายใน ชนะความเศร้าด้วยการลงมือทำ
          </p>
        </div>
        {onBackToHome && (
          <button 
            type="button"
            onClick={onBackToHome}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-850 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-full cursor-pointer transition-all"
          >
            ← หน้าหลัก
          </button>
        )}
      </div>

      {/* 1. Core BA Education Box (Outside-In Rule) */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 border border-orange-200/60 rounded-[2.2rem] p-5 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200/20 rounded-full blur-xl translate-x-1/3 -translate-y-1/3" />
        
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="p-2.5 bg-amber-400 text-amber-950 font-black rounded-2xl text-lg shadow-sm">
            💡
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="font-extrabold text-sm text-slate-800">
              หลักจิตเวชบำบัด: เอาชนะ "อารมณ์ดิ่ง" ด้วย " Outside-In"
            </h4>
            <p className="text-xs text-slate-650 leading-relaxed font-sans">
              เมื่อเรารู้สึกเหงา เหี่ยวเฉา หรือทุกข์ระทม จิตใจและฮอร์โมนจะฉุดให้เราอยู่นิ่งๆ ขังตัวเอง และหลบจากเพื่อนฝูง ยิ่งทาสอารมณ์ยิ่งจมดิ่ง นั่นคือระบบ <strong>Inside-Out (ปล่อยให้อารมณ์กำหนดชีวิต)</strong>
            </p>
            
            <button
              onClick={() => setShowEduDetail(!showEduDetail)}
              className="text-[11px] font-extrabold text-orange-700 hover:text-orange-900 flex items-center gap-1 transition-colors underline cursor-pointer"
            >
              {showEduDetail ? '← ย่อข้อมูลสั้นๆ' : 'อ่านความลับทางวิทยาศาสตร์สมองเพิ่มเติม 🧠'}
            </button>
            
            <AnimatePresence>
              {showEduDetail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-2 pt-2 text-[11px] text-slate-600 font-sans leading-relaxed border-t border-orange-200/50 mt-2"
                >
                  <p>
                    <strong>กุญแจสำคัญ (The BA Magic):</strong> พฤติกรรมบำบัดพิสูจน์แล้วว่า หากใช้วิถี <strong>Outside-In (ให้ภายนอกผลักดันภายใน)</strong> คือสลัดความรู้สึกผิดหวังแล้วลงมือขับเคลื่อนร่างกายทีละนิดตาม <strong>"สลัดอารมณ์และลงมือตามแผนการ"</strong> สมองจะตอบรับและกระตุ้นสารสุขแบบป้อนกลับ ช่วยดับความทุกข์ระบมใจได้เร็วกว่าการนอนคิดเฉยๆ เสมอครับ
                  </p>
                  <p className="p-2 bg-orange-200/30 rounded-xl text-orange-950 font-bold border border-orange-200 flex items-center gap-1">
                    🎯 <span>"ลงมือทำตามเป้าและตามแผนที่ตระเตรียมไว้ อย่าปล่อยให้หัวจิตที่เหนื่อยล้ามาตั้งกฎเกณฑ์"</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 2. Target Commitment Goal Setting */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-4 text-left">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-[13px] text-slate-900 uppercase tracking-wider">
              1. สัญญากับตนเอง: เป้าหมายที่อยากก้าวพ้นความเศร้า
            </h3>
            <p className="text-[10px] text-slate-400 font-sans">เป้าหมายพฤติกรรมสลัดความเนือยที่คุณตั้งใจลุกขึ้นมาเปลี่ยนเพื่อจิตใจของตนเอง</p>
          </div>
        </div>

        {userGoal ? (
          <div className="p-4 bg-indigo-50/40 border border-indigo-100/60 rounded-2xl flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest text-[10px]">เป้าหมายของคุณ 🤍</p>
              <p className="text-sm font-black text-slate-800 leading-normal">
                "{userGoal}"
              </p>
            </div>
            <button
              onClick={() => {
                setUserGoal('');
                localStorage.removeItem(`ba_goal_${user.uid}`);
              }}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg cursor-pointer transition-colors"
              title="แก้ไขเป้าหมาย"
            >
              แก้ไข
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 leading-normal">
              ลองพิมพ์คำสัญญาเล็กๆ กับตัวเองดูนะ เช่น "ฉันจะก้าวขาออกมาเดินเล่นที่สวนสาธารณะ", "ฉันจะอาบน้ำอุ่นรอบเย็นตรงตามตาราง", "ฉันจะโทรทักทายคุณแม่เพื่อคลายเหงา"
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={120}
                placeholder="สัญญากล้าหาญของฉัน เช่น ฉันจะตื่นมาจัดเตียงและมองท้องฟ้าทุกเช้า..."
                className="flex-1 p-3.5 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 font-semibold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveGoal((e.target as HTMLInputElement).value);
                  }
                }}
                id="ba-goal-input"
              />
              <button
                onClick={() => {
                  const val = (document.getElementById('ba-goal-input') as HTMLInputElement)?.value;
                  if (val?.trim()) saveGoal(val.trim());
                  else toast.error('เขียนเป้าหมายบำบัดสั้นๆ ก่อนส่งนะครับ');
                }}
                disabled={isSubmitGoalLoading}
                className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              >
                บันทึกเป้า
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Motivation Energy Charge and Insights */}
      {activities.length > 0 && (
        <div className="grid grid-cols-2 gap-3.5 text-left">
          
          {/* Motivation Recharge Box */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-[2.2rem] p-4 text-white flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="space-y-1 z-10">
              <span className="text-[9px] uppercase font-black text-indigo-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-300 animate-pulse" /> ระเบิดแรงกระตุ้น
              </span>
              <p className="text-2xl font-black text-amber-300 font-mono tracking-tight">{motivationLevel}%</p>
              <p className="text-[10px] text-white/70 font-sans tracking-wide">พลังลงมือทำกระตุ้นจิตใจ</p>
            </div>
            
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700" 
                style={{ width: `${motivationLevel}%` }}
              />
            </div>
          </div>

          {/* Clinical Insights */}
          <div className="bg-white border border-slate-100 rounded-[2.2rem] p-4 flex flex-col justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-400 flex items-center gap-1 tracking-wider">
                🔬 ผลลัพธ์ป้อนกลับสมาธิ
              </span>
              <div className="space-y-1 pt-1">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500 flex items-center gap-0.5"><Smile className="w-3 h-3 text-emerald-500" /> สนุกปิติสูงสุด:</span>
                  <span className="font-extrabold text-emerald-600 font-mono bg-emerald-50 px-1.5 py-0.5 rounded">{bestPleasure}/10</span>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-slate-500 flex items-center gap-0.5"><Award className="w-3 h-3 text-indigo-500" /> ภูมิใจ/สำเร็จสูงสุด:</span>
                  <span className="font-extrabold text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">{bestMastery}/10</span>
                </div>
              </div>
            </div>
            <p className="text-[8.5px] text-slate-400 font-sans leading-relaxed pt-1 border-t border-slate-50">
              *กิจกรรมไหนได้คะแนนสูง ให้รีบทำซ้ำเพื่อขัดขวางอาการซึมเศร้านะครับ
            </p>
          </div>

        </div>
      )}

      {/* 4. Scheduling Scheduler Section */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-4 text-left">
        
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[13px] text-slate-900 uppercase tracking-wider">
                2. ตารางกิจกรรมลุยต้านเศร้า (Behavior Scheduling)
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">ลงกำหนดการไว้ แล้วรีบลุยทำโดยไม่ต้องคิดฟุ้งซ่าน!</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-xl cursor-pointer transition-colors shadow-md shadow-orange-100 flex items-center gap-1"
          >
            {showAddForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            <span>{showAddForm ? 'ปิดแบบฟอร์ม' : 'เพิ่มกิจกรรม'}</span>
          </button>
        </div>

        {/* Form Overlay */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateActivity}
              className="bg-slate-50/70 p-4 border border-slate-105 rounded-3xl space-y-3.5 text-left overflow-hidden. duration-300"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">ชื่อกิจกรรมบำบัด (สั้นๆ ได้ใจความ):</label>
                <input
                  type="text"
                  maxLength={100}
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ล้างจาน, ยืดเหยียดขา 10 นาที, โทรหาเพื่อนนิดนึง..."
                  className="w-full p-2.5 bg-white border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-orange-500 font-semibold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-705 block">หมวดหมู่เสริมเป้าหมาย:</label>
                <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded-xl text-left text-[11px] font-bold border transition-all flex items-center justify-between cursor-pointer ${
                        category === cat.id 
                          ? 'border-orange-500 bg-orange-50/40 text-orange-950 font-black' 
                          : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-150'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <div>
                          <p className="font-extrabold">{cat.label}</p>
                          <p className="text-[9.5px] text-slate-400 font-normal">{cat.desc}</p>
                        </div>
                      </div>
                      {category === cat.id && <span className="text-[10px] bg-orange-600 text-white px-1.5 py-0.5 rounded-full font-sans uppercase">เลือก</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">เวลาเป้าหมายลงมือ:</label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-orange-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">จดบันทึกตัวช่วย (ระบายสั้นๆ):</label>
                  <input
                    type="text"
                    maxLength={150}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="เช่น เพื่อนนัด 10 โมง, เตรียมจานรอ"
                    className="w-full p-2.5 bg-white border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-orange-500 text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-black transition-all active:scale-97 cursor-pointer shadow-md shadow-orange-100"
              >
                บรรจุลงในตารางและสัญญาลุยเลย! 🚀
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* 5. Evaluation Slate: If evaluation modal/form is active */}
        <AnimatePresence>
          {evaluatingActivityId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-5 border-2 border-emerald-500/20 bg-emerald-50/60 rounded-[2rem] space-y-4 text-left shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3">
                <button 
                  type="button"
                  onClick={() => setEvaluatingActivityId(null)} 
                  className="rounded-full bg-slate-200/50 p-1 text-slate-600 hover:text-slate-905 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-emerald-600 text-white rounded-2xl">
                  <Smile className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                    ประเมินหลังทำสำเร็จแล้ว 🎉
                  </h4>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-semibold">
                    กิจกรรม: "{activities.find(x => x.id === evaluatingActivityId)?.title}"
                  </p>
                </div>
              </div>

              {/* Slider Pleasure */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>😊 1. คะแนนความสุข (Pleasure Score):</span>
                  <span className="font-mono text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-100 font-black">{evalPleasure}/10</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={evalPleasure}
                  onChange={(e) => setEvalPleasure(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-white h-2 rounded-lg appearance-none cursor-pointer border border-slate-100"
                />
                <p className="text-[10px] text-slate-400 font-sans italic">หลังจากเริ่มทำกิจกรรมนี้ คุณมีความเพลิดเพลิน สบายใจ หรือสุขสมาคมขึ้นไหมครับ?</p>
              </div>

              {/* Slider Mastery */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>🏆 2. คะแนนความสำเร็จ (Mastery Score):</span>
                  <span className="font-mono text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100 font-black">{evalMastery}/10</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={evalMastery}
                  onChange={(e) => setEvalMastery(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 bg-white h-2 rounded-lg appearance-none cursor-pointer border border-slate-100"
                />
                <p className="text-[10px] text-slate-400 font-sans italic">คุณรู้สึกภูมิใจ ภูมิธรรม หรือรู้สึกได้ก้าวข้ามความเนือยจนเอาชนะแรงเฉื่อยเสร็จสิ้นได้ไหมครับ?</p>
              </div>

              {/* Eval Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-800 block">ความในใจเพิ่มเติมสั้นๆ:</label>
                <input
                  type="text"
                  maxLength={150}
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  placeholder="เช่น ทำได้ดีกว่าที่คิดมาก, สดชื่นขึ้นนิดหน่อย"
                  className="w-full p-2 bg-white border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-emerald-500 text-slate-800"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setEvaluatingActivityId(null)}
                  className="flex-1 py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={handleEvaluateSubmit}
                  className="flex-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all"
                >
                  ส่งการประเมินเพื่อชาร์จใจ ⚡
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List of Scheduled Items */}
        {loading ? (
          <div className="flex items-center justify-center py-10 font-sans text-xs text-slate-400 animate-pulse">
            กำลังประมวลสายพฤติกรรมบำบัด... 🏃‍♂️
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-200 rounded-[2rem] text-center space-y-3 bg-slate-50/50">
            <span className="text-3xl block">⏳</span>
            <div className="space-y-1">
              <h4 className="font-extrabold text-xs text-slate-850">ยังไม่มีกิจกรรมฟื้นจิตในแผนชาร์จพฤติกรรม</h4>
              <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed max-w-xs mx-auto">
                อย่าเกรงกลัวที่จะก้าวขาออกมากระตุ้นใจนะครับ คลิกปุ่ม <strong>"เพิ่มกิจกรรม"</strong> มุมขวาบน เพื่อเริ่มหยั่งรากสร้างสิริความสุขกันเถอะครับ
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold px-1 border-b border-slate-50 pb-2">
              <span>แผนทั้งหมด: {activities.length} รายการ</span>
              <span>สำเร็จ: {completedCount} / วิน: {skippedCount}</span>
            </div>

            <div className="space-y-2.5">
              {activities.map((act) => {
                const catInfo = CATEGORIES.find(x => x.id === act.category) || CATEGORIES[0];
                return (
                  <div 
                    key={act.id}
                    className={`p-4 border rounded-[2rem] transition-all bg-white relative ${
                      act.status === 'completed' 
                        ? 'border-emerald-100 hover:border-emerald-200' 
                        : act.status === 'skipped'
                          ? 'border-slate-100/70 bg-slate-50/30'
                          : 'border-slate-150 hover:border-slate-250'
                    }`}
                  >
                    
                    {/* Activity Row Info */}
                    <div className="flex items-start justify-between gap-3 text-left">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="text-sm font-bold text-slate-500">{catInfo.icon}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-sans">
                            {catInfo.label.split(' ')[0]}
                          </span>
                          <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {act.scheduledTime}
                          </span>
                        </div>
                        
                        <h4 className={`text-sm tracking-tight font-black leading-snug ${
                          act.status === 'completed' 
                            ? 'text-slate-400 line-through decoration-emerald-200' 
                            : act.status === 'skipped'
                              ? 'text-slate-400 line-through decoration-slate-300'
                              : 'text-slate-850'
                        }`}>
                          {act.title}
                        </h4>

                        {act.notes && (
                          <p className="text-[10px] text-slate-500 font-sans leading-normal whitespace-pre-wrap bg-slate-50 rounded-lg p-1.5 px-2 mt-1">
                            {act.notes}
                          </p>
                        )}
                      </div>

                      {/* Small delete icon */}
                      <button 
                        type="button"
                        onClick={() => handleDeleteActivity(act.id!)}
                        className="text-slate-300 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                        title="ลบกิจกรรม"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Ratings Outcomes displayed ONLY if COMPLETED */}
                    {act.status === 'completed' && (
                      <div className="mt-3.5 p-2 bg-emerald-50/20 border border-emerald-50 rounded-2xl flex items-center gap-4 text-left">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[11px] text-slate-500">😊 ความสุข:</span>
                          <span className="font-extrabold text-emerald-600 font-mono bg-emerald-50/85 text-[10.5px] px-1.5 py-0.5 rounded-lg">{act.pleasure}/10</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[11px] text-slate-500">🏆 ภูมิใจ:</span>
                          <span className="font-extrabold text-indigo-650 font-mono bg-indigo-50/80 text-[10.5px] px-1.5 py-0.5 rounded-lg">{act.mastery}/10</span>
                        </div>
                      </div>
                    )}

                    {/* Actions and Status Change controllers */}
                    <div className="mt-3.5 pt-3.5 border-t border-slate-50 flex flex-wrap gap-2 justify-end">
                      {act.status === 'planned' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEvaluatingActivityId(act.id!);
                              setEvalPleasure(5);
                              setEvalMastery(5);
                              setEvalNotes(act.notes || '');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10.5px] py-1.5 px-3 rounded-xl shadow-md shadow-emerald-100 flex items-center gap-1 cursor-pointer transition-all active:scale-[0.97]"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>ฉันทำสำเร็จแล้ว! 🎉</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleSkipActivity(act.id!)}
                            className="bg-slate-100 hover:bg-slate-200/80 text-slate-500 font-bold text-[10.5px] py-1.5 px-2.5 rounded-xl cursor-pointer transition-colors"
                          >
                            ข้ามไปก่อน
                          </button>
                        </>
                      )}

                      {(act.status === 'completed' || act.status === 'skipped') && (
                        <button
                          type="button"
                          onClick={() => handleResetActivity(act.id!)}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold text-[10px] py-1 px-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>รีเซ็ตกลับไปฝากแผนใหม่</span>
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* 5. Pure Clinical Advice Bottom Banner */}
      <div className="p-5 bg-indigo-50/40 border border-indigo-100/40 rounded-3xl text-left space-y-2 relative overflow-hidden group">
        <h4 className="font-extrabold text-xs text-indigo-900 flex items-center gap-1.5">
          🛡️ สาส์นคำรบจากแพทย์ผู้ดูแลจิตใจ
        </h4>
        <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans">
          สหายครับ... อาการตื้อซึมมันคือฝนตกชั่วคราว ไม่จำเป็นต้องรอให้อารมณ์ดีแล้วค่อยเดิน แต่ให้ขยับขาเพื่อปูทางให้แดดส่องลงมาแทน (Outside-In) เริ่มต้นตั้งค่ากิจกรรมเล็กมากที่สุดที่คุณแน่ใจว่าทำเสร็จแน่นอน 5 นาทีก็มีความหมายมหาศาลครับ 🤍
        </p>
      </div>

    </div>
  );
}
