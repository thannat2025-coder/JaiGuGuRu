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
import { toast } from 'react-hot-toast';

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

class AmbientSynth {
  private ctx: AudioContext | null = null;
  private primaryOSC: OscillatorNode | null = null;
  private secondaryOSC: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private filterLFO: OscillatorNode | null = null;
  private filterLFOGain: GainNode | null = null;
  private gainNode: GainNode | null = null;
  private noiseNode: ScriptProcessorNode | null = null;
  private noiseGain: GainNode | null = null;
  private active = false;

  start() {
    if (this.active) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.active = true;

      // Master Gain
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      // Low drone (Fundamental C2 = 65.41 Hz)
      this.primaryOSC = this.ctx.createOscillator();
      this.primaryOSC.type = 'triangle';
      this.primaryOSC.frequency.setValueAtTime(65.41, this.ctx.currentTime);

      // Perfect fifth drone (G2 = 97.99 Hz)
      this.secondaryOSC = this.ctx.createOscillator();
      this.secondaryOSC.type = 'sine';
      this.secondaryOSC.frequency.setValueAtTime(97.99, this.ctx.currentTime);

      // Deep Lowpass filter
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(180, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(4, this.ctx.currentTime);

      // LFO to sweep filter cutoff (making the sound "breathe" slowly)
      this.filterLFO = this.ctx.createOscillator();
      this.filterLFO.type = 'sine';
      this.filterLFO.frequency.setValueAtTime(0.08, this.ctx.currentTime); // slow: 12.5 seconds per wave

      this.filterLFOGain = this.ctx.createGain();
      this.filterLFOGain.gain.setValueAtTime(80, this.ctx.currentTime); // sweep filter frequency

      // Bind LFO -> Filter Cutoff
      this.filterLFO.connect(this.filterLFOGain);
      this.filterLFOGain.connect(this.filter.frequency);

      // Connect drone oscillators -> filter -> master gain
      this.primaryOSC.connect(this.filter);
      this.secondaryOSC.connect(this.filter);
      this.filter.connect(this.gainNode);

      // Synthesize a soothing "Wind/Breeze" sound (Brownian noise)
      if (this.ctx.createScriptProcessor) {
        let lastOut = 0.0;
        this.noiseNode = this.ctx.createScriptProcessor(4096, 0, 1);
        this.noiseNode.onaudioprocess = (e) => {
          const output = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < output.length; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 1.2;
          }
        };

        const windFilter = this.ctx.createBiquadFilter();
        windFilter.type = 'bandpass';
        windFilter.frequency.setValueAtTime(350, this.ctx.currentTime);
        windFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

        const windLFO = this.ctx.createOscillator();
        windLFO.type = 'sine';
        windLFO.frequency.setValueAtTime(0.04, this.ctx.currentTime); // 25s wave

        const windLFOGain = this.ctx.createGain();
        windLFOGain.gain.setValueAtTime(140, this.ctx.currentTime);

        windLFO.connect(windLFOGain);
        windLFOGain.connect(windFilter.frequency);

        this.noiseGain = this.ctx.createGain();
        this.noiseGain.gain.setValueAtTime(0.03, this.ctx.currentTime); // soft wind volume

        this.noiseNode.connect(windFilter);
        windFilter.connect(this.noiseGain);
        this.noiseGain.connect(this.gainNode);

        windLFO.start();
      }

      this.primaryOSC.start();
      this.secondaryOSC.start();
      this.filterLFO.start();

      // Smooth rise in music volume over 3 seconds
      this.gainNode.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 3.0);
    } catch (e) {
      console.warn("Speech audio initialization blocked or unsupported", e);
    }
  }

  setVolume(vol: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.linearRampToValueAtTime(vol * 0.18, this.ctx.currentTime + 0.4);
    }
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    if (this.gainNode && this.ctx) {
      try {
        const cur = this.ctx.currentTime;
        this.gainNode.gain.cancelScheduledValues(cur);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, cur);
        this.gainNode.gain.linearRampToValueAtTime(0.0, cur + 1.0);
        
        setTimeout(() => {
          try {
            this.primaryOSC?.stop();
            this.secondaryOSC?.stop();
            this.filterLFO?.stop();
            if (this.noiseNode) {
              this.noiseNode.disconnect();
            }
            this.ctx?.close();
          } catch(err) {}
        }, 1100);
      } catch (e) {
        this.ctx?.close();
      }
    }
  }
}

