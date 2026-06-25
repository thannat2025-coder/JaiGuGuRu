import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Key, CheckCircle, AlertTriangle, Eye, EyeOff, Sparkles, RefreshCw, HelpCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { toast } from 'react-hot-toast';
import { db } from '@/src/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface GeminiApiKeySettingsProps {
  user: {
    uid: string;
    email: string | null;
  };
}

export default function GeminiApiKeySettings({ user }: GeminiApiKeySettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing key from localStorage
    const savedKey = localStorage.getItem(`custom_gemini_api_key_${user.uid}`) || '';
    setApiKey(savedKey);
  }, [user.uid]);

  const handleSave = async () => {
    const trimmedKey = apiKey.trim();
    if (trimmedKey && !trimmedKey.startsWith('AIzaSy')) {
      toast.error('ดูเหมือนรูปแบบ API Key จะไม่ถูกต้อง (ปกติจะขึ้นต้นด้วย AIzaSy)');
      return;
    }

    try {
      if (trimmedKey === '') {
        localStorage.removeItem(`custom_gemini_api_key_${user.uid}`);
        localStorage.removeItem(`custom_gemini_api_key_consented_${user.uid}`);
        
        if (user.uid && !user.uid.startsWith('local_')) {
          await setDoc(doc(db, 'users', user.uid), {
            geminiApiKey: null,
            geminiApiKeySavedAt: null
          }, { merge: true });
        }
        
        toast.success('ล้างการตั้งค่าคีย์ส่วนตัวสำเร็จ');
      } else {
        localStorage.setItem(`custom_gemini_api_key_${user.uid}`, trimmedKey);
        localStorage.setItem(`custom_gemini_api_key_consented_${user.uid}`, 'true');
        
        if (user.uid && !user.uid.startsWith('local_')) {
          await setDoc(doc(db, 'users', user.uid), {
            geminiApiKey: trimmedKey,
            geminiApiKeySavedAt: serverTimestamp()
          }, { merge: true });
        }
        
        toast.success('บันทึก API Key สำเร็จ!');
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err: any) {
      console.error("Error storing API Key in Firestore:", err);
      toast.error('บันทึกคีย์ลงฐานระบบล้มเหลว แต่บันทึกในเครื่องถิ่นแล้วครับ');
    }
  };

  const handleTestConnection = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      toast.error('กรุณาระบุ API Key ก่อนกดทดสอบครับ');
      return;
    }
    if (!trimmedKey.startsWith('AIzaSy')) {
      toast.error('API Key ของคุณควรขึ้นต้นด้วย AIzaSy ครับ');
      return;
    }

    setTesting(true);
    toast.loading('กำลังเชื่อมต่อทดสอบกับ Google AI Studio...', { id: 'test-api' });

    try {
      const testAi = new GoogleGenAI({ apiKey: trimmedKey });
      const response = await testAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "สวัสดีครับ ตอบสั้นๆ คำเดียวว่า 'ใช้ได้ดี' เพื่อยืนยันว่าเชื่อมต่อสำเร็จ"
      });

      if (response && response.text) {
        toast.success(`เชื่อมต่อสำเร็จเยาวชน! AI ตอบกลับ: "${response.text.trim()}"`, { id: 'test-api', duration: 4000 });
        // Auto save if test succeeds
        localStorage.setItem(`custom_gemini_api_key_${user.uid}`, trimmedKey);
        localStorage.setItem(`custom_gemini_api_key_consented_${user.uid}`, 'true');
        if (user.uid && !user.uid.startsWith('local_')) {
          try {
            await setDoc(doc(db, 'users', user.uid), {
              geminiApiKey: trimmedKey,
              geminiApiKeySavedAt: serverTimestamp()
            }, { merge: true });
          } catch (e) {
            console.error("Auto-save API key to Firestore failed", e);
          }
        }
      } else {
        throw new Error('ไม่ได้รับข้อความตอบสนอง');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`เชื่อมต่อล้มเหลว: ${err?.message || 'กรุณาตรวจสอบความถูกต้องของคีย์และอินเทอร์เน็ต'}`, { id: 'test-api', duration: 5000 });
    } finally {
      setTesting(false);
    }
  };

  const isDeveloper = user.email === 'thannat2025@gmail.com';

  return (
    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-start gap-3">
        <span className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 block">
          <Key className="w-6 h-6" />
        </span>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            🔑 Google Gemini API Key ส่วนตัว
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </h3>
          <p className="text-slate-500 text-xs font-sans leading-relaxed">
            สำหรับนักเรียนแพทย์ นิสิตนักศึกษา หรือบุคคลภายนอกที่โคลนโปรเจกต์นี้ไปใช้บน GitHub <br />
            กรุณาระบุ <strong>API Key ส่วนตัวของคุณเอง</strong> เพื่อลดความตึงเครียดของโควตาประมวลผลฟรีของแพทย์ระบบส่วนกลางครับ
          </p>
        </div>
      </div>

      {isDeveloper && (
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2 text-xs font-sans text-emerald-800">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>บัญชีของคุณได้รับสิทธิ <strong>ผู้ดูแลระบบกูรู (Creator Bypass)</strong> ใช้ระบบเซิร์ฟเวอร์หลักกลางได้ฟรี</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-xs font-black text-slate-700 tracking-wide uppercase">ป้อน Google Gemini API Key</label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full pr-12 pl-4 py-3 bg-slate-50 text-slate-800 border border-slate-200/80 rounded-2xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-3 bg-indigo-650 hover:bg-indigo-800 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-indigo-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Key className="w-4 h-4" />}
          {saved ? 'บันทึกสำเร็จเรียบร้อย!' : 'บันทึกคีย์ (Save Key)'}
        </button>

        <button
          type="button"
          disabled={testing}
          onClick={handleTestConnection}
          className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-600 ${testing ? 'animate-spin' : ''}`} />
          ทดสอบเชื่อมต่อ (Test Connection)
        </button>
      </div>

      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5 text-[10.5px]/relaxed text-slate-500 font-sans">
        <HelpCircle className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
        <div>
          <span>ไม่มีคีย์ใช่ไหมครับ? คุณสามารถสมัครขอรับคีย์ <strong>Gemini API Key ฟรี (Free Tier 15 RPM)</strong> ได้ง่ายๆ ภายใน 1 นาที เพียงกดปุ่มเข้า </span>
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 font-extrabold hover:underline"
          >
            Google AI Studio ↗
          </a>
          <span> แล้วใช้อีเมล Google เดียวกันกดคำว่า "Get API Key" ได้เลยครับ!</span>
        </div>
      </div>
    </div>
  );
}
