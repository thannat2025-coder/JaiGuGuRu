import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Brain, 
  HeartPulse, 
  Heart,
  Wind,
  CheckCircle2,
  TrendingUp,
  MessageCircle,
  Bell,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { format, isSameDay } from 'date-fns';
import { th } from 'date-fns/locale';
import CrayonDrawing from '@/src/components/CrayonDrawing';

// Emotion quadrants with purely Thai labels as requested
interface ThaiEmotion {
  english: string;
  thai: string;
}

interface QuadrantInfo {
  name: string;
  color: string;
  headerColor: string;
  crayonColor: string;
  emotions: ThaiEmotion[];
}

const QUADRANTS: Record<string, QuadrantInfo> = {
  'high-positive': {
    name: 'พลังงานสูง + เชิงบวก (สีเหลือง)',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    headerColor: 'from-amber-400 to-yellow-500',
    crayonColor: '#f59e0b',
    emotions: [
      { english: 'Surprised', thai: 'แปลกใจ' },
      { english: 'Upbeat', thai: 'คึกคักสดใส' },
      { english: 'Motivated', thai: 'มีแรงบันดาลใจ' },
      { english: 'Ecstatic', thai: 'อิ่มอกอิ่มใจล้นพ้น' },
      { english: 'Hyper', thai: 'กระตือรือร้นสุดขีด' },
      { english: 'Cheerful', thai: 'ร่าเริงเบิกบาน' },
      { english: 'Inspired', thai: 'เกิดแรงบันดาลใจ' },
      { english: 'Elated', thai: 'ปลื้มปิติตัวลอย' },
      { english: 'Energized', thai: 'กระปรี้กระเปร่าเต็มที่' },
      { english: 'Lively', thai: 'มีชีวิตชีวา' },
      { english: 'Optimistic', thai: 'มองโลกในแง่ดี' },
      { english: 'Thrilled', thai: 'ตื่นเต้นเร้าใจ' },
      { english: 'Excited', thai: 'ตื่นเต้นท้าทาย' },
      { english: 'Joyful', thai: 'มีความสุขสนุกสนาน' },
      { english: 'Proud', thai: 'ภาคภูมิใจใจฟู' },
      { english: 'Blissful', thai: 'เป็นสุขสงบสบายดี' }
    ]
  },
  'high-negative': {
    name: 'พลังงานสูง + เชิงลบ (สีแดง)',
    color: 'bg-rose-100 text-rose-900 border-rose-200',
    headerColor: 'from-rose-500 to-red-600',
    crayonColor: '#ef4444',
    emotions: [
      { english: 'Enraged', thai: 'โกรธจัดเดือดดาล' },
      { english: 'Furious', thai: 'โมโหร้อนพลุ่งพล่าน' },
      { english: 'Frustrated', thai: 'หงุดหงิดใจขัดข้องอึดอัด' },
      { english: 'Shocked', thai: 'ช็อกตกใจสุดขีด' },
      { english: 'Livid', thai: 'โกรธจนตัวสั่น' },
      { english: 'Frightened', thai: 'หวาดกลัวขวัญผวา' },
      { english: 'Nervous', thai: 'ประหม่ากระวนกระวาย' },
      { english: 'Restless', thai: 'กระสับกระส่ายลนลาน' },
      { english: 'Fuming', thai: 'เดือดปุดๆ โกรธแค้น' },
      { english: 'Apprehensive', thai: 'หวั่นเกรงหวาดใจ' },
      { english: 'Worried', thai: 'กังวลคิดไม่ตก' },
      { english: 'Annoyed', thai: 'รำคาญใจกวนอารมณ์' },
      { english: 'Repulsed', thai: 'รังเกียจขยะแขยง' },
      { english: 'Troubled', thai: 'กลุ้มใจอารมณ์ขุ่นมัว' },
      { english: 'Uneasy', thai: 'อึดอัดใจสับสน' },
      { english: 'Peeved', thai: 'เคืองใจฉุนแง่งอน' }
    ]
  },
  'low-negative': {
    name: 'พลังงานต่ำ + เชิงลบ (สีน้ำเงิน)',
    color: 'bg-sky-100 text-sky-900 border-sky-200',
    headerColor: 'from-sky-500 via-blue-500 to-indigo-600',
    crayonColor: '#3b82f6',
    emotions: [
      { english: 'Disgusted', thai: 'รังเกียจชิงชัง' },
      { english: 'Disappointed', thai: 'ผิดหวังท้อใจ' },
      { english: 'Glum', thai: 'หมองหม่นเศร้าซึม' },
      { english: 'Ashamed', thai: 'ละอายแก่ใจรู้สึกแย่' },
      { english: 'Mortified', thai: 'อับอายขายหน้าท้อแท้' },
      { english: 'Alienated', thai: 'โดดเดี่ยวอ้างว้างแปลกแยก' },
      { english: 'Mopey', thai: 'ห่อเหี่ยวเหงาหงอย' },
      { english: 'Apathetic', thai: 'เฉยชาเหนื่อยหน่ายปลดปลง' },
      { english: 'Embarrassed', thai: 'เขินอายประหม่าขัดเขิน' },
      { english: 'Excluded', thai: 'ถูกหมางเมินไร้ตัวตน' },
      { english: 'Timid', thai: 'หวาดหวั่นกลัวเกรงขี้อาย' },
      { english: 'Drained', thai: 'หมดแรงสมองตื้อล้าสนิท' },
      { english: 'Alone', thai: 'โดดเดี่ยวตัวคนเดียว' },
      { english: 'Down', thai: 'หดหู่ใจดำดิ่งซึมเศร้า' },
      { english: 'Bored', thai: 'เบื่อหน่ายเหนื่อยหน่าย' },
      { english: 'Tired', thai: 'เพลียและเหนื่อยล้าดิ่งลง' }
    ]
  },
  'low-positive': {
    name: 'พลังงานต่ำ + เชิงบวก (สีเขียว)',
    color: 'bg-emerald-100 text-emerald-950 border-emerald-200',
    headerColor: 'from-emerald-500 to-teal-600',
    crayonColor: '#10b981',
    emotions: [
      { english: 'Blessed', thai: 'เป็นสุขประเสริฐซาบซึ้งใจ' },
      { english: 'At Ease', thai: 'สบายใจโล่งใจหายห่วง' },
      { english: 'Content', thai: 'พึงพอใจพอดีรู้สึกสงบ' },
      { english: 'Fulfilled', thai: 'เติมเต็มอบอุ่นเอิบอิ่มวิญญาณ' },
      { english: 'Humble', thai: 'ถ่อมตนสงบใจละมุนละไม' },
      { english: 'Secure', thai: 'มั่นใจวางใจปลอดภัย' },
      { english: 'Chill', thai: 'ชิวๆ สบายๆ ไร้ความกดดัน' },
      { english: 'Grateful', thai: 'รู้สึกขอบคุณและเห็นคุณค่า' },
      { english: 'Calm', thai: 'สงบนิ่งมีสติใจเย็น' },
      { english: 'Satisfied', thai: 'พึงพอใจสุขสงบลืมทุกข์' },
      { english: 'Relaxed', thai: 'ผ่อนคลายกล้ามเนื้อคลายเครียด' },
      { english: 'Carefree', thai: 'ปลอดโปร่งไร้กังวลเกาะติดจิต' },
      { english: 'Relieved', thai: 'โล่งใจปลดภูเขาออกจากอก' },
      { english: 'Restful', thai: 'รู้สึกได้พักผ่อนเต็มที่สะสมพลัง' },
      { english: 'Tranquil', thai: 'สงบร่มรื่นรักษาสมดุลใจ' },
      { english: 'Serene', thai: 'ราบรื่นแสนสงบเงียบนอบน้อม' }
    ]
  }
};

