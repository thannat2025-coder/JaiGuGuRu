import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
  Moon, 
  Sun, 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  CheckCircle2,
  Heart,
  Target
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function ChillZone() {
  const [activeMode, setActiveMode] = useState<'breathing' | 'pmr' | 'meditation' | null>(null);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">มุมสงบ</h2>
        <p className="text-slate-500 text-sm">พื้นที่สำหรับการฝึกสมาธิ ผ่อนคลายร่างกายและจิตใจ</p>
      </div>

      {!activeMode ? (
        <div className="grid grid-cols-1 gap-4">
          <RelaxCard 
            title="ฝึกสมาธินำทาง" 
            desc="เลือกหัวข้อและเวลาที่ต้องการ เพื่อการพักผ่อนที่มีประสิทธิภาพ" 
            icon={<Moon className="w-8 h-8 text-indigo-500" />} 
            bg="bg-indigo-50"
            onClick={() => setActiveMode('meditation')}
          />
          <RelaxCard 
            title="ฝึกหายใจตามจังหวะ" 
            desc="4-7-8 หรือ Box Breathing เพื่อคุมระบบประสาท" 
            icon={<Wind className="w-8 h-8 text-teal-500" />} 
            bg="bg-teal-50"
            onClick={() => setActiveMode('breathing')}
          />
          <RelaxCard 
            title="ผ่อนคลายกล้ามเนื้อ (PMR)" 
            desc="เกร็งและคลายเพื่อระบายความเครียดในร่างกาย" 
            icon={<Zap className="w-8 h-8 text-amber-500" />} 
            bg="bg-amber-50"
            onClick={() => setActiveMode('pmr')}
          />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 min-h-[500px] flex flex-col items-center"
        >
          <button 
            onClick={() => setActiveMode(null)}
            className="self-start text-slate-400 hover:text-slate-600 mb-8 flex items-center gap-2 text-sm font-bold"
          >
            <RotateCcw className="w-4 h-4" /> กลับเมนูหลัก
          </button>

          {activeMode === 'meditation' && <MeditationExercise />}
          {activeMode === 'breathing' && <BreathingExercise />}
          {activeMode === 'pmr' && <PMRExercise />}
        </motion.div>
      )}
    </div>
  );
}

