/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db, auth, loginWithGoogle, loginAnonymously } from '@/src/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ShieldAlert, 
  Brain, 
  HeartPulse, 
  Heart,
  Sparkles,
  Wind, 
  Home as HomeIcon,
  User as UserIcon,
  TrendingUp,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'react-hot-toast';

// Clinical Components
import SafetyPlan from '@/src/components/clinical/SafetyPlan';
import CBTDojo from '@/src/components/clinical/CBTDojo';
import FirstAidKit from '@/src/components/clinical/FirstAidKit';
import ChillZone from '@/src/components/clinical/ChillZone';
import Dashboard from '@/src/components/clinical/Dashboard';
import Home from '@/src/components/Home';
import PrivacyConsent from '@/src/components/PrivacyConsent';
import ReminderSettings from '@/src/components/ReminderSettings';
import BrandLogo from '@/src/components/BrandLogo';
import GeminiApiKeySettings from '@/src/components/GeminiApiKeySettings';
import AppEvaluation from '@/src/components/AppEvaluation';

type Tab = 'home' | 'mood' | 'chill' | 'safety' | 'aid' | 'dojo' | 'dashboard' | 'profile';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUid = window.localStorage.getItem('current_user_uid');
      if (savedUid && savedUid.startsWith('local_')) {
        const savedEmail = window.localStorage.getItem('current_user_email');
        const isGuest = savedUid === 'local_guest';
        setUser({
          uid: savedUid,
          displayName: isGuest ? 'สหายผู้เยี่ยมชม (Sandbox)' : 'ผู้ใช้เฉพาะที่',
          email: savedEmail || 'guest@jaiguguru.org',
          photoURL: null,
          isAnonymous: true
        });
        setHasConsented(true);
        setLoading(false);
        return;
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('current_user_email', u.email || '');
          window.localStorage.setItem('current_user_uid', u.uid);
        }
        // Check for consent in Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          if (userDoc.exists() && userDoc.data().privacyConsent) {
            setHasConsented(true);
          } else {
            setHasConsented(false);
          }
        } catch (error) {
          console.error("Error fetching user consent:", error);
          setHasConsented(false);
        }
      } else {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('current_user_email');
          window.localStorage.removeItem('current_user_uid');
        }
        setHasConsented(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAcceptConsent = async () => {
    if (!user) return;
    if (user.uid.startsWith('local_')) {
      setHasConsented(true);
      toast.success('ยินดีต้อนรับเข้าสู่วิถีบำบัดจิตใจค่ะ 🤍');
      return;
    }
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        privacyConsent: true,
        consentDate: serverTimestamp(),
        email: user.email,
        displayName: user.displayName,
      }, { merge: true });
      setHasConsented(true);
      toast.success('ขอบคุณมากที่ไว้วางใจ JaiGuGuRu นะ');
    } catch (error) {
      console.error("Error saving consent:", error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleLogout = () => {
    auth.signOut();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('current_user_email');
      window.localStorage.removeItem('current_user_uid');
    }
    setUser(null);
    setActiveTab('home');
    setHasConsented(null);
    toast.success('ออกจากระบบสำเร็จ');
  };

  const [loggingIn, setLoggingIn] = useState(false);
  const [loggingInGuest, setLoggingInGuest] = useState(false);

  const handleLogin = async () => {
    if (loggingIn) return;
    setLoggingIn(true);
    const toastId = toast.loading('กำลังเชื่อมต่อเพื่อเข้าสู่ระบบ...');
    try {
      await loginWithGoogle();
      toast.success('เข้าสู่ระบบสำเร็จ!', { id: toastId });
    } catch (error: any) {
      console.error("Login error detailed:", error);
      const errorCode = error?.code || '';
      const errorMessage = error?.message || String(error);

      if (errorCode === 'auth/unauthorized-domain' || errorMessage.includes('unauthorized-domain')) {
        toast.error(
          '🔒 โดเมน Vercel/GitHub นี้ยังไม่ได้รับอนุญาตในโปรเจกต์ Firebase! ท่านสามารถคลิกเข้าใช้งานแบบผู้เยี่ยมชม (Guest Mode) เพื่อใช้งานทันทีผ่านโหมดจำลองเครื่องถิ่น (Sandbox) ได้ทันทีค่ะ',
          { id: toastId, duration: 15000 }
        );
      } else if (errorCode === 'auth/popup-blocked') {
        toast.error('🚫 เบราว์เซอร์บล็อกหน้าต่างป๊อปอัพ กรุณาเปิดสิทธิเข้าถึงป๊อปอัพสำหรับหน้านี้แล้วลองอีกครั้งค่ะ', { id: toastId, duration: 6000 });
      } else if (errorCode === 'auth/cancelled-popup-request' || errorCode === 'auth/popup-closed-by-user') {
        toast.error('⚠️ ยกเลิกกระบวนการเปิดเข้าสู่ระบบแล้ว', { id: toastId, duration: 4000 });
      } else {
        toast.error(`❌ ข้อผิดพลาด: ${errorMessage || 'กรุณาลองใหม่อีกครั้ง'}`, { id: toastId, duration: 8000 });
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const handleGuestLogin = async () => {
    if (loggingInGuest) return;
    setLoggingInGuest(true);
    const toastId = toast.loading('กำลังเริ่มเชื่อมต่อผู้เข้าใช้งานชั่วคราว...');
    try {
      await loginAnonymously();
      toast.success('เชื่อมต่อสำเร็จ! ยินดีต้อนรับเข้าสู่วิถีบำบัดจิตใจค่ะ 🤍', { id: toastId });
    } catch (error: any) {
      console.warn("Guest login server error, activating Sandbox Mode:", error);
      // Fallback to local guest user
      const localGuest = {
        uid: 'local_guest',
        displayName: 'สหายผู้เยี่ยมชม (Sandbox)',
        email: 'guest@jaiguguru.org',
        photoURL: null,
        isAnonymous: true,
      };
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('current_user_email', localGuest.email);
        window.localStorage.setItem('current_user_uid', localGuest.uid);
      }
      setUser(localGuest);
      setHasConsented(true); // Auto consent in sandbox mode
      toast.success('⚠️ เชื่อมต่อโหมดจำลองในเครื่องถิ่น (Sandbox Mode) สำเร็จและทำงานได้ตามปกติแล้วค่ะ!', { id: toastId, duration: 6000 });
    } finally {
      setLoggingInGuest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/70 to-purple-100/50 flex flex-col items-center justify-center p-6 text-center">
        <Toaster position="top-center" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-8"
        >
          <div className="flex flex-col items-center">
            <BrandLogo size="lg" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">JaiGuGuRu (ใจกู...กูรู้)</h1>
            <p className="text-slate-500 font-sans font-medium text-sm">ใจของฉัน ฉันรู้ใจฉันดี 🤍</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              disabled={loggingIn || loggingInGuest}
              className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 animate-pulse" />
              {loggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
            </button>

            <button
              onClick={handleGuestLogin}
              disabled={loggingIn || loggingInGuest}
              className="w-full py-3.5 px-6 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 border border-slate-200 active:scale-98"
            >
              🔑 เข้าใช้งานด่วนแบบผู้เยี่ยมชม (Guest Mode)
            </button>
          </div>

          <div className="p-4 bg-indigo-50/50 text-indigo-950 font-sans rounded-2xl text-[11.5px] leading-relaxed text-left border border-indigo-100/30 space-y-1">
            <p className="font-extrabold text-indigo-900 text-xs mb-1">🔑 คำแนะนำสำหรับการใช้อีเมลผู้ใช้งานอื่น:</p>
            <p className="font-medium">ในกรณีที่คุณเข้าใช้ระบบด้วยชื่ออีเมลทั่วไปหรืออีเมลของผู้อื่น กรุณานำ <strong>Google Gemini API Key ส่วนตัวของคุณเอง</strong> มาวางติดตั้งในหน้าข้อมูลส่วนตัว (แท็บ Profile ขวาล่าง) เพื่อเข้าถึงชุดคำสั่งวิเคราะห์ประมวลความคิดและแอปพลิเคชันอย่างฉลาดและราบรื่นค่ะ</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium">
              © ลิขสิทธิ์ซอฟต์แวร์และการออกแบบเป็นของ <br/>
              <strong>นพ.ธันวรุจน์ บูรณสุขสกุล</strong> ห้ามลอกเลียนแบบหรือทำซ้ำ
            </p>
            <p className="text-[10px] text-slate-400 italic font-sans leading-relaxed">
              สงวนวัตถุประสงค์เพื่ออำนวยคุณประโยชน์อันสูงสุด<br/>แด่เพื่อนมนุษย์ผู้ที่กำลังเผชิญเหตุและทุกข์ระทมใจเท่านั้น 🤍
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      <Toaster position="top-center" />
      
      {/* Privacy Consent Overlay */}
      <AnimatePresence>
        {user && hasConsented === false && (
          <PrivacyConsent onAccept={handleAcceptConsent} />
        )}
      </AnimatePresence>
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <BrandLogo size="sm" showText={true} />
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setActiveTab('safety');
              setEmergencyMode(true);
            }}
            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
            title="Emergency Mode"
          >
            <ShieldAlert className="w-5 h-5" />
          </button>
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-8 h-8 rounded-full border border-slate-200"
              onClick={() => setActiveTab('profile')}
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && <Home user={user} setActiveTab={setActiveTab} />}
            {activeTab === 'mood' && <Home user={user} setActiveTab={setActiveTab} initialShowMoodOnly={true} />}
            {activeTab === 'safety' && (
              <SafetyPlan 
                user={user} 
                isEmergency={emergencyMode} 
                resetEmergency={() => setEmergencyMode(false)} 
                onBackToHome={() => setActiveTab('home')} 
              />
            )}
            {activeTab === 'dashboard' && <Dashboard user={user} />}
            {activeTab === 'dojo' && (
              <CBTDojo 
                user={user} 
                onEmergencyTrigger={() => { 
                  setActiveTab('safety'); 
                  setEmergencyMode(true); 
                }} 
                onBackToHome={() => setActiveTab('home')}
              />
            )}
            {activeTab === 'aid' && <FirstAidKit />}
            {activeTab === 'chill' && <ChillZone />}
            {activeTab === 'profile' && (
              <div className="space-y-10 pb-10">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                  <div className="flex flex-col items-center space-y-6 relative z-10">
                    <div className="relative">
                      {user.photoURL ? (
                        <img src={user.photoURL} className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-lg object-cover" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white shadow-lg flex items-center justify-center font-black text-2xl text-white">
                          {(user.displayName || 'G')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-indigo-600 p-2 rounded-full border-4 border-white">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.displayName || 'สหายบำบัดจิตผู้เยี่ยมชม (Guest)'}</h2>
                      <p className="text-slate-400 text-sm font-medium">{user.email || 'guest@jaiguguru.org'}</p>
                    </div>
                  </div>
                </div>

                <ReminderSettings user={user} />

                <GeminiApiKeySettings user={user} />

                <AppEvaluation user={user} />

                <button 
                  onClick={handleLogout}
                  className="w-full py-4 flex items-center justify-center gap-3 text-rose-600 font-bold bg-rose-50 rounded-2xl hover:bg-rose-100 transition-all active:scale-95 border border-rose-100"
                >
                  <LogOut className="w-5 h-5" />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav: 7 Icons exactly as requested by user */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100/80 px-1 py-1 px-1 py-2 pb-6 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        <div className="max-w-md mx-auto flex items-end justify-between px-0.5">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<HomeIcon className="w-5 h-5" />} 
            label="หน้าหลัก" 
          />
          <NavButton 
            active={activeTab === 'mood'} 
            onClick={() => setActiveTab('mood')} 
            icon={<Heart className="w-5 h-5" />} 
            label="บันทึกอารมณ์" 
          />
          <NavButton 
            active={activeTab === 'chill'} 
            onClick={() => setActiveTab('chill')} 
            icon={<Wind className="w-5 h-5" />} 
            label="มุมสงบ" 
          />
          <NavButton 
            active={activeTab === 'safety'} 
            onClick={() => setActiveTab('safety')} 
            icon={<ShieldAlert className="w-5 h-5" />} 
            label="แผนปลอดภัย" 
          />
          <NavButton 
            active={activeTab === 'aid'} 
            onClick={() => setActiveTab('aid')} 
            icon={<HeartPulse className="w-5 h-5" />} 
            label="ปฐมพยาบาลใจ" 
          />
          <NavButton 
            active={activeTab === 'dojo'} 
            onClick={() => setActiveTab('dojo')} 
            icon={<Brain className="w-5 h-5" />} 
            label="ห้องเรียนคิด" 
          />
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<TrendingUp className="w-5 h-5" />} 
            label="บันทึกของฉัน" 
          />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 transition-all text-center flex-1 min-w-0 ${active ? 'text-indigo-600 scale-105 font-black' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <div className={`p-1 rounded-xl transition-all ${active ? 'bg-indigo-50/70' : 'bg-transparent'}`}>
        {icon}
      </div>
      <span className="text-[8px] sm:text-[9px] font-semibold leading-none whitespace-nowrap truncate w-full max-w-[54px] block mt-0.5">
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="w-1 h-1 bg-indigo-600 rounded-full mt-1"
        />
      )}
    </button>
  );
}
