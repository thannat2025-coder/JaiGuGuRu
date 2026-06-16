import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { detectRisk, analyzeDistortions, getPsychoeducation } from '@/src/services/geminiService';
import { toast } from 'react-hot-toast';
import CrayonDrawing from '@/src/components/CrayonDrawing';
import { Quote } from 'lucide-react';

interface Entry {
  situation: string;
  thoughts: string;
  emotions: string;
  distortions: { type: string; descriptionTh: string }[];
  rationalResponse: string;
  summaryTh?: string;
  comfortTh?: string;
  crayonQuadrant?: 'high-positive' | 'high-negative' | 'low-negative' | 'low-positive';
}

export default function CBTDojo({ user, onEmergencyTrigger, onBackToHome }: { user: User, onEmergencyTrigger: () => void, onBackToHome?: () => void }) {
  const [mode, setMode] = useState<'diary' | 'ai'>('diary');
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [entry, setEntry] = useState<Entry>({
    situation: '',
    thoughts: '',
    emotions: '',
    distortions: [],
    rationalResponse: '',
    summaryTh: '',
    comfortTh: '',
    crayonQuadrant: 'low-negative'
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  const nextStep = async () => {
    if (step === 1) { // After thoughts
      setAiLoading(true);
      // Move to step 2 first so loading is visible
      setStep(2); 
      try {
        const risk = await detectRisk(entry.thoughts);
        if (risk.suggestsIntervention || risk.riskLevel === 'high') {
          toast.error('AI ตรวจพบสัญญาณความเสี่ยงสูง เรากำลังนำคุณไปยังแผนฉุกเฉิน', { duration: 5000 });
          onEmergencyTrigger();
          return;
        }
        const result = await analyzeDistortions(entry.situation, entry.thoughts);
        setEntry({ 
          ...entry, 
          distortions: result.distortions,
          summaryTh: result.summaryTh,
          comfortTh: result.comfortTh,
          crayonQuadrant: result.crayonQuadrant
        });
      } catch (error) {
        console.error('AI check error:', error);
      } finally {
        setAiLoading(false);
      }
      return; // Already set step to 2
    }
    setStep(step + 1);
  };

  const saveEntry = async () => {
    try {
      if (user.uid.startsWith('local_')) {
        const localRecords = localStorage.getItem(`thought_records_${user.uid}`) || '[]';
        const parsed = JSON.parse(localRecords);
        parsed.push({
          ...entry,
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(`thought_records_${user.uid}`, JSON.stringify(parsed));
        toast.success('บันทึกความคิดสำเร็จ');
        setIsComplete(true);
        return;
      }

      await addDoc(collection(db, 'users', user.uid, 'thoughtRecords'), {
        ...entry,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      toast.success('บันทึกความคิดสำเร็จ');
      setIsComplete(true);
    } catch (e) {
      toast.error('ไม่สามารถบันทึกได้');
    }
  };

  const handleResetForAnother = () => {
    setEntry({
      situation: '',
      thoughts: '',
      emotions: '',
      distortions: [],
      rationalResponse: '',
      summaryTh: '',
      comfortTh: '',
      crayonQuadrant: 'low-negative'
    });
    setStep(0);
    setIsComplete(false);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages([...chatMessages, { role: 'user', text: userMsg }]);
    setAiLoading(true);
    const aiResponse = await getPsychoeducation(userMsg);
    setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse || 'ขออภัย ฉันไม่สามารถตอบได้ในขณะนี้' }]);
    setAiLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-1 flex shadow-sm border border-slate-100">
        <button 
          onClick={() => setMode('diary')} 
          className={`flex-1 py-3 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${mode === 'diary' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Brain className="w-5 h-5" /> บันทึกความคิด
        </button>
        <button 
          onClick={() => setMode('ai')} 
          className={`flex-1 py-3 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${mode === 'ai' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <MessageCircle className="w-5 h-5" /> ปรึกษา AI
        </button>
      </div>

      {mode === 'diary' ? (
        isComplete ? (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 min-h-[500px] flex flex-col justify-center items-center text-center space-y-8 animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-3 max-w-sm">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">บันทึกความคิดปรับใจสำเร็จล่ะ! 🧠</h3>
              <p className="text-slate-500 font-sans text-sm leading-relaxed">
                เยี่ยมยอดมากเลยค่ะที่คุณใช้หลัก CBT คลี่คลายตะกอนอคติความคิดลบจนเสร็จสิ้น ข้อมูลนี้ได้ถูกจัดเก็บเข้าพอร์ตหลัก <strong>My Journey</strong> เป็นสถิติประวัติสุขภาพใจไว้คุยสรุปรับคำแนะแนวจากนักบำบัดกูรูของคุณเรียบร้อยแล้วนะ 🤍
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
              <button
                onClick={handleResetForAnother}
                className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 text-xs tracking-wide cursor-pointer shadow-md"
              >
                ท้าทายปรับตะกอนความคิดเพิ่มอีกตัว
              </button>
              <button
                onClick={() => {
                  handleResetForAnother();
                  if (onBackToHome) onBackToHome();
                }}
                className="w-full py-4 px-6 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95 text-xs tracking-wide cursor-pointer border border-slate-200"
              >
                กลับหน้าหลัก (Home Page)
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 space-y-6"
              >
                {step === 0 && (
                  <DiaryStep 
                    title="เกิดอะไรขึ้น?" 
                    desc="เล่าสถานการณ์ที่ทำให้คุณรู้สึกไม่สบายใจ" 
                    placeholder="เช่น โดนเพื่อนเมิน, ทำข้อสอบไม่ได้..."
                    value={entry.situation}
                    onChange={(v) => setEntry({ ...entry, situation: v })}
                  />
                )}
                {step === 1 && (
                  <DiaryStep 
                    title="คุณคิดอะไรอยู่?" 
                    desc="ความคิดที่เป็นลบหรือแว่บแรกที่เข้ามาในหัว" 
                    placeholder="เช่น เรามันไม่มีค่า, ทุกคนต้องเกลียดเราแน่ๆ..."
                    value={entry.thoughts}
                    onChange={(v) => setEntry({ ...entry, thoughts: v })}
                  />
                )}
                {step === 2 && (
                  <div className="space-y-6 border border-slate-50 p-1 rounded-3xl">
                    {aiLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 space-y-4">
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} 
                          className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full" 
                        />
                        <p className="text-slate-500 text-sm font-semibold animate-pulse text-center">
                          AI กำลังวิเคราะห์อคติความคิดและร่างภาพวาดสีเทียนชะโลมใจ...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Top Header */}
                        <div className="text-center space-y-1">
                          <h3 className="text-2xl font-bold text-slate-900">
                            วิเคราะห์เบื้องหลังความคิดสำเร็จ ✨
                          </h3>
                          <p className="text-slate-500 text-sm">
                            มาทำความเข้าใจและโอบกอดอารมณ์ของตนเองไปด้วยกันนะ
                          </p>
                        </div>

                        {/* Crayon Illustration Card */}
                        <div className="flex justify-center py-3 bg-slate-50/70 rounded-3xl p-4 border border-slate-100">
                          <CrayonDrawing quadrant={entry.crayonQuadrant || 'low-negative'} size="lg" />
                        </div>

                        {/* Thai Summary connecting to situation */}
                        {entry.summaryTh && (
                          <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/70 shadow-xs space-y-2">
                            <h4 className="font-bold text-amber-900 text-base flex items-center gap-2">
                              💡 บทสรุปสัจธรรมจากเรื่องที่คุณกรอก
                            </h4>
                            <p className="text-slate-700 font-sans leading-relaxed text-base">
                              {entry.summaryTh}
                            </p>
                          </div>
                        )}

                        {/* Comfort words / encouraging poetry */}
                        {entry.comfortTh && (
                          <div className="bg-rose-50/60 p-6 rounded-3xl border border-rose-100/60 shadow-xs relative overflow-hidden">
                            <div className="absolute right-3 top-2 text-rose-200/40 pointer-events-none">
                              <Quote className="w-16 h-16 rotate-180" />
                            </div>
                            <h4 className="font-bold text-rose-900 text-base mb-2">
                              🌸 ถ้อยคำโอบอุ้มใจ
                            </h4>
                            <p className="text-rose-950 font-sans leading-relaxed text-base italic font-medium">
                              "{entry.comfortTh}"
                            </p>
                          </div>
                        )}

                        {/* Detected CBT Cognitive distortions list */}
                        <div className="space-y-3 pt-2">
                          <h4 className="font-bold text-slate-800 text-sm px-1">
                            อคติการคิดที่ตรวจพบในระบบ (Cognitive Distortions):
                          </h4>
                          {entry.distortions.length === 0 ? (
                            <p className="text-center text-slate-400 py-4 italic font-sans text-sm">
                              ไม่พบอคติทางความคิดที่ชัดเจนเป็นพิเศษ มาร่วมคิดมุมมองใหม่กันต่อได้เลย
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 gap-2">
                              {entry.distortions.map((d, i) => (
                                <div key={i} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                                  <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                                    {d.type}
                                  </div>
                                  <p className="text-slate-500 text-xs mt-1 pl-4 leading-relaxed">
                                    {d.descriptionTh}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {step === 3 && (
                  <DiaryStep 
                    title="ลองคิดในมุมใหม่" 
                    desc="ถ้าเพื่อนในสถานการณ์เดียวกันเดินมาปรึกษา คุณจะบอกเขาว่าอย่างไร?" 
                    placeholder="เช่น จริงๆ เพื่อนอาจจะแค่ยุ่งอยู่ก็ได้, ครั้งนี้พลาดไม่ได้แปลว่าเราไม่เก่ง..."
                    value={entry.rationalResponse}
                    onChange={(v) => setEntry({ ...entry, rationalResponse: v })}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex gap-3">
              {step > 0 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="p-4 rounded-2xl bg-slate-100 text-slate-600 font-bold"
                >
                  กลับ
                </button>
              )}
              <button 
                onClick={step === 3 ? saveEntry : nextStep}
                disabled={aiLoading}
                className="flex-1 p-4 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2"
              >
                {step === 3 ? 'บันทึกสำเร็จ' : 'ดำเนินการต่อ'} <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col min-h-[500px]">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2 custom-scrollbar">
            {chatMessages.length === 0 && (
              <div className="text-center space-y-4 py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg">ปรึกษา JaiGu (GuRu.D) AI</h3>
                <p className="text-slate-500 text-sm max-w-[200px] mx-auto">ถามอะไรก็ได้ที่คุณอยากรู้ หรือเล่าเรื่องกังวลใจให้ฟังได้นะ</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['นอนไม่หลับทำยังไง?', 'วิธีจัดการความโกรธ', 'CBT คืออะไร?'].map(q => (
                    <button key={q} onClick={() => { setChatInput(q); }} className="text-xs bg-slate-50 text-slate-600 px-3 py-2 rounded-full border border-slate-100 hover:bg-slate-100 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-[1.5rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-4 rounded-[1.5rem] rounded-bl-none space-x-1 flex">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              placeholder="พิมพ์ข้อความ..."
              className="flex-1 bg-transparent border-none focus:ring-0 p-2 text-sm"
            />
            <button 
              onClick={sendChatMessage}
              disabled={aiLoading || !chatInput.trim()}
              className="bg-blue-600 text-white p-3 rounded-xl disabled:bg-slate-200 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DiaryStep({ title, desc, placeholder, value, onChange }: { title: string, desc: string, placeholder: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-slate-500 text-sm mt-1">{desc}</p>
      </div>
      <textarea 
        className="w-full h-48 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-lg font-sans leading-relaxed"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