function BreathingExercise() {
  const [pattern, setPattern] = useState<'478' | 'box'>('478');
  const [phase, setPhase] = useState<'In' | 'Hold' | 'Out' | 'Pause'>('In');
  const [isActive, setIsActive] = useState(false);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isActive) {
      timer = setInterval(() => {
        setCounter(c => {
          const next = c + 1;
          if (pattern === '478') {
            if (phase === 'In' && next >= 4) { setPhase('Hold'); return 0; }
            if (phase === 'Hold' && next >= 7) { setPhase('Out'); return 0; }
            if (phase === 'Out' && next >= 8) { setPhase('In'); return 0; }
          } else if (pattern === 'box') {
            if (phase === 'In' && next >= 4) { setPhase('Hold'); return 0; }
            if (phase === 'Hold' && next >= 4) { setPhase('Out'); return 0; }
            if (phase === 'Out' && next >= 4) { setPhase('Pause'); return 0; }
            if (phase === 'Pause' && next >= 4) { setPhase('In'); return 0; }
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase, pattern]);

  const cycleText = {
    'In': 'หายใจเข้า...',
    'Hold': 'กลั้นหายใจ...',
    'Out': 'หายใจออก...',
    'Pause': 'หยุดพัก...'
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center space-y-12">
      <div className="flex bg-slate-100 p-1 rounded-2xl w-full">
        <button 
          onClick={() => { setPattern('478'); setPhase('In'); setCounter(0); }}
          className={cn("flex-1 py-3 rounded-xl text-xs font-bold transition-all", pattern === '478' ? "bg-white shadow-sm text-teal-600" : "text-slate-500")}
        >
          4-7-8 (หลับสบาย)
        </button>
        <button 
          onClick={() => { setPattern('box'); setPhase('In'); setCounter(0); }}
          className={cn("flex-1 py-3 rounded-xl text-xs font-bold transition-all", pattern === 'box' ? "bg-white shadow-sm text-teal-600" : "text-slate-500")}
        >
          Box Breathing (มีสมาธิ)
        </button>
      </div>

      <div className="relative flex items-center justify-center w-full aspect-square max-w-[280px]">
        {/* Animated circle */}
        <motion.div 
          animate={{
            scale: phase === 'In' ? 1.5 : phase === 'Out' ? 1 : (phase === 'Hold' || phase === 'Pause') ? (phase === 'Hold' ? 1.5 : 1) : 1,
            opacity: phase === 'In' ? 1 : phase === 'Out' ? 0.6 : 0.8
          }}
          transition={{ duration: phase === 'In' ? 4 : phase === 'Out' ? (pattern === '478' ? 8 : 4) : 0, ease: "linear" }}
          className="absolute inset-0 bg-teal-400/20 rounded-full blur-xl"
        />
        <motion.div 
          animate={{
            scale: phase === 'In' ? 1.5 : phase === 'Out' ? 1 : (phase === 'Hold' || phase === 'Pause') ? (phase === 'Hold' || phase === 'Pause' ? (phase === 'Hold' ? 1.5 : 1) : 1) : 1
          }}
          transition={{ duration: phase === 'In' ? 4 : phase === 'Out' ? (pattern === '478' ? 8 : 4) : 0, ease: "easeInOut" }}
          className="w-1/2 h-1/2 bg-teal-500 rounded-full shadow-2xl shadow-teal-100 flex items-center justify-center z-10"
        />
        <div className="absolute z-20 text-center font-bold">
          <div className="text-white text-3xl font-mono">{counter}</div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h4 className="text-2xl font-bold text-teal-900">{cycleText[phase]}</h4>
        <p className="text-slate-400 text-sm">ทำต่อเนื่องอย่างน้อย 4 รอบเพื่อความคลายเครียด</p>
      </div>

      <button 
        onClick={() => setIsActive(!isActive)}
        className={cn("w-full py-5 rounded-[2rem] font-bold text-xl transition-all shadow-xl", isActive ? "bg-slate-100 text-slate-600" : "bg-teal-600 text-white shadow-teal-50")}
      >
        {isActive ? 'หยุดชั่วคราว' : 'เริ่มฝึกหายใจ'}
      </button>
    </div>
  );
}

function PMRExercise() {
  const [step, setStep] = useState(0);
  const pmrSteps = [
    { area: 'เท้าและน่อง', instructions: 'จิกปลายเท้าให้แน่นที่สุด เกร็งค้างไว้... แล้วคลายอารมณ์ที่เท้าออกทั้งหมด' },
    { area: 'ต้นขาและสะโพก', instructions: 'เกร็งกล้ามเนื้อต้นขาและก้นให้แน่น... แล้วปล่อยให้กล้ามเนื้อไหลไปตามเก้าอี้' },
    { area: 'หน้าท้องและหลัง', instructions: 'พยายามแขม่วท้องให้ลึกที่สุด เกร็ง... แล้วปล่อยท้องให้ยาวและนิ่ม' },
    { area: 'ไหล่และคอ', instructions: 'ยักไหล่ขึ้นไปหาใบหูให้สูงที่สุด เกร็ง... แล้วทิ้งไหล่ลงให้นุ่มนวลที่สุด' },
    { area: 'ใบหน้าและกราม', instructions: 'หลับตาให้แน่น กัดฟันให้ตึง เกร็ง... แล้วผ่อนลมหายใจออกทางปากพร้อมคลายใบหน้า' }
  ];

  return (
    <div className="w-full flex-1 flex flex-col items-center space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold">ผ่อนคลายกล้ามเนื้อทีละส่วน</h3>
        <p className="text-slate-500 text-sm">การเกร็งและคลายช่วยระบายความเครียดที่สะสมในร่างกาย</p>
      </div>

      <div className="w-full bg-amber-50 rounded-3xl p-8 border border-amber-100 relative overflow-hidden flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center space-y-6"
          >
            <div className="inline-block p-4 bg-white rounded-2xl shadow-sm mb-4">
              <Zap className="w-8 h-8 text-amber-500" />
            </div>
            <h4 className="text-2xl font-bold text-amber-900">{pmrSteps[step].area}</h4>
            <p className="text-amber-800 leading-relaxed text-lg">{pmrSteps[step].instructions}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-2 w-full">
        {pmrSteps.map((_, i) => (
          <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-amber-500" : "bg-slate-100")} />
        ))}
      </div>

      <button 
        onClick={() => setStep((step + 1) % pmrSteps.length)}
        className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-100"
      >
        {step === pmrSteps.length - 1 ? 'จบการฝึก' : 'ไปส่วนต่อไป'}
      </button>
    </div>
  );
}

function MeditationExercise() {
  const [theme, setTheme] = useState<'stress' | 'focus' | 'sleep'>('stress');
  const [duration, setDuration] = useState(5); // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('เตรียมตัวให้พร้อม...');

  const themes = {
    stress: {
      label: 'ลดความเครียด',
      icon: <Heart className="w-5 h-5" />,
      color: 'bg-rose-50 text-rose-600',
      prompts: [
        'หายใจเข้าลึกๆ... ปล่อยความกังวลออกไปกับลมหายใจ...',
        'สังเกตความตึงเครียดที่หัวไหล่ แล้วค่อยๆ ผ่อนมันลง...',
        'คุณกำลังทำได้ดีมาก ทุกอย่างจะผ่านไปได้ด้วยดี...',
        'รู้สึกถึงความเบาสบายที่ค่อยๆ แผ่ซ่านไปทั่วร่างกาย...',
        'ปล่อยวางทุกความคิดที่ไม่ได้จำเป็นในตอนนี้...'
      ]
    },
    focus: {
      label: 'สร้างสมาธิ',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-indigo-50 text-indigo-600',
      prompts: [
        'รวบรวมจิตใจมาที่จุดกึ่งกลางระหว่างคิ้ว...',
        'สัมผัสลมหายใจที่กระทบปลายจมูก สั้น.. หรือ ยาว.. แค่รับรู้...',
        'ปล่อยความว้าวุ่นให้ผ่านไปเหมือนก้อนเมฆบนท้องฟ้า...',
        'ความสงบคือพลังของการสร้างสรรค์ คุณพร้อมสำหรับวันนี้...',
        'หายใจเข้า รับเอาพลังงานที่สดชื่นเข้ามา...'
      ]
    },
    sleep: {
      label: 'ช่วยให้นอนหลับ',
      icon: <Moon className="w-5 h-5" />,
      color: 'bg-purple-50 text-purple-600',
      prompts: [
        'ทิ้งน้ำหนักตัวลงบนที่นอน... ปล่อยให้มันโอบอุ้มคุณ...',
        'ความมืดคือพื้นที่ปลอดภัยของคุณ จิตใจเริ่มสงบลง...',
        'นับลมหายใจช้าๆ 1... 2... แล้วเคลิ้มหลับไป...',
        'ร่างกายของคุณกำลังฟื้นฟูตัวเองในความฝัน...',
        'พรุ่งนี้เช้าคุณจะตื่นมาพร้อมความสดใส พักผ่อนเถอะนะ...'
      ]
    }
  };

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    let timer: any;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => t - 1);
        
        // Update prompt every 15 seconds
        if (timeLeft % 15 === 0) {
          const randomPrompt = themes[theme].prompts[Math.floor(Math.random() * themes[theme].prompts.length)];
          setCurrentPrompt(randomPrompt);
          speak(randomPrompt);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setCurrentPrompt('การฝึกเสร็จสิ้นแล้ว สัมผัสถึงความเปลี่ยนไหม?');
      speak('การฝึกเสร็จสิ้นแล้ว สัมผัสถึงความเปลี่ยนไหม?');
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft, theme]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center space-y-8">
      {!isActive && timeLeft === duration * 60 ? (
        <div className="w-full space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[2px] text-slate-400">เลือกหัวข้อ</label>
            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(themes) as Array<keyof typeof themes>).map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                    theme === t ? "border-indigo-600 bg-indigo-50 shadow-md" : "border-slate-100 opacity-60 grayscale"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", themes[t].color)}>
                      {themes[t].icon}
                    </div>
                    <span className="font-bold text-slate-900">{themes[t].label}</span>
                  </div>
                  {theme === t && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[2px] text-slate-400">ระยะเวลา (นาที)</label>
            <div className="flex gap-3">
              {[5, 10, 15].map(m => (
                <button
                  key={m}
                  onClick={() => setDuration(m)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold transition-all",
                    duration === m ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {m} นาที
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => { setIsActive(true); speak('เริ่มการทำสมาธิ... นั่งในท่าที่สบายที่สุด'); }}
            className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" /> เริ่มทำสมาธิ
          </button>
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col items-center justify-center space-y-12">
          <div className="relative flex items-center justify-center">
            {/* Visualizer and pulse */}
            <motion.div 
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className={cn("absolute w-64 h-64 rounded-full blur-3xl", theme === 'stress' ? 'bg-rose-400' : theme === 'focus' ? 'bg-indigo-400' : 'bg-purple-400')}
            />
            <div className="text-center relative z-10">
              <div className="text-6xl font-black tracking-tighter text-slate-900 mb-2">{formatTime(timeLeft)}</div>
              <div className="text-xs font-bold uppercase tracking-[3px] text-slate-400">{themes[theme].label}</div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-[2.5rem] w-full text-center min-h-[140px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p 
                key={currentPrompt}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg font-bold text-slate-700 italic leading-relaxed"
              >
                "{currentPrompt}"
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex gap-4 w-full">
            <button 
              onClick={() => setIsActive(!isActive)}
              className="flex-1 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
            >
              {isActive ? <><Pause className="w-5 h-5" /> พัก</> : <><Play className="w-5 h-5" /> เล่นต่อ</>}
            </button>
            <button 
              onClick={() => { setIsActive(false); setTimeLeft(duration * 60); window.speechSynthesis.cancel(); }}
              className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-slate-400">
            <Volume2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">เปิดเสียงเพื่อให้ AI นำทางคุณ</span>
          </div>
        </div>
      )}
    </div>
  );
}

function RelaxCard({ title, desc, icon, bg, onClick }: any) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn("p-6 rounded-[2.5rem] text-left flex items-start gap-5 border border-slate-100 transition-all hover:shadow-md", bg)}
    >
      <div className="bg-white p-4 rounded-3xl shadow-sm shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-lg leading-tight">{title}</h4>
        <p className="text-slate-500 text-xs mt-1 leading-relaxed">{desc}</p>
      </div>
    </motion.button>
  );
}