let ambientSynthInstance: AmbientSynth | null = null;
function getAmbientSynth(): AmbientSynth {
  if (!ambientSynthInstance) {
    ambientSynthInstance = new AmbientSynth();
  }
  return ambientSynthInstance;
}

const STEP_SENTENCES: Record<1 | 2 | 3 | 4, string[]> = {
  1: [
    "เชิญชวนหาพื้นที่หรือท่าทางที่สบายที่สุด",
    "ไม่ว่าจะเป็นการนั่งบนเก้าอี้โดยให้ฝ่าเท้าวางราบกับพื้น หรือนอนราบบนเบาะ",
    "ให้หลังตรงผ่อนคลาย ไม่เกร็ง",
    "เมื่อพร้อมแล้ว ค่อยๆ หลับตาลง หรือทอดสายตามองต่ำด้านหน้าอย่างผ่อนคลาย",
    "นำความรู้สึกทั้งหมดมาจดจ่อที่ลมหายใจ",
    "สังเกตสัมผัสของลมหายใจเข้า... และลมหายใจออก...",
    "ไม่ต้องพยายามเปลี่ยนแปลงจังหวะการหายใจ เพียงแค่รับรู้ว่าตอนนี้ร่างกายกำลังหายใจ",
    "หากมีความคิดเรื่องราวต่างๆ หรือเสียงรอบข้างแทรกเข้ามา ให้รับรู้ว่ามีความคิดเกิดขึ้น",
    "แล้วค่อยๆ นำความสนใจกลับมาที่ลมหายใจอย่างนุ่มนวล โดยไม่ต้องตำหนิตัวเอง"
  ],
  2: [
    "ตอนนี้ ค่อยๆ เลื่อนความสนใจและความรู้สึก ลงไปที่เท้าทั้งสองข้าง",
    "สังเกตการสัมผัสของฝ่าเท้ากับพื้นหรือเบาะ ความรู้สึกอุ่น เย็น หรืออาจจะไม่มีความรู้สึกใดๆ ก็รับรู้ได้ตามจริง",
    "ลองจินตนาการว่าเรากำลังส่งลมหายใจผ่านลำตัว ลงไปจรดที่ปลายเท้า",
    "จากนั้น เลื่อนความสนใจขึ้นมาที่ข้อเท้า น่อง หัวเข่า และต้นขา",
    "สังเกตดูว่ากล้ามเนื้อบริเวณนี้มีความตึงเครียดหรือผ่อนคลายอย่างไร",
    "เลื่อนความรู้สึกขึ้นมาที่อุ้งเชิงกราน หน้าท้อง และแผ่นหลังส่วนล่าง",
    "สังเกตการขยายตัวของหน้าท้องเมื่อหายใจเข้า... และการยุบตัวลงเมื่อหายใจออก...",
    "หากพบความตึงเครียดบริเวณท้องหรือหลัง ให้หายใจออกแล้วปล่อยให้กล้ามเนื้อบริเวณนั้นอ่อนยวบและผ่อนคลายลง",
    "เคลื่อนความสนใจขึ้นมาที่หน้าอก หัวไหล่ และแขนทั้งสองข้าง",
    "ปล่อยให้หัวไหล่ตกลงตามธรรมชาติ คลายความเกร็ง ปล่อยความรู้สึกไปจนถึงฝ่ามือและปลายนิ้ว",
    "เลื่อนขึ้นมาที่ลำคอ ขากรรไกร ริมฝีปาก รอบดวงตา หน้าผาก และศีรษะ",
    "สังเกตดูว่าใบหน้าของเรากำลังเผลอเกร็งอยู่หรือไม่ ค่อยๆ คลายกล้ามเนื้อใบหน้า ปล่อยให้หน้าผากเรียบตึงและผ่อนคลาย"
  ],
  3: [
    "ตอนนี้ ให้เปิดรับรู้ความรู้สึกของร่างกายทั้งหมดในขณะนี้ ให้ร่างกายได้พักอยู่ในความนิ่ง",
    "สังเกตดูว่า ณ ขณะนี้... สภาวะภายในของเราเป็นอย่างไร มีความรู้สึกทางกายแบบไหน",
    "อารมณ์ใดกำลังปรากฏอยู่ หรือมีความคิดอะไรเกิดขึ้นในใจ",
    "โปรดจำไว้ว่า จุดประสงค์ของการฝึกนี้ไม่ใช่การบังคับให้ใจสงบ หรือผลักไสความรู้สึกอึดอัดใดๆ ออกไป",
    "แต่เป็นการอนุญาตให้ทุกสภาวะที่เกิดขึ้นในตอนนี้ ได้ดำรงอยู่ตรงนั้นอย่างที่มันเป็น",
    "เพียงเฝ้าดู ยอมรับ และสังเกตเห็นด้วยความเข้าใจ"
  ],
  4: [
    "เมื่อพร้อมแล้ว ค่อยๆ นำความรู้สึกกลับมาที่การหายใจเข้าและออกลึกๆ อีกครั้ง",
    "ค่อยๆ ขยับปลายนิ้วมือและนิ้วเท้า ยืดเหยียดร่างกายเบาๆ",
    "และเมื่อรู้สึกว่าร่างกายและจิตใจพร้อมแล้ว ค่อยๆ ลืมตาขึ้น",
    "นำความรู้สึกที่ผ่อนคลายและรู้เท่าทันสภาวะภายในนี้ ไปใช้ในชีวิตประจำวัน"
  ]
};

