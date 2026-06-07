import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { db } from '@/src/lib/firebase';
import { collection, query, where, getDocs, setDoc, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Phone, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  LifeBuoy,
  Stethoscope,
  Info,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { toPng } from 'html-to-image';

interface SafetyPlanData {
  userId: string;
  triggers: string;
  internalCoping: string;
  distractions: string;
  trustedContacts: { name: string; phone: string }[];
  professionalHelp: { name: string; phone: string }[];
  environmentSafety: string[];
}

const steps = [
  { id: 'triggers', title: 'สัญญาณเตือน (Triggers)', desc: 'อะไรที่บอกว่าคุณกำลังเริ่มรู้สึกไม่โอเค?' },
  { id: 'coping', title: 'วิธีจัดการตัวเอง (Coping)', desc: 'สิ่งที่คุณทำเองได้เพื่อลดความเครียด (เช่น หายใจลึกๆ)' },
  { id: 'distractions', title: 'เบี่ยงเบนความสนใจ', desc: 'สถานที่หรือกิจกรรมที่ช่วยให้ลืมความรู้สึกลบ' },
  { id: 'contacts', title: 'คนที่เราไว้ใจ', desc: 'คนที่คุณคุยด้วยแล้วสบายใจที่สุด' },
  { id: 'pros', title: 'หน่วยงานช่วยเหลือ', desc: 'เบอร์สายด่วนหรือโรงพยาบาลใกล้บ้าน' },
  { id: 'environment', title: 'สภาพแวดล้อมที่ปลอดภัย', desc: 'การจัดการสิ่งของที่อาจทำให้เกิดอันตราย' }
];

export default function SafetyPlan({ user, isEmergency, resetEmergency, onBackToHome }: { user: User, isEmergency: boolean, resetEmergency: () => void, onBackToHome?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [data, setData] = useState<SafetyPlanData>({
    userId: user.uid,
    triggers: '',
    internalCoping: '',
    distractions: '',
    trustedContacts: [],
    professionalHelp: [
      { name: 'สายด่วนสุขภาพจิต', phone: '1323' },
      { name: 'สมาคมสะมาริตันส์', phone: '02-113-6789' }
    ],
    environmentSafety: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, []);

  const [isAdding, setIsAdding] = useState<{ type: 'trusted' | 'pro', name: string, phone: string } | null>(null);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      if (user.uid.startsWith('local_')) {
        const localData = localStorage.getItem(`safety_plan_${user.uid}`);
        if (localData) {
          const plan = JSON.parse(localData) as SafetyPlanData;
          setData({
            ...plan,
            trustedContacts: plan.trustedContacts || [],
            professionalHelp: plan.professionalHelp || [
              { name: 'สายด่วนสุขภาพจิต', phone: '1323' },
              { name: 'สมาคมสะมาริตันส์', phone: '02-113-6789' }
            ],
            environmentSafety: plan.environmentSafety || []
          });
        }
        setLoading(false);
        return;
      }

      const q = query(collection(db, 'users', user.uid, 'safetyPlans'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const plan = snapshot.docs[0].data() as SafetyPlanData;
        setData({
          ...plan,
          trustedContacts: plan.trustedContacts || [],
          professionalHelp: plan.professionalHelp || [
            { name: 'สายด่วนสุขภาพจิต', phone: '1323' },
            { name: 'สมาคมสะมาริตันส์', phone: '02-113-6789' }
          ],
          environmentSafety: plan.environmentSafety || []
        });
      }
    } catch (error) {
      console.error("Error fetching safety plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const cardRef = useRef<HTMLDivElement>(null);

  const savePlan = async () => {
    try {
      if (user.uid.startsWith('local_')) {
        localStorage.setItem(`safety_plan_${user.uid}`, JSON.stringify(data));
        
        // Log local safety plan updates
        const savedLogs = localStorage.getItem(`safety_plan_logs_${user.uid}`) || '[]';
        const parsedLogs = JSON.parse(savedLogs);
        parsedLogs.push({
          userId: user.uid,
          type: 'plan-updated',
          note: `อัปเดตกระดานแผนป้องกันความปลอดภัย: อัปเกรดเกราะป้องกันสำหรับรับมือกับ Triggers ด้วยความรู้สึกมั่นคง สัญญาณความปรองดองพร้อมใช้งานเรียบร้อยค่ะ 🛡️`,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(`safety_plan_logs_${user.uid}`, JSON.stringify(parsedLogs));

        toast.success('บันทึกแผนป้องกันความปลอดภัยและทำสัญลักษณ์บนปฏิทินสำเร็จแล้วค่ะ 🌟');
        setIsComplete(true);
        return;
      }

      await setDoc(doc(db, 'users', user.uid, 'safetyPlans', 'current'), {
        ...data,
        updatedAt: serverTimestamp()
      });

      // Write safety plan update log for Calendar marking
      await addDoc(collection(db, 'users', user.uid, 'safetyPlanLogs'), {
        userId: user.uid,
        type: 'plan-updated',
        note: `อัปเดตกระดานแผนป้องกันความปลอดภัย: อัปเกรดเกราะป้องกันสำหรับรับมือกับ Triggers ด้วยความรู้สึกมั่นคง สัญญาณความปรองดองพร้อมใช้งานเรียบร้อยค่ะ 🛡️`,
        createdAt: serverTimestamp()
      });

      toast.success('บันทึกแผนป้องกันความปลอดภัยและทำสัญลักษณ์บนปฏิทินสำเร็จแล้วค่ะ 🌟');
      setIsComplete(true);
    } catch (error) {
      console.error('Save plan error:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const downloadCopingCard = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Coping-Card-${user.displayName?.split(' ')[0] || 'Me'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('บันทึก Coping Card เป็นรูปภาพลงโทรศัพท์เรียบร้อยแล้วค่ะ! 💾');
    } catch (err) {
      console.error(err);
      toast.error('ไม่สามารถดาวน์โหลดรูปภาพได้ในระบบ Sandbox นี้ แต่คุณสามารถจับหน้าจอเพื่อใช้งานอย่างพกพาสะดวกได้เลยนะคะ 🤍');
    }
  };

  const shareCopingCard = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      if (navigator.share) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'coping-card.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: 'My Coping Card (SPI)',
          text: 'แผนป้องกันความปลอดภัยส่วนบุคคล (SPI) ของฉัน มั่นใจ มั่นคง ปลอดภัย 🛡️'
        });
      } else {
        await navigator.clipboard.writeText('ฉันได้เก็บบันทึกแผนความปลอดภัย (Coping Card) กับใจกูรูแล้ว หากมีสัญญาณอันตรายโปรดคุ้มครองฉันด้วยนะคะ');
        toast.success('คัดลอกคำแถลงความปลอดภัยแล้ว! คุณสามารถใช้ภาพที่ดาวน์โหลดส่งให้นักบำบัดทางแชตได้ทันทีค่ะ');
      }
    } catch (err) {
      console.error(err);
      toast.error('คุณสามารถแชร์ผ่านการบันทึกรูปภาพและส่งไปที่ห้องแชตของคนที่คุณรู้สึกปลอดภัยได้ทันทีค่ะ');
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      savePlan();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleAddSubmit = () => {
    if (!isAdding || !isAdding.name || !isAdding.phone) return;
    
    if (isAdding.type === 'trusted') {
      setData({ ...data, trustedContacts: [...data.trustedContacts, { name: isAdding.name, phone: isAdding.phone }] });
    } else {
      setData({ ...data, professionalHelp: [...data.professionalHelp, { name: isAdding.name, phone: isAdding.phone }] });
    }
    setIsAdding(null);
  };

  const removeContact = (type: 'trusted' | 'pro', index: number) => {
    if (type === 'trusted') {
      const newList = [...data.trustedContacts];
      newList.splice(index, 1);
      setData({ ...data, trustedContacts: newList });
    } else {
      const newList = [...data.professionalHelp];
      newList.splice(index, 1);
      setData({ ...data, professionalHelp: newList });
    }
  };

  if (isEmergency) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className="bg-red-600 text-white p-6 text-center shadow-lg">
          <ShieldAlert className="w-12 h-12 mx-auto mb-2" />
          <h2 className="text-2xl font-bold">โหมดฉุกเฉิน</h2>
          <p className="text-red-100 text-sm">ทำตามแผนที่คุณเตรียมไว้ทีละขั้นนะ คุณจะผ่านมันไปได้</p>
        </div>

        <div className="p-6 space-y-6 max-w-md mx-auto">
          {/* Quick Contacts */}
          <section className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-500" />
              โทรหาคนที่จะช่วยคุณได้ทันที
            </h3>
            <div className="space-y-3">
              {[...data.professionalHelp, ...data.trustedContacts].map((c, i) => (
                <a 
                  key={i} 
                  href={`tel:${c.phone}`}
                  className="flex items-center justify-between p-5 bg-white border-2 border-red-100 rounded-2xl hover:bg-red-50 transition-colors shadow-sm animate-in fade-in"
                >
                  <div>
                    <div className="font-bold text-lg">{c.name}</div>
                    <div className="text-slate-500">{c.phone}</div>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <Phone className="w-6 h-6 text-red-600" />
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Coping Reminders */}
          <section className="bg-blue-50 p-6 rounded-3xl space-y-3 border border-blue-100">
            <h3 className="font-bold flex items-center gap-2 text-blue-800">
              <ShieldAlert className="w-5 h-5" />
              สิ่งที่คุณควรทำตอนนี้
            </h3>
            <ul className="space-y-2 text-blue-900">
              <li>• หายใจลึกๆ 4-7-8 (ไปที่เมนู <span className="font-bold">มุมสงบ</span>)</li>
              <li>• ดื่มน้ำเย็นจัด หรือเอาน้ำลูบหน้า</li>
              <li>• {data.internalCoping || 'นึกถึงที่ที่คุณรู้สึกปลอดภัย'}</li>
            </ul>
          </section>

          <button 
            onClick={resetEmergency}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl cursor-pointer"
          >
            ฉันรู้สึกดีขึ้นแล้ว
          </button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-8 animate-in fade-in duration-300">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">บันทึกและสร้าง Coping Card สำเร็จ! 🛡️</h3>
            <p className="text-slate-500 font-sans text-xs leading-relaxed max-w-sm mt-1">
              คัมภีร์พิทักษ์ใจของคุณพร้อมใช้งานแล้วค่ะ คุณสามารถพกพาติดตัว ดาวน์โหลดเก็บสิทธิ์ หรือส่งต่อให้คนที่รู้สึกปลอดภัยได้โดยตรงเลยนะคะ
            </p>
          </div>
        </div>

        {/* Dynamic Interactive Beautiful Printable Coping Card Container */}
        <div className="max-w-md mx-auto p-1 bg-gradient-to-tr from-emerald-100 via-amber-100 to-indigo-150 rounded-[2rem] shadow-md border-none">
          <div 
            ref={cardRef}
            className="bg-white p-6 rounded-[1.85rem] relative overflow-hidden space-y-5 select-none font-sans"
            style={{ minHeight: '420px' }}
          >
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 blur-2xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-150/30 blur-2xl rounded-full pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">MY COPING POCKET CARD</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">เกราะป้องกันใจอุ่น</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{user.displayName?.split(' ')[0]}</span>
            </div>

            {/* Card Body Columns */}
            <div className="space-y-3.5 pt-1 text-left relative z-10">
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase text-amber-500 tracking-widest block">⚠️ เมื่อเริ่มรู้สึกไม่มั่นคง (Triggers)</span>
                <p className="text-xs text-slate-700 font-bold leading-relaxed">{data.triggers || 'จะรีบหลบมารักษาใจในที่สงบ'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest block">🧘 กิจกรรมดึงสติด้วยสมาธิ (Coping)</span>
                <p className="text-xs text-slate-705 font-medium leading-relaxed">{data.internalCoping || 'หยุดทุกอย่าง หายใจเข้า-ออกลึกๆ ช้าๆ 5 ครั้ง'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase text-indigo-550 tracking-widest block">📍 สิ่งเบี่ยงเบนใจพาเพลิน</span>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">{data.distractions || 'ออกไปเดินเล่นใต้ร่มไม้ สูดลมหายใจธรรมชาติ'}</p>
              </div>

              {data.trustedContacts && data.trustedContacts.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-rose-500 tracking-widest block">📞 คนพึ่งพิงชูใจอุ่น</span>
                  <p className="text-xs text-slate-700 font-bold">
                    {data.trustedContacts.map((c: any) => `${c.name} (${c.phone})`).join(', ')}
                  </p>
                </div>
              )}

              {data.professionalHelp && data.professionalHelp.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest block">🏥 สายด่วนโรงพยาบาล/ผู้เชี่ยวชาญ</span>
                  <p className="text-xs text-slate-700 font-bold">
                    {data.professionalHelp.map((c: any) => `${c.name} (${c.phone})`).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Safe Affirmation Message */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 italic font-mono">
              <span>"หัวใจฉันมีค่า และฉันเป็นเจ้าของบทชีวิตนี้"</span>
              <span>jai-guru 🤍</span>
            </div>
          </div>
        </div>

        {/* Actions button for downloading and sharing */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-sm mx-auto pt-2">
          <button
            onClick={downloadCopingCard}
            className="flex-1 py-3 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> เซฟเป็นภาพในโทรศัพท์
          </button>
          <button
            onClick={shareCopingCard}
            className="flex-1 py-3 px-5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> แชร์ / ส่งนักบำบัด
          </button>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-xs mx-auto pt-4 border-t border-slate-100">
          <button
            onClick={() => {
              setIsComplete(false);
              setCurrentStep(0);
            }}
            className="w-full py-3.5 px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 text-xs tracking-wide cursor-pointer shadow-md"
          >
            แก้ไขหรือปรับปรุงแผน
          </button>
          <button
            onClick={() => {
              setIsComplete(false);
              setCurrentStep(0);
              if (onBackToHome) onBackToHome();
            }}
            className="w-full py-3.5 px-6 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95 text-xs tracking-wide cursor-pointer border border-slate-200"
          >
            กลับหน้าแรก (Go to Home Page)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">แผนฉุกเฉิน (SPI)</h2>
        <div className="text-xs text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
          ขั้นตอนที่ {currentStep + 1} จาก {steps.length}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-900">{steps[currentStep].title}</h3>
              <p className="text-slate-500 text-sm mt-1">{steps[currentStep].desc}</p>
            </div>

            {/* Inputs based on step */}
            {currentStep === 0 && (
              <textarea 
                className="w-full h-40 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                placeholder="เช่น ไม่อยากคุยกับใคร, นอนไม่หลับ, รู้สึกชาตามตัว..."
                value={data.triggers}
                onChange={(e) => setData({ ...data, triggers: e.target.value })}
              />
            )}

            {currentStep === 1 && (
              <textarea 
                className="w-full h-40 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                placeholder="เช่น การหายใจตามจังหวะ, เล่นกับสัตว์เลี้ยง, ฟังเพลงที่ชอบ..."
                value={data.internalCoping}
                onChange={(e) => setData({ ...data, internalCoping: e.target.value })}
              />
            )}

            {currentStep === 2 && (
              <textarea 
                className="w-full h-40 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                placeholder="เช่น ร้านกาแฟที่คนไม่เยอะ, ห้องสมุด, ส่วนสาธารณะที่กว้างๆ..."
                value={data.distractions}
                onChange={(e) => setData({ ...data, distractions: e.target.value })}
              />
            )}

            {(currentStep === 3 || currentStep === 4) && (
              <div className="space-y-4">
                {isAdding && isAdding.type === (currentStep === 3 ? 'trusted' : 'pro') ? (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-50 rounded-2xl border-2 border-blue-100 space-y-3"
                  >
                    <input 
                      autoFocus
                      className="w-full p-3 bg-white rounded-xl border border-slate-200 text-sm"
                      placeholder={currentStep === 3 ? "ชื่อผู้ติดต่อ" : "ชื่อหน่วยงาน"}
                      value={isAdding.name}
                      onChange={(e) => setIsAdding({ ...isAdding, name: e.target.value })}
                    />
                    <input 
                      className="w-full p-3 bg-white rounded-xl border border-slate-200 text-sm"
                      placeholder="เบอร์โทรศัพท์"
                      type="tel"
                      value={isAdding.phone}
                      onChange={(e) => setIsAdding({ ...isAdding, phone: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsAdding(null)}
                        className="flex-1 py-2 text-slate-500 font-bold text-sm bg-slate-200 rounded-xl"
                      >
                        ยกเลิก
                      </button>
                      <button 
                        onClick={handleAddSubmit}
                        className="flex-1 py-2 text-white font-bold text-sm bg-blue-600 rounded-xl"
                      >
                        เพิ่ม
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => setIsAdding({ type: currentStep === 3 ? 'trusted' : 'pro', name: '', phone: '' })}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-all font-bold"
                  >
                    <UserPlus className="w-5 h-5" />
                    เพิ่มผู้ติดต่อ
                  </button>
                )}
                <div className="space-y-3">
                  {(currentStep === 3 ? data.trustedContacts : data.professionalHelp).map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl shadow-sm border border-slate-100">
                      <div>
                        <div className="font-bold">{c.name}</div>
                        <div className="text-slate-500 text-sm">{c.phone}</div>
                      </div>
                      <button onClick={() => removeContact(currentStep === 3 ? 'trusted' : 'pro', i)} className="text-red-400 p-2">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 text-blue-800 rounded-2xl flex gap-3 text-sm border border-blue-100">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  ทำให้สภาพแวดล้อมรอบตัวมีความเสี่ยงน้อยที่สุด โดยการนำสิ่งของที่อาจใช้ทำร้ายตนเองได้ออกไปห่างตัวหรือฝากไว้กับผู้ดูแล
                </div>
                <textarea 
                  className="w-full h-32 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                  placeholder="เช่น ฝากยารักษาโรคไว้ที่คุณแม่, เก็บของมีคมเข้าลิ้นชัก..."
                  value={data.environmentSafety.join('\n')}
                  onChange={(e) => setData({ ...data, environmentSafety: e.target.value.split('\n') })}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
          <button 
            disabled={currentStep === 0}
            onClick={prevStep}
            className="flex-1 py-4 flex items-center justify-center gap-2 bg-slate-100 rounded-2xl text-slate-600 font-bold disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" /> ย้อนกลับ
          </button>
          <button 
            onClick={nextStep}
            className="flex-1 py-4 flex items-center justify-center gap-2 bg-slate-900 rounded-2xl text-white font-bold"
          >
            {currentStep === steps.length - 1 ? 'บันทึกสำเร็จ' : 'ถัดไป'} <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
