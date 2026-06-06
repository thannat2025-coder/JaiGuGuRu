import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Waves, 
  Dumbbell, 
  Wind, 
  Fingerprint, 
  RotateCcw,
  Eye,
  Volume2,
  Hand,
  Ear,
  Link2,
  ShieldAlert,
  Users,
  PhoneCall,
  CheckSquare,
  HeartHandshake,
  Sparkles,
  ArrowRight,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Info
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

type PfaSection = 'none' | 'look' | 'listen' | 'link';

export default function FirstAidKit() {
  const [activeTab, setActiveTab] = useState<'dbt' | 'pfa'>('dbt');
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [activePfa, setActivePfa] = useState<PfaSection>('none');

  return (
    <div className="space-y-6 pb-12">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-50 rounded-xl text-indigo-600">🛡️</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">กล่องปฐมพยาบาลใจ (Mental First Aid Kit)</h2>
        </div>
        <p className="text-slate-500 text-xs font-sans leading-relaxed">
          รวมทักษะวิกฤตทางจิตวิทยาเพื่อช่วยประคองตนเอง และหลักปฏิบัติสากล 3ป. (Look, Listen, Link) ของ WHO และสภากาชาดสากลในกรณีเผชิญเหตุเปราะบาง
        </p>
      </div>

      {/* Styled Tabs */}
      <div className="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50">
        <button
          onClick={() => {
            setActiveTab('dbt');
            setActiveSkill(null);
            setActivePfa('none');
          }}
          className={cn(
            "flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
            activeTab === 'dbt' 
              ? "bg-white text-indigo-950 shadow-sm font-black" 
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          <Fingerprint className="w-4 h-4" />
          ปฐมพยาบาลตนเอง (DBT Emergency)
        </button>
        <button
          onClick={() => {
            setActiveTab('pfa');
            setActiveSkill(null);
            setActivePfa('none');
          }}
          className={cn(
            "flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
            activeTab === 'pfa' 
              ? "bg-white text-indigo-950 shadow-sm font-black" 
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          <HeartHandshake className="w-4 h-4" />
          หลักสากล 3ป. (Look, Listen, Link)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dbt' ? (
          <motion.div
            key="dbt-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {!activeSkill ? (
              <div className="grid grid-cols-1 gap-4">
                <SkillCard 
                  id="temperature"
                  title="Temperature (ปรับอุณหภูมิร่างกาย)"
                  desc="ใช้ความเย็นตกใจเพื่อควบคุมระบบประสาทส่วนกลางแบบ Dive Reflex ทันควัน"
                  icon={<Waves className="w-8 h-8 text-blue-500" />}
                  color="bg-blue-50/50 hover:bg-blue-50 border-blue-100"
                  onClick={() => setActiveSkill('temperature')}
                />
                <SkillCard 
                  id="exercise"
                  title="Intense Exercise (ระบายพลังงานล้น)"
                  desc="สลัดความรู้สึกตึงเครียดผ่านทางเคมีและกล้ามเนื้อด้วยการเคลื่อนตัวฉับพลัน"
                  icon={<Dumbbell className="w-8 h-8 text-amber-600" />}
                  color="bg-amber-50/40 hover:bg-amber-50/80 border-amber-100"
                  onClick={() => setActiveSkill('exercise')}
                />
                <SkillCard 
                  id="grounding"
                  title="5-4-3-2-1 Grounding (ประคองสัญญานสัมผัส)"
                  desc="ดึงสติกลับสู่ความเป็นจริงรอบข้าง หลีกหนีคลื่นลมความคิดที่หมุนกระจัดกระจาย"
                  icon={<Wind className="w-8 h-8 text-indigo-500" />}
                  color="bg-indigo-50/40 hover:bg-indigo-50 border-indigo-100"
                  onClick={() => setActiveSkill('grounding')}
                />
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 min-h-[440px] flex flex-col justify-between"
              >
                <button 
                  onClick={() => setActiveSkill(null)}
                  className="self-start text-slate-400 hover:text-indigo-650 mb-6 flex items-center gap-1.5 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> ย้อนกลับเมนูปฐมพยาบาลตนเอง
                </button>

                <div className="flex-1 flex flex-col justify-center">
                  {activeSkill === 'temperature' && <TemperatureSkill />}
                  {activeSkill === 'exercise' && <ExerciseSkill />}
                  {activeSkill === 'grounding' && <GroundingSkill />}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="pfa-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {activePfa === 'none' ? (
              <div className="space-y-4">
                {/* Introduction to PFA Card */}
                <div className="p-5 bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 text-white rounded-[2rem] shadow-md border border-indigo-950/20 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px]/none font-black tracking-widest uppercase">
                    <Sparkles className="w-3 h-3 text-amber-300" /> WHO & Red Cross Standard
                  </div>
                  <h3 className="text-lg font-extrabold tracking-tight">หัวใจสำคัญของการปฐมพยาบาลใจสากล</h3>
                  <p className="text-white/85 text-xs font-sans leading-relaxed">
                    เพราะความบอบช้ำทางจิตใจไม่มีแผลมองเห็น การเข้าหา ช่วยเหลือ และส่งต่ออย่างถูกวิธีช่วยทุเลาการเกิด PTSD (โรคเครียดหลังเหตุการณ์รุนแรง) ได้อย่างล้นหลาม ยึดสติด้วยหลัก 3ป. พื้นฐานดังนี้
                  </p>
                </div>

                {/* 3 Action Principle Cards */}
                <div className="grid grid-cols-1 gap-3">
                  <PfaCard 
                    title="1. LOOK (สอดส่องมองหา)"
                    subtitle="ประเมินความปลอดภัย สติกระเจิง และกลุ่มเปราะบาง"
                    badge="สังเกตและพิจารณา"
                    icon={<Eye className="w-6 h-6 text-sky-600" />}
                    color="bg-sky-50/40 border-sky-100 hover:bg-sky-50"
                    onClick={() => setActivePfa('look')}
                  />
                  <PfaCard 
                    title="2. LISTEN (ใส่ใจรับฟัง)"
                    subtitle="ทัศนคติไม่ตัดสิน ปลอบขวัญ และชวนฝึกสมาธิเบี่ยงความกังวล"
                    badge="เข้าหาและรับฟัง"
                    icon={<Ear className="w-6 h-6 text-teal-600" />}
                    color="bg-teal-50/30 border-teal-100 hover:bg-teal-50/60"
                    onClick={() => setActivePfa('listen')}
                  />
                  <PfaCard 
                    title="3. LINK (เชื่อมโยงช่วยเหลือ)"
                    subtitle="ช่วยเหลือความจำเป็นพื้นฐาน เชื่อมสายใยและพึ่งแพทย์ผู้เชี่ยวชาญ"
                    badge="ส่งต่อสายสัมพันธ์"
                    icon={<Link2 className="w-6 h-6 text-indigo-600" />}
                    color="bg-indigo-50/40 border-indigo-100 hover:bg-indigo-50/80"
                    onClick={() => setActivePfa('link')}
                  />
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 min-h-[480px] flex flex-col justify-between"
              >
                <button 
                  onClick={() => setActivePfa('none')}
                  className="self-start text-slate-400 hover:text-indigo-650 mb-6 flex items-center gap-1.5 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> กลับไปหน้าเมนู 3ป. (Look Listen Link)
                </button>

                <div className="flex-1 flex flex-col justify-between">
                  {activePfa === 'look' && <LookSection />}
                  {activePfa === 'listen' && <ListenSection />}
                  {activePfa === 'link' && <LinkSection />}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ====================================
   DBT Sub-Components
   ==================================== */

function TemperatureSkill() {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  return (
    <div className="flex-1 flex flex-col items-center text-center space-y-6">
      <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center animate-pulse">
        <Waves className="w-10 h-10 text-blue-600" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">น้ำเย็นจัดชูหัวใจ (Temperature TIPP)</h3>
        <p className="text-slate-500 text-xs font-sans leading-relaxed">
          ใช้ผ้าน้ำเย็นจัดประคบรอบดวงตากลางแก้ม ค่อยๆ กลั้นหายใจล้มหน้าลงไป 30 วินาที เพื่อกระตุ้นระบบประสาทเวกัส (Vagus Nerve) ร่างกายจะหดระบบเผาผลาญลงฉับพลัน ดึงอัตราเต้นหัวใจกลับสู่ความสงบทันทีค่ะ!
        </p>
      </div>
      
      <div className="text-6xl font-mono font-black text-blue-600 my-4 bg-blue-50/50 px-8 py-3 rounded-3xl tracking-tight">
        00:{timeLeft.toString().padStart(2, '0')}
      </div>

      <button 
        type="button"
        onClick={() => { if (timeLeft === 0) setTimeLeft(30); setIsActive(!isActive); }}
        className={cn(
          "w-full py-4 rounded-2xl font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer",
          isActive 
            ? "bg-rose-50 text-rose-600 border border-rose-100" 
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100"
        )}
      >
        {isActive ? '⏹️ หยุดการนับเวลา' : timeLeft === 0 ? '🔄 เริ่มลุยรอบใหม่' : '⏱️ เริ่มจับเวลานำทางสติ (30 วินาที)'}
      </button>
    </div>
  );
}

function ExerciseSkill() {
  return (
    <div className="flex-1 flex flex-col items-center text-center space-y-5">
      <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center">
        <Dumbbell className="w-10 h-10 text-amber-700" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">ระบายเคมีความกังวลออก (Intense Exercise)</h3>
        <p className="text-slate-500 text-xs font-sans leading-relaxed">
          ความตึงเครียดบางทีคือโมเลกุลพลังงานล้นเหลือที่ติดขัดในกล้ามเนื้อ ลองลุกขึ้นลุยกิจกรรมเหล่านี้อย่างฉับพลันเป็นเวลา 60 วินาทีกระตุ้นเคมีสมองเชิงบวกกันค่ะ!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 w-full">
        <ExerciseItem label="กระโดดตบ (Jumping Jacks) 🤸" />
        <ExerciseItem label="วิ่งย่ำเท้าสูง (High Knees) 🏃" />
        <ExerciseItem label="วิดพื้นยืดหลัง (Push Ups) 💪" />
        <ExerciseItem label="สควอทเบิร์นตูด (Squats) 🧘" />
      </div>

      <div className="p-3 bg-amber-50/50 text-amber-800 text-[10px]/relaxed font-sans font-bold border border-amber-100/50 rounded-2xl w-full">
        💡 เป้าหมาย: เร่งจังหวะเต้นหัวใจสักชั่วครู่เพื่อเปลี่ยนกลไกฮอร์โมน คัดกรองและสลัดความตื่นตระหนกดิ่งดิ่งให้ออกไปจากอารมณ์วิกฤต
      </div>
    </div>
  );
}

function GroundingSkill() {
  const [step, setStep] = useState(0);
  const groundingSteps = [
    { label: '5 สิ่งที่คุณ "มองเห็น" ซ้าย-ขวา 👀', icon: <Eye className="w-6 h-6 text-indigo-600" />, prompt: 'เช่น แสงไฟ, ต้นไม้เขียว, ปากกา, หน้าต่าง...' },
    { label: '4 สิ่งที่คุณ "สัมผัส" รายรอบตัว 🖐️', icon: <Hand className="w-6 h-6 text-indigo-600" />, prompt: 'เช่น เสื้อยืดอุ่น, เท้าเหยียบพรม, ลมพัดเข้าคอ...' },
    { label: '3 สิ่งที่คุณ "ได้ยิน" กังวาน 👂', icon: <Ear className="w-6 h-6 text-indigo-600" />, prompt: 'เช่น เสียงแผงพัดลม, เสียงแตรรุ่นนอกอาคาร...' },
    { label: '2 สิ่งที่คุณ "ได้กลิ่น" ทั่วบริเวณ 👃', icon: <Fingerprint className="w-6 h-6 text-indigo-600" />, prompt: 'ลองหยุดหายใจยาวดมกลิ่นกระดาษ หรืออากาศรอบกาย...' },
    { label: '1 สิ่งที่คุณ "ประทับใจรสชาติ" 👅', icon: <RotateCcw className="w-6 h-6 text-indigo-600" />, prompt: 'นึกย้อนถึงมวลน้ำเย็นฉับ หรือความเผ็ดซ่าคำล่าสุด...' }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-between min-h-[360px]">
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">เทคนิคตรึงสติ 5-4-3-2-1 Grounding</h3>
        <p className="text-slate-500 text-xs font-sans leading-relaxed">
          หากสมองกระเจิง ฟุ้งขึ้นอย่างควบคุมไม่ได้ ดึงมันกลับมาจากห้วงความคิดลงสู่สิ่งเร้าตรงหน้า
        </p>
      </div>

      <div className="w-full relative py-6">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            className="flex flex-col items-center text-center space-y-4"
          >
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center">
              {groundingSteps[step].icon}
            </div>
            <div className="space-y-1">
              <div className="text-xl font-extrabold text-indigo-950 tracking-tight">{groundingSteps[step].label}</div>
              <p className="text-slate-500 font-sans text-xs italic">{groundingSteps[step].prompt}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full space-y-4">
        <div className="flex gap-1.5 w-full">
          {groundingSteps.map((_, i) => (
            <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-all", i <= step ? "bg-indigo-600" : "bg-slate-100")} />
          ))}
        </div>

        <button 
          type="button"
          onClick={() => setStep((step + 1) % 5)}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-800 text-white rounded-2xl font-black text-xs shadow-md shadow-indigo-100 cursor-pointer transition-all"
        >
          {step === 4 ? '🔄 วนลูปสติเริ่มต้นรอบใหม่' : '👉 ตระหนักรับรู้ขั้นต่อไป'}
        </button>
      </div>
    </div>
  );
}

/* ====================================
   PFA (3 Action Principles) Sub-Components
   ==================================== */

// 1. LOOK (สอดส่องมองหา)
function LookSection() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 flex flex-col justify-between space-y-4 font-sans text-slate-800">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-sky-50 rounded-xl text-sky-600 block">👀</span>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">LOOK (สอดส่องมองหาเพื่อความปลอดภัย)</h3>
        </div>
        <p className="text-slate-550 text-xs leading-relaxed">
          ยึดความสงบและการสังเกตการณ์เป็นหลักก่อนเข้าช่วยเหลือ สังเกตโดยผ่านเช็คลิสต์มาตรฐาน 3 เงื่อนไขหลัก:
        </p>
      </div>

      <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
        {/* Category 1: Safety */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <p className="font-extrabold text-[10px] uppercase text-sky-700 tracking-wider">🔒 1. ประเมินความรอบคอบปลอดภัยบริบทรอบข้าง</p>
          <div className="space-y-1.5">
            <CheckItem 
              id="look-safe-1" 
              checked={checked['look-safe-1']} 
              onToggle={toggleCheck}
              label="บริเวณจุดเผชิญภัยไม่มีกระแสสะกิดอันตราย หรือสิ่งปะทะทำร้ายซ้ำสอง" 
            />
            <CheckItem 
              id="look-safe-2" 
              checked={checked['look-safe-2']} 
              onToggle={toggleCheck}
              label="สภาพอากาศ ยานพาหนะ หรือสิ่งของมั่นคงและไม่มีความเสี่ยงต่อชีวิต" 
            />
          </div>
        </div>

        {/* Category 2: Stress responses */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <p className="font-extrabold text-[10px] uppercase text-amber-600 tracking-wider">😟 2. สังเกตปฏิกิริยาอาการลบสะเทือนขวัญ</p>
          <div className="space-y-1.5">
            <CheckItem 
              id="look-stress-1" 
              checked={checked['look-stress-1']} 
              onToggle={toggleCheck}
              label="สังเกตผู้ที่ นิ่งงัน ช็อก ตัวแข็ง ตื่นตระหนก ร้องไห้ฟูมฟาย หรือถอนใจแยกตัวเดี่ยว" 
            />
            <CheckItem 
              id="look-stress-2" 
              checked={checked['look-stress-2']} 
              onToggle={toggleCheck}
              label="สังเกตสัญญาณตอบรับทางกาย เช่น ตัวสั่นงันงก มือเกร็ง หายใจหอบถี่ ตาลอย" 
            />
          </div>
        </div>

        {/* Category 3: Urgent / Vulnerable */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <p className="font-extrabold text-[10px] uppercase text-emerald-600 tracking-wider">🌟 3. พิจารณาผู้ใช้ความช่วยเหลือเร่งด่วน</p>
          <div className="space-y-1.5">
            <CheckItem 
              id="look-vulnerable-1" 
              checked={checked['look-vulnerable-1']} 
              onToggle={toggleCheck}
              label="เด็กเล็ก ผู้หญิงมีครรภ์ หรือผู้ป่วยทางอากัปกิริยาที่พึ่งประสงค์ช่วยเหลือตนเองลำบาก" 
            />
            <CheckItem 
              id="look-vulnerable-2" 
              checked={checked['look-vulnerable-2']} 
              onToggle={toggleCheck}
              label="ผู้ที่มีอาการแพนิกหนักหน่วง มีความเสี่ยงต่อการพยายามทำร้ายตนเอง" 
            />
          </div>
        </div>
      </div>

      <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 flex items-start gap-2.5 text-[10px]/relaxed text-sky-850">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <span className="font-medium">
          <strong>คำแนะนำสำคัญ:</strong> หากรอบตัวไม่ปลอดภัยอย่างชัดเจน <strong>ห้ามลุยล้นตัวเข้าไปเองเด็ดขาด!</strong> ตั้งสติประคับให้ตนอุ่นใจก่อน แล้วประสานแจ้งหน่วยช่วยเหลือสากลค่ะ
        </span>
      </div>
    </div>
  );
}

// 2. LISTEN (ใส่ใจรับฟัง)
function ListenSection() {
  const [breathingStatus, setBreathingStatus] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (breathingStatus === 'idle') {
      setProgress(0);
      return;
    }

    let interval: any;
    let secondsElapsed = 0;
    const duration = 4; // 4 seconds per phase

    interval = setInterval(() => {
      secondsElapsed += 0.1;
      const ratio = Math.min((secondsElapsed / duration) * 100, 100);
      setProgress(ratio);

      if (secondsElapsed >= duration) {
        setBreathingStatus(current => {
          if (current === 'inhale') return 'hold';
          if (current === 'hold') return 'exhale';
          return 'inhale';
        });
        secondsElapsed = 0;
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [breathingStatus]);

  const toggleBreathing = () => {
    if (breathingStatus === 'idle') {
      setBreathingStatus('inhale');
    } else {
      setBreathingStatus('idle');
    }
  };

  const getPhaseText = () => {
    if (breathingStatus === 'inhale') return 'หายใจเข้าช้าๆ ลึกๆ... 🧘';
    if (breathingStatus === 'hold') return 'กลั้นหายใจนิ่งๆ นิ่งอุ่น... 🛡️';
    if (breathingStatus === 'exhale') return 'ปล่อยลมหายใจออกยาวๆ อิ่มๆ... 🌊';
    return 'ทดลองจำลองควบคุมแพนิก';
  };

  return (
    <div className="flex-1 flex flex-col justify-between space-y-4 font-sans text-slate-800">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-teal-50 rounded-xl text-teal-600 block">👂</span>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">LISTEN (สร้างความเคารพ และรับฟังอย่างใส่ใจ)</h3>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed">
          เข้าหากลุ่มเครือข่ายด้วยน้ำเสียงสุภาพ แนะนำตัว แซงแซงรับความประสงค์อย่างไม่ตัดสิน เพื่อสร้างบรรยากาศอุ่นใจ:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
        {/* Protocol */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2.5">
          <p className="font-extrabold text-[10px] uppercase text-teal-800 tracking-wider">📋 กฎทองในการรับฟัง (Active Listening Protocol)</p>
          <ul className="space-y-1.5 font-medium text-slate-655 text-[11px] list-disc list-inside leading-relaxed">
            <li><strong>ให้เกียรติสูงสุด:</strong> นั่งในระดับสายตาเดียวกัน ไม่ขัด คลายกังวล</li>
            <li><strong>ตั้งมั่นไม่ตัดสิน:</strong> ไม่พูดว่า "คิดมากไป" หรือ "อย่าเศร้าเลย" แค่นั่งกุมมือประคองเคียงข้าง</li>
            <li><strong>ขจัดความตระหนก:</strong> หากผู้ประสบเหตุร้องไห้หนัก ชวนกำหนดการหายใจด้วยกล่องช่วย</li>
          </ul>
        </div>

        {/* Interactive Breathing Console */}
        <div className="p-3.5 bg-teal-50/50 rounded-2xl border border-teal-100 flex flex-col items-center justify-center text-center space-y-3 relative">
          <p className="font-extrabold text-[10px] uppercase text-teal-800 tracking-wider">💨 อุปกรณ์กู้สติลดแพนิกฉุกเฉิน (4-4-4 Box Breathing)</p>
          
          <div className="relative flex items-center justify-center">
            {/* Animated breathing bubble */}
            <motion.div
              animate={{
                scale: breathingStatus === 'inhale' ? 1.25 : breathingStatus === 'hold' ? 1.25 : 1.0,
              }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md transition-colors",
                breathingStatus === 'inhale' && "bg-teal-500 shadow-teal-100",
                breathingStatus === 'hold' && "bg-amber-500 shadow-amber-100 animate-pulse",
                breathingStatus === 'exhale' && "bg-indigo-500 shadow-indigo-100",
                breathingStatus === 'idle' && "bg-teal-600"
              )}
            >
              <Wind className="w-5 h-5" />
            </motion.div>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-black text-teal-950 uppercase tracking-tight">{getPhaseText()}</p>
            {breathingStatus !== 'idle' && (
              <div className="w-24 h-1 bg-slate-200 mx-auto rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all duration-100" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleBreathing}
            className="px-4 py-1.5 bg-white border border-teal-200 hover:bg-teal-50 font-black text-[9px] uppercase tracking-wider text-teal-800 rounded-full active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            {breathingStatus === 'idle' ? '▶️ พากลั้นลมปรับสติร่วมกัน' : '⏹️ หยุดควบคุมลมหายใจ'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. LINK (เชื่อมโยงต่อเนื่อง)
function LinkSection() {
  return (
    <div className="flex-1 flex flex-col justify-between space-y-4 font-sans text-slate-800">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-50 rounded-xl text-indigo-600 block">🔗</span>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">LINK (ติดสอยสายช่วย และประสานงานกูรูการแพทย์)</h3>
        </div>
        <p className="text-slate-550 text-xs leading-relaxed">
          ช่วยเหลือสิ่งสะพรั่งเบื้องต้น และเชื่อมโยงผู้ประสบภัยใจดิ่งเข้าส่งต่อเพื่อคุ้มครองความปลอดภัยอย่างถูกต้อง:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Support 1 */}
        <div className="p-3 bg-slate-50 hover:bg-indigo-50/10 border border-slate-100 hover:border-indigo-100 rounded-2xl text-left space-y-2 transition-all">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🍲</span>
            <p className="font-extrabold text-[10px] text-indigo-900 uppercase tracking-wider">ความต้องการพื้นฐาน</p>
          </div>
          <p className="text-[10px]/relaxed text-slate-550 font-medium">ช่วยให้ผู้ประสบภัยได้รับน้ำ ดื่มนม อาหาร ยาประจำตัว และข้อมูลสถานการณ์ที่ถูกต้อง ครบถ้วน ทันเหตุการณ์</p>
        </div>

        {/* Support 2 */}
        <div className="p-3 bg-slate-50 hover:bg-indigo-50/10 border border-slate-100 hover:border-indigo-100 rounded-2xl text-left space-y-2 transition-all">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">👨‍👩‍👦</span>
            <p className="font-extrabold text-[10px] text-indigo-900 uppercase tracking-wider">ติดต่อครอบครัว</p>
          </div>
          <p className="text-[10px]/relaxed text-slate-550 font-medium">ช่วยประสานติดต่อไปหาคนรัก พ่อแม่ หรือเพื่อนสนิทในเครือข่ายความมั่นคงทางสังคม เพื่อบรรเทาจิตใจโดดเดี่ยวเหงาใจ</p>
        </div>

        {/* Support 3 */}
        <div className="p-3 bg-slate-50 hover:bg-indigo-50/10 border border-slate-100 hover:border-indigo-100 rounded-2xl text-left space-y-2 transition-all">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🏥</span>
            <p className="font-extrabold text-[10px] text-indigo-900 uppercase tracking-wider">ส่งเสริมผู้เชี่ยวชาญ</p>
          </div>
          <p className="text-[10px]/relaxed text-slate-550 font-medium">เมื่อมีอาการหูแว่ว ประสาทภาพลวงตา พยายามทำร้ายตัว หรือลนลานคุมสติหมดสิ้น ต้องส่งขอบเขตแพทย์วิกฤตทันที</p>
        </div>
      </div>

      {/* Hotline Buttons */}
      <div className="space-y-2">
        <p className="font-black text-[9px] text-indigo-650 uppercase tracking-widest block text-center">☎️ เครือข่ายโทรฉุกเฉินสากลช่วยเหลือใจกูแพทย์เด่น</p>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-xs">
          <a
            href="tel:1323"
            className="flex items-center justify-center gap-2 py-3 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-bold rounded-xl border border-indigo-100 active:scale-98 transition-all text-center"
          >
            <PhoneCall className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="text-left leading-none">
              <span className="block text-[8px] text-indigo-500 font-extrabold uppercase">สายด่วนสติสุขภาพจิต</span>
              <span className="text-[11px] font-black">1323 (โทรฟรี 24 ชม.)</span>
            </div>
          </a>
          <a
            href="tel:1669"
            className="flex items-center justify-center gap-2 py-3 px-3 bg-rose-50 hover:bg-rose-100 text-rose-950 font-bold rounded-xl border border-rose-100 active:scale-98 transition-all text-center"
          >
            <PhoneCall className="w-4 h-4 text-rose-600 shrink-0" />
            <div className="text-left leading-none">
              <span className="block text-[8px] text-rose-500 font-extrabold uppercase">กู้ชีพและพยาบาลวิกฤต</span>
              <span className="text-[11px] font-black">1669 (แจ้งเหตุฉุกเฉิน)</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

/* Helper small sub-components */

function SkillCard({ id, title, desc, icon, color, onClick }: any) {
  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-5 rounded-[2.2rem] text-left flex items-start gap-4 border transition-all cursor-pointer", 
        color
      )}
    >
      <div className="bg-white p-3.5 rounded-2xl shadow-sm shrink-0 border border-slate-100">
        {icon}
      </div>
      <div className="space-y-0.5">
        <h4 className="font-extrabold text-slate-900 text-base leading-snug">{title}</h4>
        <p className="text-slate-500 font-sans text-xs leading-relaxed">{desc}</p>
      </div>
    </motion.button>
  );
}

function PfaCard({ title, subtitle, badge, icon, color, onClick }: any) {
  return (
    <motion.button
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "p-4 rounded-[2rem] text-left flex items-center justify-between gap-4 border transition-all cursor-pointer w-full",
        color
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="bg-white p-3 rounded-2xl shadow-sm shrink-0 border border-slate-150/50">
          {icon}
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-black text-slate-900 text-sm tracking-tight leading-none">{title}</h4>
            <span className="text-[8px] font-extrabold uppercase bg-white/60 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/40">
              {badge}
            </span>
          </div>
          <p className="text-slate-500 text-[10px] font-sans truncate pr-2">{subtitle}</p>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
    </motion.button>
  );
}

function ExerciseItem({ label }: { label: string }) {
  return (
    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-black text-slate-800 flex items-center justify-center text-center">
      {label}
    </div>
  );
}

interface CheckItemProps {
  id: string;
  checked: boolean;
  onToggle: (id: string) => void;
  label: string;
}

function CheckItem({ id, checked, onToggle, label }: CheckItemProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      className="flex items-start gap-2 text-left w-full cursor-pointer group"
    >
      <div className={cn(
        "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all",
        checked 
          ? "bg-slate-900 border-slate-900 text-white" 
          : "border-slate-300 bg-white group-hover:border-slate-400"
      )}>
        {checked && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
      </div>
      <span className={cn(
        "text-[10.5px]/tight font-medium font-sans transition-all",
        checked ? "text-slate-400 line-through" : "text-slate-700"
      )}>
        {label}
      </span>
    </button>
  );
}