function MeditationExercise() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isActive, setIsActive] = useState(false);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [audioActive, setAudioActive] = useState(true);
  const [audioVolume, setAudioVolume] = useState(0.3);

  const getStepTitle = (s: number) => {
    switch(s) {
      case 1: return 'บทนำ (การตั้งหลักและการหายใจ)';
      case 2: return 'การสํารวจร่างกาย (Body Scan)';
      case 3: return 'การสังเกตสภาวะภายใน (Observing Internal State)';
      case 4: return 'บทสรุป (การกลับคืนสู่ปัจจุบัน)';
      default: return '';
    }
  };

  const getStepConcept = (s: number) => {
    switch(s) {
      case 1: return 'ตั้งจิตใจให้อยู่กับปัจจุบันโดยไม่ตัดสิน สังเกตและผสานลมหายใจธรรมชาติตามจริง';
      case 2: return 'สแกนคลึงสำรวจความตึงเกร็งและปลดประโลมกล้ามเนื้อกายทีละส่วนอย่างอ่อนโยน';
      case 3: return 'เปิดกว้างยอมรับทุกอารมณ์ ความรู้สึก อึดอัดแน่นอก โดยไม่ฝืน ดื้อรั้น หรือต่อต้านบิดเบือน';
      case 4: return 'ตื่นรู้ บิดกาย ปลุกพลังความสดชื่นมั่นคงและสติคืนสู่โลกปัจจุบันอย่างอุ่นใจ';
      default: return '';
    }
  };

  const sentences = STEP_SENTENCES[step];

  // Auto progression of sentences
  useEffect(() => {
    let timer: any;
    if (isActive) {
      timer = setInterval(() => {
        setSentenceIndex((prev) => {
          if (prev < sentences.length - 1) {
            return prev + 1;
          } else {
            return prev;
          }
        });
      }, 7500); // peaceful progression every 7.5 seconds
    }
    return () => clearInterval(timer);
  }, [isActive, sentences.length, step]);

  // Ambient sound synthesizer engine lifecycle
  useEffect(() => {
    const synth = getAmbientSynth();
    if (isActive && audioActive) {
      synth.start();
      synth.setVolume(audioVolume);
    } else {
      synth.stop();
    }
    return () => {
      synth.stop();
    };
  }, [isActive, audioActive]);

  useEffect(() => {
    if (isActive && audioActive) {
      getAmbientSynth().setVolume(audioVolume);
    }
  }, [audioVolume, isActive, audioActive]);

  const handleStart = () => {
    setIsActive(true);
    setStep(1);
    setSentenceIndex(0);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as any);
      setSentenceIndex(0);
    } else {
      setIsActive(false);
      setStep(1);
      setSentenceIndex(0);
      toast.success('การฝึกเจริญสติวิถีบำบัด MBCT สำเร็จลุล่วง จิตระลึกใสพร้อมเผชิญวันใหม่อย่างสุขใจค่ะ 💖');
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as any);
      setSentenceIndex(0);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center space-y-6">
      {!isActive ? (
        <div className="w-full space-y-6">
          <div className="p-6 bg-emerald-50/80 border border-emerald-100 rounded-[2rem] text-left space-y-3">
            <h4 className="font-black text-sm text-emerald-950 flex items-center gap-2">
              🍃 สติบำบัดวิถีธรรม MBCT (Mindfulness-Based Cognitive Therapy)
            </h4>
            <p className="text-xs text-emerald-900/80 leading-relaxed">
              การฝึกให้จิตใจอยู่กับปัจจุบันโดยไม่ตัดสิน เมื่อจิตหลุดไปคิด ให้สังเกตเห็นแล้วดึงกลับมา เพื่อช่วยให้เท่าทันความคิด/อารมณ์ และลดปฏิกิริยาตอบสนองอัตโนมัติ นำพากายและใจของท่านกลับคืนสู่ปัจจุบันขณะอันแสนนิ่งเย็น
            </p>
            <div className="text-[11px] text-emerald-800 font-bold bg-white/60 p-3 rounded-xl border border-emerald-100">
              💡 <span className="underline">หลักการสำคัญ</span>: ยอมรับสภาวะจิตใจตามจริง ไม่ฝืนเค้น สบายตัว ปราศจากความพินิจร้ายหรืออคติใดๆ
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left">
            <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 space-y-1">
              <span className="text-xs font-black text-emerald-800 uppercase block">🟢 ผ่อนคลายทางสายตา (Green Glow)</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">ข้อความนำเดินเป็นจังหวะเงียบ ค่อยๆ ลอยเปลี่ยนผ่านคล้ายลมพัดเบาใจ โดยปราศจากเสียงพูดเสียงเตือนที่แหลมคมยุ่งเหยิง</p>
            </div>
            <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 space-y-1">
              <span className="text-xs font-black text-emerald-800 uppercase block">🎵 คลื่นธรรมชาติโอบอุ้ม (Drone Sound)</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">คลื่นเสียงความถี่ต่ำออร์แกนิกและลม Brownian สังเคราะห์สด เพื่อพยุงระบบหายใจและสลายกระแสวิตกกังวลสะสม</p>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <label className="text-xs font-black uppercase tracking-[1.5px] text-slate-400 block">ระดับเสียงดนตรีบำบัดโอบอุ้ม</label>
            <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950">สถานะ: {audioActive ? 'เปิดดนตรีคลื่นบำบัด' : 'ปิดเสียงคลื่น'}</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={audioVolume}
                  onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                  className="w-20 accent-emerald-600 bg-emerald-200 h-1 rounded-lg cursor-pointer"
                  disabled={!audioActive}
                />
                <button
                  onClick={() => setAudioActive(!audioActive)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    audioActive ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  )}
                >
                  {audioActive ? 'ปิดเสียง' : 'เปิดเสียง'}
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleStart}
            className="w-full py-4.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current animate-pulse" /> เริ่มต้นเข้าสู่สัมผัสธรรม MBCT Flow
          </button>
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col items-center justify-between space-y-6 bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950 p-6 md:p-8 rounded-[3rem] border border-emerald-800/40 relative overflow-hidden shadow-2xl min-h-[460px] text-emerald-50">
          
          {/* Ambient Wind Visualizer Lines */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
            <motion.div
              animate={{
                x: [-180, 500],
                opacity: [0, 0.4, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute h-[1.5px] w-64 bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent top-12 left-0"
            />
            <motion.div
              animate={{
                x: [-220, 500],
                opacity: [0, 0.3, 0]
              }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear", delay: 3 }}
              className="absolute h-[1px] w-80 bg-gradient-to-r from-transparent via-teal-300/30 to-transparent bottom-24 left-0"
            />
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button 
              onClick={() => setAudioActive(!audioActive)}
              className={cn(
                "px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-extrabold border shadow-sm",
                audioActive 
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" 
                  : "bg-emerald-950/40 border-emerald-800/30 text-emerald-500"
              )}
              title={audioActive ? "ปิดเสียงดนตรีบำบัด" : "เปิดเสียงดนตรีบำบัด"}
            >
              <Volume2 className={cn("w-3.5 h-3.5", audioActive && "animate-pulse")} />
              <span>{audioActive ? 'เปิดสุนทรียภาพดนตรี': 'ปิดเสียงธรรมชาติ'}</span>
            </button>
            
            {audioActive && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={audioVolume}
                onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                className="w-14 accent-emerald-400 bg-emerald-900/40 h-1 rounded-lg cursor-pointer"
                title="ปรับระดับเสียงดนตรีบำบัด"
              />
            )}
          </div>

          {/* Header Progress Indicators */}
          <div className="w-full space-y-2 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-300">{getStepTitle(step)}</span>
              <span className="font-mono text-emerald-400 font-bold">ขั้นตอน {step} จาก 4</span>
            </div>
            
            <div className="flex gap-1 bg-emerald-950/60 h-1.5 rounded-full overflow-hidden border border-emerald-900/30">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-full flex-1 transition-all duration-500", 
                    i <= step ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-emerald-950/40"
                  )} 
                />
              ))}
            </div>
          </div>

          {/* Beautiful pulsing organic breeze canvas */}
          <div className="relative flex items-center justify-center w-full min-h-[140px] my-2">
            {[1, 2, 3].map((idx) => (
              <motion.div
                key={idx}
                animate={{
                  scale: [1, 2.1, 1],
                  opacity: [0.12, 0, 0.12],
                  borderRadius: ["42% 58% 70% 30% / 45% 45% 55% 55%", "70% 30% 52% 48% / 60% 40% 60% 40%", "42% 58% 70% 30% / 45% 45% 55% 55%"]
                }}
                transition={{
                  duration: 8 + idx * 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute w-36 h-36 border border-emerald-400/20 bg-emerald-500/5 mix-blend-screen"
              />
            ))}
            
            <div className="text-center relative z-10 space-y-2 px-4">
              <motion.div
                animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex p-3 bg-emerald-950/60 text-emerald-300 rounded-full border border-emerald-800/50 shadow-inner"
              >
                {step === 1 && <Wind className="w-5 h-5 text-emerald-300 animate-pulse" />}
                {step === 2 && <Zap className="w-5 h-5 text-emerald-300" />}
                {step === 3 && <Target className="w-5 h-5 text-teal-300" />}
                {step === 4 && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
              </motion.div>
              <p className="text-[12px] font-black text-emerald-300 uppercase tracking-[1px]">{getStepTitle(step)}</p>
              <div className="flex items-center gap-1.5 justify-center text-[10px] text-emerald-200/55 font-bold uppercase">
                <span>สลัดความคิดรบกวน</span>
                <span>•</span>
                <span>ประโยคที่ {sentenceIndex + 1} / {sentences.length}</span>
              </div>
            </div>
          </div>

          {/* Progressive Wind-like Text Container with manual dot navigation */}
          <div className="bg-emerald-950/40 p-6 md:p-8 rounded-[2.5rem] w-full text-center min-h-[160px] flex flex-col justify-center border border-emerald-800/30 relative">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${step}-${sentenceIndex}`}
                initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="text-emerald-100 font-sans font-extrabold text-sm md:text-base leading-relaxed text-center px-2"
              >
                "{sentences[sentenceIndex]}"
              </motion.p>
            </AnimatePresence>

            {/* Quick manual navigation bullet indicators */}
            <div className="flex justify-center flex-wrap gap-1.5 mt-5">
              {sentences.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSentenceIndex(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300 cursor-pointer",
                    sentenceIndex === idx 
                      ? "bg-emerald-400 w-5" 
                      : "bg-emerald-800/50 hover:bg-emerald-700/40"
                  )}
                  title={`ไปยังท่อนที่ ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="w-full space-y-3.5 relative z-10">
            <div className="flex gap-3">
              <button 
                onClick={handlePrev}
                disabled={step === 1}
                className="flex-1 py-3.5 bg-emerald-900/30 border border-emerald-800/40 text-emerald-200 rounded-2xl text-xs font-black transition-all hover:bg-emerald-900/50 disabled:opacity-20 disabled:pointer-events-none active:scale-97 cursor-pointer"
              >
                ย้อนกลับ
              </button>

              <button 
                onClick={handleNext}
                className="flex-3 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl text-xs font-black transition-all hover:shadow-lg hover:shadow-emerald-950/40 active:scale-97 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{step === 4 ? 'เสร็จสิ้นครบกระบวนฝึก' : 'ขั้นถัดไป'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between px-2">
              <button 
                onClick={() => { setIsActive(false); setStep(1); setSentenceIndex(0); }}
                className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> ออกจากการนำฝึกชั่วคราว
              </button>

              <span className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-widest flex items-center gap-1">
                🍃 สติบำบัด MBCT • สลัดความคิด & ปล่อยวางความเครียด
              </span>
            </div>
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