interface HomeProps {
  user: User;
  setActiveTab: (tab: any) => void;
  initialShowMoodOnly?: boolean;
}

export default function Home({ user, setActiveTab, initialShowMoodOnly = false }: HomeProps) {
  const [savingMood, setSavingMood] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [lastMood, setLastMood] = useState<number | null>(null);
  const [stats, setStats] = useState({ totalMoods: 0, totalCBT: 0 });
  const [customEmotions, setCustomEmotions] = useState<string[]>([]);
  const [showReminder, setShowReminder] = useState(false);
  const [remindersCount, setRemindersCount] = useState(0);
  const [dailyQuote, setDailyQuote] = useState('');
  
  // Daily safety check states
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);
  const [submittingSafety, setSubmittingSafety] = useState(false);

  // Step wizard states
  const [currentStep, setCurrentStep] = useState(1); // 1 = valence, 2 = energy, 3 = selection, 4 = intensity + details
  const [valence, setValence] = useState<'positive' | 'negative' | null>(null);
  const [energy, setEnergy] = useState<'high' | 'low' | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<ThaiEmotion | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [customNote, setCustomNote] = useState('');

  const [isCheckedInToday, setIsCheckedInToday] = useState(false);
  const [lastEmotionDetails, setLastEmotionDetails] = useState<{
    emotionType: string;
    mood: number;
    quadrant?: string;
  } | null>(null);

  const quotes = [
    "ความรู้สึกไม่ใช่ศัตรู แต่มันคือเพื่อนที่มาบอกอะไรบางอย่างแค่นั้น",
    "วันนี้เป็นวันที่ดีที่จะใจดีกับตัวเองนะ",
    "ความล้มเหลวไม่ใช่จุดจบ แต่มันคือโอกาสที่ได้เริ่มใหม่ที่ดีกว่าเดิม",
    "เก่งมากแล้วนะที่ผ่านวันนี้มาได้ พักผ่อนให้เต็มที่ล่ะ",
    "หัวใจของคุณต้องการความรักจากคุณมากกว่าใครคนไหน"
  ];

  useEffect(() => {
    setDailyQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    const fetchData = async () => {
      try {
        // Daily safety check status trigger
        const disableDailySafety = localStorage.getItem('disableDailySafetyCheck') === 'true';
        const lastCheckDate = localStorage.getItem('lastDailySafetyCheckDate');
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if (!disableDailySafety && lastCheckDate !== todayStr) {
          setShowSafetyCheck(true);
        }

        // Latest Mood
        const qLatest = query(
          collection(db, 'users', user.uid, 'moodLogs'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const latestSnap = await getDocs(qLatest);
        
        let hasCheckedInToday = false;
        if (!latestSnap.empty) {
          const doc = latestSnap.docs[0].data();
          const lastDate = doc.createdAt?.toDate();
          if (lastDate && isSameDay(lastDate, new Date())) {
            hasCheckedInToday = true;
          }
          setLastMood(doc.mood - 1);
          setLastEmotionDetails({
            emotionType: doc.emotionType,
            mood: doc.mood,
            quadrant: doc.quadrant
          });
        }

        setIsCheckedInToday(hasCheckedInToday);
        setShowReminder(!hasCheckedInToday);

        // Fetch custom emotions
        const moodLogsSnap = await getDocs(collection(db, 'users', user.uid, 'moodLogs'));
        const historicalEmotions: string[] = [];
        moodLogsSnap.forEach(doc => {
          const type = doc.data().emotionType as string;
          if (type && !historicalEmotions.includes(type)) {
            historicalEmotions.push(type);
          }
        });
        setCustomEmotions(historicalEmotions.slice(0, 8));
        
        const thoughtSnap = await getDocs(collection(db, 'users', user.uid, 'thoughtRecords'));
        const reminderSnap = await getDocs(collection(db, 'users', user.uid, 'reminders'));
        setRemindersCount(reminderSnap.docs.filter(d => d.data().enabled).length);
        setStats({ totalMoods: moodLogsSnap.size, totalCBT: thoughtSnap.size });
      } catch (error) {
        console.error('Error fetching home data:', error);
      }
    };
    fetchData();
  }, [user.uid]);

  const handleConfirmSafety = async () => {
    setSubmittingSafety(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'safetyPlanLogs'), {
        userId: user.uid,
        type: 'safe-confirmed',
        note: 'ยืนยันสภาวะความถามห่วงใย: ฉันยังรู้สึกปลอดภัยปกป้องคุ้มครองวิญญาณได้ดี 🤍',
        createdAt: serverTimestamp()
      });
      
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      localStorage.setItem('lastDailySafetyCheckDate', todayStr);
      setShowSafetyCheck(false);
      toast.success('ยินดีเป็นอย่างยิ่งที่คุณปลอดภัยและก้าวผ่านวันไปได้ด้วยสติและรอยยิ้มนะคะ 🤍');
    } catch (err) {
      console.error('Error confirming safety:', err);
      toast.error('ไม่สามารถบันทึกข้อมูลได้ แต่ส่งใจรักษาอุ่นให้เสมอค่ะ');
    } finally {
      setSubmittingSafety(false);
    }
  };

  const handleDisableSafetyCheck = () => {
    localStorage.setItem('disableDailySafetyCheck', 'true');
    setShowSafetyCheck(false);
    toast.success('ปิดระบบแจ้งเตือนถามความรู้สึกปลอดภัยรายวันแล้วนะคะ (สามารถเปิดได้จากหน้าแผนความปลอดภัย)');
  };

  const submitMood = async () => {
    if (savingMood || !selectedEmotion) return;
    
    setSavingMood(true);
    const quadrantKey = `${energy}-${valence}`;
    const emojiMap: Record<string, string> = {
      'high-positive': '😆',
      'high-negative': '😡',
      'low-negative': '😢',
      'low-positive': '😌'
    };
    const emojiVal = emojiMap[quadrantKey] || '✨';

    try {
      await addDoc(collection(db, 'users', user.uid, 'moodLogs'), {
        userId: user.uid,
        mood: intensity,
        emotionType: selectedEmotion.thai,
        quadrant: quadrantKey,
        emoji: emojiVal,
        note: customNote,
        createdAt: serverTimestamp()
      });

      setLastEmotionDetails({
        emotionType: selectedEmotion.thai,
        mood: intensity,
        quadrant: quadrantKey
      });
      setIsCheckedInToday(true);
      setShowReminder(false);
      setIsComplete(true);
      
      // Reset flow states
      setCurrentStep(1);
      setValence(null);
      setEnergy(null);
      setSelectedEmotion(null);
      setCustomNote('');
      setIntensity(5);

      toast.success('บันทึกอารมณ์สำเร็จ ขอบคุณที่แบ่งปันนะ 🤍');

      // Refresh Stats
      const moodLogsSnap = await getDocs(collection(db, 'users', user.uid, 'moodLogs'));
      const thoughtSnap = await getDocs(collection(db, 'users', user.uid, 'thoughtRecords'));
      setStats({ totalMoods: moodLogsSnap.size, totalCBT: thoughtSnap.size });
    } catch (error) {
      console.error('Mood log error:', error);
      toast.error('ไม่สามารถบันทึกอารมณ์ได้ในขณะนี้');
    } finally {
      setSavingMood(false);
    }
  };

  const getQuadrantKey = () => {
    if (valence && energy) {
      return `${energy}-${valence}`;
    }
    return 'low-positive';
  };

  const currentQuadrant = QUADRANTS[getQuadrantKey()];

  if (initialShowMoodOnly) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-indigo-900 tracking-tight flex items-center gap-2">
            บันทึกสภาวะอารมณ์ 🔮
          </h2>
          <p className="text-slate-500 font-sans text-xs">
            รู้เท่าทันใจ เข้าใจอารมณ์ คืนความเข้าใจแก่กมลจิตวิญญาณตนเอง
          </p>
        </div>
        
        {/* Mood Tracker Card */}
        <section id="mood-section" className="bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl relative">
                  <Heart className="w-5 h-5 animate-pulse text-rose-400 fill-rose-500" />
                  <Sparkles className="w-3 h-3 text-amber-300 absolute -top-0.5 -right-0.5" />
                </div>
                <span className="text-xs font-bold tracking-wide">สำรวจหัวใจตนเอง</span>
              </div>
              <div className="text-[9px] font-black uppercase tracking-[3px] bg-white/15 px-3 py-1 rounded-full backdrop-blur-md">
                Mood Circle Wheel 🎡
              </div>
            </div>
            
            {isComplete ? (
              <div className="space-y-5 text-center py-6 animate-in fade-in duration-500 max-w-sm mx-auto">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-teal-300 shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                </div>
                <div className="space-y-1.5 px-3">
                  <h3 className="text-xl font-bold">บันทึกอารมณ์สำเร็จเรียบร้อยแล้วค่ะ! 😊</h3>
                  <p className="text-white/85 text-xs font-sans leading-relaxed">
                    สภาวะสัมผัสใจของคุณถูกบันทึกร่องรอยไว้ในหน้าปฏิทิน <strong>My Journey</strong> และเตรียมพร้อมสำหรับการดูแลสุขภาพใจของคุณอย่างต่อเนื่อง 🤍
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 w-full max-w-[240px] mx-auto pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsComplete(false);
                      setIsCheckedInToday(false);
                      setCurrentStep(1);
                    }}
                    className="w-full py-3 bg-white text-indigo-950 font-extrabold rounded-xl text-xs active:scale-95 transition-all cursor-pointer hover:bg-slate-100 shadow-lg"
                  >
                    ต้องการบันทึกอารมณ์เพิ่มอีกรอบ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('home');
                    }}
                    className="w-full py-3 bg-white/10 text-white font-bold border border-white/20 rounded-xl text-xs active:scale-95 transition-all cursor-pointer hover:bg-white/20"
                  >
                    กลับไปหน้าแรก (Home Dashboard)
                  </button>
                </div>
              </div>
            ) : isCheckedInToday ? (
              <div className="space-y-4 text-center py-6 animate-in fade-in duration-500">
                <div className="flex justify-center animate-pulse">
                  <CrayonDrawing quadrant={lastEmotionDetails?.quadrant as any || 'low-positive'} size="md" />
                </div>
                <div className="space-y-1 max-w-xs mx-auto">
                  <h3 className="text-xl font-bold">บันทึกใจเรียบร้อยแล้วนะ 🤍</h3>
                  <p className="text-white/80 text-sm">
                    ตอนนี้คุณกำลังรู้สึก: <span className="font-extrabold text-amber-300 underline">{lastEmotionDetails?.emotionType || 'N/A'}</span>
                  </p>
                  <p className="text-[9px] text-white/70 bg-white/10 mx-auto w-fit px-3 py-1 rounded-full uppercase tracking-widest mt-2 font-black">
                    ระดับความเข้มข้น: {lastEmotionDetails?.mood || 5}/10
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-xs mx-auto pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setValence(null);
                      setEnergy(null);
                      setSelectedEmotion(null);
                      setIntensity(5);
                      setCustomNote('');
                      setIsCheckedInToday(false);
                      setIsComplete(false);
                      setCurrentStep(1);
                    }}
                    className="w-full py-3 bg-white hover:bg-slate-100 text-indigo-900 font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    บันทึกอารมณ์ซ้ำอีกครั้ง
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('home');
                    }}
                    className="w-full py-3 bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs rounded-xl transition-all border border-white/10 active:scale-95 cursor-pointer"
                  >
                    กลับไปหน้าแรก (Home Dashboard)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Question 1: Valence (Positive vs Negative) */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">1. อารมณ์ในภาพรวมไปทางส่วนไหน? 😊😔</h3>
                      <p className="text-white/70 text-xs">เริ่มต้นจากการสังเกตว่าสภาวะใจโน้มเอียงไปทางลบหรือบวกนะ</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        onClick={() => {
                          setValence('positive');
                          setCurrentStep(2);
                        }}
                        className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">ทางบวก (รู้สึกดี / สุขปิติ) 🟢</span>
                          <span className="text-[10px] text-white/60">อุ่นใจ มั่นใจ พอใจ สดชื่น ร่าเริง</span>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-60" />
                      </button>
                      <button
                        onClick={() => {
                          setValence('negative');
                          setCurrentStep(2);
                        }}
                        className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">ทางลบ (รู้สึกดิ่ง / ไม่สบายใจ) 🔴</span>
                          <span className="text-[10px] text-white/60">เหงา กังวล โกรธ เบื่อ เศร้า รำคาญ</span>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-60" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Question 2: Energy (High vs Low) */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold">2. พลังงานหรือความตื่นตัวล่ะเป็นอย่างไร? ⚡🌊</h3>
                      <p className="text-white/70 text-xs">รู้สึกตื่นเต้นกระฉับกระเฉง หรือว่านิ่งเงียบนอนใจดีคะ</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        onClick={() => {
                          setEnergy('high');
                          setCurrentStep(3);
                        }}
                        className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">พลังงานสูง (ตื่นตัว / ใจพุ่งพล่าน) ⚡</span>
                          <span className="text-[10px] text-white/60">กระตือรือร้น โกรธ โมโห ร่าเริง ช็อก ตื่นเต้น</span>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-60" />
                      </button>
                      <button
                        onClick={() => {
                          setEnergy('low');
                          setCurrentStep(3);
                        }}
                        className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">พลังงานต่ำ (นิ่งสงบ / เนือยเฉื่อย) 🌊</span>
                          <span className="text-[10px] text-white/60">ผ่อนคลาย สบายๆ ซีดเซียว เหนื่อยล้า ซึมเศร้า</span>
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-60" />
                      </button>
                    </div>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-white/60 hover:text-white underline font-medium"
                    >
                      ย้อนกลับ
                    </button>
                  </div>
                )}

                {/* Question 3: Emotion selection from quadrant */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold">3. อารมณ์ที่ใกล้เคียงที่สุดคือคำไหน? 🎡</h3>
                      <p className="text-white/70 text-xs">เลือกคำจำกัดความที่สื่อถึงพิกัดความรู้สึกปัจจุบันของคุณได้ตรงใจมากที่สุดนะคะ</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin text-slate-900">
                      {currentQuadrant.emotions.map((em) => (
                        <button
                          key={em.english}
                          onClick={() => {
                            setSelectedEmotion(em);
                            setCurrentStep(4);
                          }}
                          className={`py-2.5 px-3 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                            selectedEmotion?.english === em.english 
                              ? 'bg-white text-indigo-950 shadow-md scale-[1.02]' 
                              : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
                          }`}
                        >
                          {em.thai}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-white/60 hover:text-white underline font-medium"
                    >
                      ย้อนกลับ
                    </button>
                  </div>
                )}

                {/* Question 4: Intensity & Notes */}
                {currentStep === 4 && selectedEmotion && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-amber-300 tracking-wider">ขั้นตอนสุดท้าย</p>
                      <h3 className="text-lg font-bold">
                        ความเข้มข้นของ "{selectedEmotion.thai}" ระดับไหน? ({intensity}/10)
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={intensity}
                        onChange={(e) => setIntensity(parseInt(e.target.value))}
                        className="w-full accent-amber-300 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-white/60 font-mono">
                        <span>1 (เบาสุด)</span>
                        <span>5 (ปานกลาง)</span>
                        <span>10 (สูงสุด)</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold block">บันทึกช่วยจำ / เขียนระบายความในใจเพิ่มเติม:</label>
                      <textarea
                        value={customNote}
                        onChange={(e) => setCustomNote(e.target.value)}
                        placeholder="หากสะดวกลองระบายสักนิดสั้่นๆ ว่าอะไรเป็นตัวกระตุ้นให้เกิดอารมณ์นี้... 🤍"
                        rows={3}
                        className="w-full p-3 bg-white/10 focus:bg-white/15 text-white placeholder-white/40 rounded-2xl text-xs border border-white/10 focus:outline-none focus:border-white/30 whitespace-pre-wrap"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition-all active:scale-95"
                      >
                        ย้อนกลับ
                      </button>
                      <button
                        type="button"
                        disabled={savingMood}
                        onClick={submitMood}
                        className="flex-2 py-3 bg-white hover:bg-slate-150 text-indigo-950 font-black rounded-xl text-xs transition-all active:scale-95 shadow-lg"
                      >
                        {savingMood ? 'กำลังบันทึก...' : 'บันทึกอารมณ์เสร็จสิ้น ✅'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Reminder Notification */}
      <AnimatePresence>
        {showReminder && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-indigo-600 rounded-[2rem] p-5 text-white shadow-xl shadow-indigo-100 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bell className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Reminder</p>
                <p className="text-sm font-medium">ยังไม่ได้เช็คอินอารมณ์วันนี้เลยนะ!</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const moodElement = document.getElementById('mood-section');
                moodElement?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
            >
              ทำเลย
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Safety Query Widget */}
      <AnimatePresence>
        {showSafetyCheck && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-emerald-50 border-2 border-emerald-100 rounded-[2.5rem] p-6 space-y-4 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1 bg-transparent">
                <h3 className="text-base font-extrabold text-slate-900">เช็คเกราะสติ: วันนี้คุณยังรู้สึก "ปลอดภัย" ดีอยู่ไหมคะ? 🛡️</h3>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">
                  ผู้บำบัดอยากชวนคุณมารูดสติเช็คพิกัดความอุ่นใจร่วมกันสั้นๆ เพื่อให้มั่นใจว่าคุณยังคงประคองใจได้อย่างปลอดภัยดีในวันนี้ค่ะ
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                disabled={submittingSafety}
                onClick={handleConfirmSafety}
                className="flex-1 min-w-[120px] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl active:scale-95 transition-all shadow-md shadow-emerald-100 cursor-pointer"
              >
                {submittingSafety ? 'กำลังบันทึก...' : 'ปลอดภัยดี / คงแผนเดิม'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowSafetyCheck(false);
                  setActiveTab('safety');
                }}
                className="flex-1 min-w-[120px] py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                แก้ไขแผน / เขียนใหม่
              </button>
              
              <button
                type="button"
                onClick={handleDisableSafetyCheck}
                className="py-3 px-3 text-slate-400 hover:text-slate-650 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                ไม่ต้องถามอีกแล้ว
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Welcome */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              หวัดดี, {user.displayName?.split(' ')[0]}! ✨
            </h2>
            <p className="text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> {dailyQuote}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h3 className="font-black text-slate-800 uppercase tracking-[2px] text-[10px] ml-1">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => {
              const moodElement = document.getElementById('mood-section');
              moodElement?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-3 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all group"
          >
            <div className="p-2 bg-rose-50 rounded-xl group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">เช็คอินอารมณ์</p>
              <p className="text-[10px] text-slate-400">ระบายใจกันหน่อย</p>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('chill')}
            className="flex items-center gap-3 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all group"
          >
            <div className="p-2 bg-teal-50 rounded-xl group-hover:scale-110 transition-transform">
              <Wind className="w-5 h-5 text-teal-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">ฝึกหายใจ</p>
              <p className="text-[10px] text-slate-400">ผ่อนคลายทันที</p>
            </div>
          </button>
        </div>
      </section>

      {/* Mood Tracker Card */}
      <section id="mood-section" className="bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl relative">
                <Heart className="w-5 h-5" />
                <Sparkles className="w-3 h-3 text-amber-350 absolute -top-0.5 -right-0.5" />
              </div>
              <span className="text-xs font-bold tracking-wide">สำรวจหัวใจตนเอง</span>
            </div>
            <div className="text-[9px] font-black uppercase tracking-[3px] bg-white/15 px-3 py-1 rounded-full backdrop-blur-md">
              Mood Circle Wheel 🎡
            </div>
          </div>
          
          {isComplete ? (
            <div className="space-y-5 text-center py-6 animate-in fade-in duration-500 max-w-sm mx-auto">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-teal-300 shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
              </div>
              <div className="space-y-1.5 px-3">
                <h3 className="text-xl font-bold">บันทึกอารมณ์สำเร็จเรียบร้อยแล้วค่ะ! 😊</h3>
                <p className="text-white/85 text-xs font-sans leading-relaxed">
                  สภาวะสัมผัสใจของคุณถูกบันทึกร่องรอยไว้ในหน้าปฏิทิน <strong>My Journey</strong> และเตรียมพร้อมส่งออกพอร์ตคุยกับแพทย์บำบัดกูรูเรียบร้อยแล้วนะคะ 🤍
                </p>
              </div>
              <div className="flex flex-col gap-2.5 w-full max-w-[240px] mx-auto pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsComplete(false);
                    setIsCheckedInToday(false);
                    setCurrentStep(1);
                  }}
                  className="w-full py-3 bg-white text-indigo-950 font-extrabold rounded-xl text-xs active:scale-95 transition-all cursor-pointer hover:bg-slate-100 shadow-lg"
                >
                  ต้องการบันทึกอารมณ์เพิ่มอีกรอบ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsComplete(false);
                    setIsCheckedInToday(true);
                    setCurrentStep(1);
                  }}
                  className="w-full py-3 bg-white/10 text-white font-bold border border-white/20 rounded-xl text-xs active:scale-95 transition-all cursor-pointer hover:bg-white/20"
                >
                  กลับไปหน้าแรก (Home Dashboard)
                </button>
              </div>
            </div>
          ) : isCheckedInToday ? (
            <div className="space-y-4 text-center py-6 animate-in fade-in duration-500">
              <div className="flex justify-center animate-pulse">
                <CrayonDrawing quadrant={lastEmotionDetails?.quadrant as any || 'low-positive'} size="md" />
              </div>
              <div className="space-y-1 max-w-xs mx-auto">
                <h3 className="text-xl font-bold">บันทึกใจเรียบร้อยแล้วนะ 🤍</h3>
                <p className="text-white/80 text-sm">
                  ตอนนี้คุณกำลังรู้สึก: <span className="font-extrabold text-amber-300 underline">{lastEmotionDetails?.emotionType || 'N/A'}</span>
                </p>
                <p className="text-[9px] text-white/70 bg-white/10 mx-auto w-fit px-3 py-1 rounded-full uppercase tracking-widest mt-2 font-black">
                  ระดับความเข้มข้น: {lastEmotionDetails?.mood || 5}/10
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValence(null);
                  setEnergy(null);
                  setSelectedEmotion(null);
                  setIntensity(5);
                  setCustomNote('');
                  setIsCheckedInToday(false);
                  setIsComplete(false);
                  setCurrentStep(1);
                }}
                className="mt-4 px-6 py-2 bg-white hover:bg-slate-150 text-indigo-900 font-bold text-xs rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
              >
                บันทึกอารมณ์ซ้ำอีกครั้ง
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Question 1: Valence (Positive vs Negative) */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">1. อารมณ์ในภาพรวมไปทางส่วนไหน? 😊😔</h3>
                    <p className="text-white/70 text-xs">เริ่มต้นจากการสังเกตว่าสภาวะใจโน้มเอียงไปทางลบหรือบวกนะ</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      onClick={() => {
                        setValence('positive');
                        setCurrentStep(2);
                      }}
                      className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">ทางบวก (รู้สึกดี / สุขปิติ) 🟢</span>
                        <span className="text-[10px] text-white/60">อุ่นใจ มั่นใจ พอใจ สดชื่น ร่าเริง</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-60" />
                    </button>
                    <button
                      onClick={() => {
                        setValence('negative');
                        setCurrentStep(2);
                      }}
                      className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">ทางลบ (รู้สึกดิ่ง / ไม่สบายใจ) 🔴</span>
                        <span className="text-[10px] text-white/60">เหงา กังวล โกรธ เบื่อ เศร้า รำคาญ</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-60" />
                    </button>
                  </div>
                </div>
              )}

              {/* Question 2: Energy (High vs Low) */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">2. พลังงานหรือความตื่นตัวล่ะเป็นอย่างไร? ⚡🌊</h3>
                    <p className="text-white/70 text-xs">อารมณ์ประเภทพลังงานขึ้น (High Energy) หรือ พลังงานลง (Low Energy)</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      onClick={() => {
                        setEnergy('high');
                        setCurrentStep(3);
                      }}
                      className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">ทางขึ้น (มีพลัง / แรงกระตุ้นสูง) ⚡</span>
                        <span className="text-[10px] text-white/60">ตื่นเต้น คึกคัก กังวลลนลาน หงุดหงิดใจ</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-60" />
                    </button>
                    <button
                      onClick={() => {
                        setEnergy('low');
                        setCurrentStep(3);
                      }}
                      className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-left transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">ทางลง (หมดพลัง / พักผ่อนนิ่งเงียบ) 🌊</span>
                        <span className="text-[10px] text-white/60">สบายๆ ชิล ผ่อนคลาย ผิดหวัง เศร้าซึม ล้ากาย</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-60" />
                    </button>
                  </div>
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold rounded-xl transition-all"
                  >
                    ย้อนกลับข้อก่อนหน้า
                  </button>
                </div>
              )}

              {/* Step 3: Selecting Specific Thai Emotion inside Quadrant */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">3. เลือกคำพูดในใจที่ใช่ที่สุด 🎡</h3>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${currentQuadrant.color}`}>
                        {currentQuadrant.name}
                      </span>
                    </div>
                    <p className="text-white/70 text-xs">เลือกอารมณ์จากวงล้อจิตวิทยาที่ใจบอกเราวันนี้:</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1 select-none custom-scrollbar outline-none">
                    {currentQuadrant.emotions.map((e, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedEmotion(e);
                          setCurrentStep(4);
                        }}
                        className="py-3 px-3 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl text-left transition-all active:scale-[0.95] text-xs font-bold leading-tight flex items-center justify-between"
                      >
                        <span>{e.thai}</span>
                        <span className="text-[9px] text-white/40 font-mono tracking-tight">{e.english}</span>
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentStep(2)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold rounded-xl transition-all"
                  >
                    ย้อนกลับ
                  </button>
                </div>
              )}

              {/* Step 4: Intensity 1-10 + Note Textarea with gorgeous crayon visual */}
              {currentStep === 4 && selectedEmotion && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-3xl border border-white/10 justify-between">
                    <div className="flex items-center gap-3">
                      <CrayonDrawing quadrant={getQuadrantKey() as any} size="sm" />
                      <div>
                        <p className="text-[10px] text-white/60 tracking-wider">อารมณ์ของคุณวันนี้</p>
                        <h4 className="text-lg font-black text-amber-300 leading-snug">{selectedEmotion.thai}</h4>
                        <p className="text-[10px] text-white/55 italic capitalize">({selectedEmotion.english})</p>
                      </div>
                    </div>
                  </div>

                  {/* Level Slider */}
                  <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span>วัดระดับความเข้มข้นอารมณ์นี้:</span>
                      <span className="bg-amber-400 text-slate-900 px-3 py-0.5 rounded-full font-black text-xs">
                        {intensity} เต็ม 10
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={intensity} 
                      onChange={(e) => setIntensity(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[9px] text-white/50 px-1">
                      <span>เบลอๆ บางเบา (1)</span>
                      <span>ปานกลาง (5)</span>
                      <span>ทะลักขีดสุด (10)</span>
                    </div>
                  </div>

                  {/* Optional Note Textarea */}
                  <textarea 
                    className="w-full p-4 bg-white/5 rounded-2xl text-xs placeholder:text-white/40 border border-white/10 focus:outline-none focus:border-amber-300 min-h-[70px] leading-relaxed transition-all"
                    placeholder="มีเบื้องลึกเบื้องหลังหรือมีสิ่งใดในใจที่ทำให้อารมณ์นี้เกิดขึ้น เขียนบอกเล่าได้นะครับ..."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                  />

                  {/* Action buttons */}
                  <div className="flex gap-2.5">
                    <button 
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/10"
                    >
                      ย้อนกลับ
                    </button>
                    <button 
                      onClick={submitMood} 
                      disabled={savingMood}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-900 rounded-xl text-xs font-black shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {savingMood ? 'กำลังประมวล...' : 'บันทึกใจ'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Reminder Setup CTA */}
      {remindersCount === 0 && (
        <section className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-2xl font-black">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">ตั้งเวลาดูแลใจกันไหม?</p>
              <p className="text-[10px] text-slate-400">สร้างความสม่ำเสมอในการดูแลตัวเอง</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('profile')}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </button>
        </section>
      )}

      {/* Main Grid Actions */}
      <section className="space-y-5">
        <div className="flex items-center justify-between ml-1">
          <h3 className="font-black text-slate-800 uppercase tracking-[2px] text-[10px]">ใจกู...กูรู้ Explorer ✨</h3>
          <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-black">Self-Awareness Map</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ModuleCardV2 
            title="ห้องเรียนคิด" 
            label="CBT Dojo"
            icon={<Brain className="w-6 h-6 text-indigo-600" />} 
            color="bg-indigo-50/50 border-indigo-100/60"
            delay={0.1}
            onClick={() => setActiveTab('dojo')}
            description="ฉลาดรู้ทันความคิดลบ ฝึกทักษะการสลัดดราม่าลูปอย่างเป็นรูปธรรม"
          />
          <ModuleCardV2 
            title="ปฐมพยาบาลใจ" 
            label="Safe Box"
            icon={<HeartPulse className="w-6 h-6 text-rose-600" />} 
            color="bg-rose-50/50 border-rose-100/60"
            delay={0.2}
            onClick={() => setActiveTab('aid')}
            description="กดตอนใจแตกสลายหรือตื่นตระหนก มีระบบประคองอารมณ์ฉุกเฉินทันที"
          />
          <ModuleCardV2 
            title="มุมสงบใจ" 
            label="Chill Zone"
            icon={<Wind className="w-6 h-6 text-teal-600" />} 
            color="bg-teal-50/50 border-teal-100/60"
            delay={0.3}
            onClick={() => setActiveTab('chill')}
            description="พักลมหายใจคืนความนิ่ง ปรับคลื่นสมองชิวๆ ร่วมกับซินธิไซเซอร์บำบัด"
          />
          <ModuleCardV2 
            title="แผนปลอดภัย" 
            label="Safety Plan"
            icon={<ShieldAlert className="w-6 h-6 text-amber-600" />} 
            color="bg-amber-50/50 border-amber-100/60"
            delay={0.4}
            onClick={() => setActiveTab('safety')}
            description="ออกแบบคัมภีร์รับมือกับพายุอารมณ์เพื่อรับประกันความพ้นขีดอันตราย"
          />
        </div>
      </section>

      {/* AI Assistant Banner */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/30 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
        
        <div className="relative z-10 flex flex-col space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl">
              <MessageCircle className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[3px] text-indigo-400">Premium AI Partner</p>
              <h3 className="text-xl font-bold">มีเรื่องในใจที่บอกใครไม่ได้?</h3>
            </div>
          </div>
          
          <p className="text-slate-400 text-sm leading-relaxed max-w-[280px]">
            JaiGuGuRu (ใจกู...กูรู้) AI พร้อมฟังทุกเรื่องของคุณ ผ่านการฝึกฝนด้วยหลักจิตวิทยา ปลอดภัย และเป็นความลับ 100%
          </p>

          <button 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-95 cursor-pointer"
            onClick={() => setActiveTab('dojo')}
          >
            ทักทาย AI เลย <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Progression Banner */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">My Journey</h3>
              <p className="text-xs text-slate-400">เส้นทางความก้าวหน้าของคุณ</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="p-2 bg-slate-50 rounded-full cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.totalCBT / 5) * 100, 100)}%` }}
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-sm"
              transition={{ duration: 1.5, ease: "circOut" }}
            />
          </div>
          <p className="text-xs text-slate-500 text-center font-medium">
            {stats.totalCBT > 0 
              ? `เก่งมาก! ทำภารกิจ CBT สำเร็จไปแล้ว ${stats.totalCBT} อย่างสัปดาห์นี้`
              : 'เริ่มภารกิจแรกวันนี้ เพื่อบันทึกความก้าวหน้ากัน!'}
          </p>
        </div>
      </section>
    </div>
  );
}

function ModuleCardV2({ title, label, icon, color, delay, onClick, description }: { title: string, label: string, icon: React.ReactNode, color: string, delay: number, onClick: () => void, description?: string }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`${color} p-5 rounded-[2.2rem] text-left space-y-3.5 transition-all shadow-xs border border-slate-105 group hover:shadow-lg hover:bg-white relative overflow-hidden flex flex-col justify-between min-h-[175px] cursor-pointer`}
    >
      <div className="space-y-3.5">
        <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs group-hover:rotate-6 transition-transform duration-300">
          {icon}
        </div>
        <div className="space-y-1">
          <h4 className="font-extrabold text-sm text-slate-950 leading-none">{title}</h4>
          <p className="text-[8px] uppercase font-bold tracking-[1.5px] text-slate-400 mt-1">{label}</p>
        </div>
      </div>
      {description && (
        <p className="text-[10px] text-slate-500 font-medium leading-relaxed pt-2.5 border-t border-slate-100 group-hover:border-slate-200">
          {description}
        </p>
      )}
    </motion.button>
  );
}
