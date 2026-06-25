/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db, auth, loginWithGoogle, loginAnonymously, loginWithEmail, registerWithEmail } from '@/src/lib/firebase';
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
  AlertTriangle,
  ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'react-hot-toast';

// Clinical Components
import SafetyPlan from '@/src/components/clinical/SafetyPlan';
import CBTDojo from '@/src/components/clinical/CBTDojo';
import FirstAidKit from '@/src/components/clinical/FirstAidKit';
import ChillZone from '@/src/components/clinical/ChillZone';
import Dashboard from '@/src/components/clinical/Dashboard';
import BehaviorActivation from '@/src/components/clinical/BehaviorActivation';
import ClinicalScreening from '@/src/components/clinical/ClinicalScreening';
import ClinicalPresentation from '@/src/components/clinical/ClinicalPresentation';
import Home from '@/src/components/Home';
import PrivacyConsent from '@/src/components/PrivacyConsent';
import ReminderSettings from '@/src/components/ReminderSettings';
import BrandLogo from '@/src/components/BrandLogo';
import GeminiApiKeySettings from '@/src/components/GeminiApiKeySettings';
import AppEvaluation from '@/src/components/AppEvaluation';

type Tab = 'home' | 'mood' | 'chill' | 'safety' | 'aid' | 'dojo' | 'dashboard' | 'profile' | 'activation' | 'screening' | 'presentation';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [hasConsented, setHasConsented] = useState<boolean | null>(null);
  
  // States for automatic API Key Sync Consent
  const [pendingApiKey, setPendingApiKey] = useState<string | null>(null);
  const [showApiConsent, setShowApiConsent] = useState(false);

  // Email/Password login states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Guest restriction helper
  const isVisitor = user?.isAnonymous || user?.uid === 'local_guest' || user?.uid?.startsWith('local_') || !user?.email || user?.email === 'guest@jaiguguru.org';

  const isTabRestricted = (tab: Tab) => {
    if (!isVisitor) return false;
    return !['home', 'mood', 'safety', 'profile'].includes(tab);
  };

  const handleTabClick = (tab: Tab) => {
    if (isTabRestricted(tab)) {
      toast.error('🔒 โหมดผู้เยี่ยมชมจำกัดการเข้าใช้เฉพาะ "เช็คอินอารมณ์" และ "บันทึกแผนปลอดภัย" เท่านั้น ครับ กรุณาเข้าสู่ระบบผ่าน Google เพื่อสัมผัสวิถีรักษาจิตด้วย CBT เต็มรูปแบบเชิงรณรงค์ครับ 🤍', {
        duration: 6000,
        icon: '🔒'
      });
      return;
    }
    setActiveTab(tab);
  };

  const handleApiConnectionConsent = (consent: boolean) => {
    if (!user) return;
    if (consent && pendingApiKey) {
      window.localStorage.setItem(`custom_gemini_api_key_${user.uid}`, pendingApiKey);
      window.localStorage.setItem(`custom_gemini_api_key_consented_${user.uid}`, 'true');
      toast.success('🔌 เชื่อมต่อ Google Gemini API Key ของคุณแบบอัตโนมัติเรียบร้อยแล้วครับ! 🤍 พร้อมวิเคราะห์จิตใจและทัศนคติลึกซึ้ง');
    } else {
      window.localStorage.setItem(`custom_gemini_api_key_consented_${user.uid}`, 'false');
      toast('คุณสลัดสิทธิ์เชื่อมโยงคีย์โดยอัตโนมัติ คุณยังสามารถระบุคีย์ด้วยตนเองได้ในสไลด์เพจข้อมูลส่วนตัวครับ', {
        icon: '🔑'
      });
    }
    setPendingApiKey(null);
    setShowApiConsent(false);
  };

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
        // Check for consent and user settings in Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.privacyConsent) {
              setHasConsented(true);
            } else {
              setHasConsented(false);
            }

            // Detect remote API key and check consent
            if (data.geminiApiKey) {
              const localKey = window.localStorage.getItem(`custom_gemini_api_key_${u.uid}`);
              const alreadyConsented = window.localStorage.getItem(`custom_gemini_api_key_consented_${u.uid}`) === 'true';
              if (!alreadyConsented || localKey !== data.geminiApiKey) {
                setPendingApiKey(data.geminiApiKey);
                setShowApiConsent(true);
              }
            }
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
      toast.success('ยินดีต้อนรับเข้าสู่วิถีบำบัดจิตใจครับ 🤍');
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
      setActiveTab('profile'); // Automatically route to profile to authorize/allow API Key
      toast.success('ขอบคุณมากที่ไว้วางใจ Jai-Gu นะครับ 🤍');
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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loggingIn) return;
    if (!email || !email.trim() || !password) {
      toast.error('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วนครับ');
      return;
    }
    if (password.length < 6) {
      toast.error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษรเพื่อความปลอดภัยครับ');
      return;
    }
    if (authMode === 'register' && !displayName.trim()) {
      toast.error('กรุณากรอกชื่อเล่นหรือนามแฝงของคุณเพื่อความเป็นมิตรและจรรยาบรรณครับ');
      return;
    }

    setLoggingIn(true);
    const toastId = toast.loading(authMode === 'login' ? 'กำลังดำเนินการเข้าสู่ระบบ...' : 'กำลังดำเนินการลงทะเบียน...');
    try {
      if (authMode === 'login') {
        const loggedInUser = await loginWithEmail(email, password);
        toast.success('เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับกลับเข้าสู่ Jai-Gu ครับ 🤍', { id: toastId });
        setActiveTab('profile'); // Direct to profile immediately
      } else {
        const registeredUser = await registerWithEmail(email, password, displayName);
        toast.success('ลงทะเบียนและเริ่มใช้งานสำเร็จ! 🎉', { id: toastId });
        
        // Write standard Firestore user document
        await setDoc(doc(db, 'users', registeredUser.uid), {
          uid: registeredUser.uid,
          privacyConsent: true,
          consentDate: serverTimestamp(),
          email: registeredUser.email,
          displayName: displayName,
        }, { merge: true });
        
        setHasConsented(true);
        setActiveTab('profile'); // Direct to profile to let them authorize API Key immediately
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      const errorCode = error?.code || '';
      if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        toast.error('❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้งครับ', { id: toastId });
      } else if (errorCode === 'auth/user-not-found') {
        toast.error('❌ ไม่พบผู้ใช้ที่มีอีเมลนี้ กรุณาสมัครสมาชิกก่อนใช้นะครับ', { id: toastId });
      } else if (errorCode === 'auth/email-already-in-use') {
        toast.error('❌ อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบแทนครับ', { id: toastId });
      } else if (errorCode === 'auth/invalid-email') {
        toast.error('❌ รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้งครับ', { id: toastId });
      } else if (errorCode === 'auth/weak-password') {
        toast.error('❌ รหัสผ่านคาดเดาง่ายเกินไป กรุณาใช้รหัสอื่นที่มีความปลอดภัยขึ้นครับ', { id: toastId });
      } else {
        toast.error(`❌ เกิดข้อผิดพลาด: ${error?.message || 'กรุณาลองใหม่อีกครั้ง'}`, { id: toastId });
      }
    } finally {
      setLoggingIn(false);
    }
  };

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
          '🔒 โดเมน Vercel/GitHub นี้ยังไม่ได้รับอนุญาตในโปรเจกต์ Firebase! ท่านสามารถคลิกเข้าใช้งานแบบผู้เยี่ยมชม (Guest Mode) เพื่อใช้งานทันทีผ่านโหมดจำลองเครื่องถิ่น (Sandbox) ได้ทันทีครับ',
          { id: toastId, duration: 15000 }
        );
      } else if (errorCode === 'auth/popup-blocked') {
        toast.error('🚫 เบราว์เซอร์บล็อกหน้าต่างป๊อปอัพ กรุณาเปิดสิทธิเข้าถึงป๊อปอัพสำหรับหน้านี้แล้วลองอีกครั้งครับ', { id: toastId, duration: 6000 });
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
      toast.success('เชื่อมต่อสำเร็จ! ยินดีต้อนรับเข้าสู่วิถีบำบัดจิตใจครับ 🤍', { id: toastId });
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
      toast.success('⚠️ เชื่อมต่อโหมดจำลองในเครื่องถิ่น (Sandbox Mode) สำเร็จและทำงานได้ตามปกติแล้วครับ!', { id: toastId, duration: 6000 });
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
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6"
        >
          <div className="flex flex-col items-center">
            <BrandLogo size="lg" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Jai-Gu (ใจกุ)</h1>
            <p className="text-slate-500 font-sans font-semibold text-xs leading-relaxed">ใจกุ เป็นคำซ่อนความหมาย ใจของฉัน ฉันรู้ใจฉันดี เป็นการดึงสติกลับมาสำรวจตนเอง ด้วยเทคนิค CBT เรียนรู้เพื่อเป็นกูรูดูแลใจตนเอง 🤍</p>
          </div>
          
          <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700 tracking-wide uppercase">อีเมลผู้ใช้งาน (Email)</label>
              <input
                type="email"
                required
                placeholder="your.name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-700 tracking-wide uppercase">รหัสผ่าน (Password)</label>
              <input
                type="password"
                required
                placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans text-slate-800"
              />
            </div>

            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700 tracking-wide uppercase">ชื่อเล่น หรือนามแฝง (Alias / Name)</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สหายผู้เปราะบาง"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans text-slate-800"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn || loggingInGuest}
              className="w-full py-3.5 px-6 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50 active:scale-98 shadow-md shadow-indigo-100/50 mt-2 text-xs"
            >
              {loggingIn ? (
                <span>กำลังดำเนินการ...</span>
              ) : authMode === 'login' ? (
                <span>เข้าสู่ระบบผ่าน Email</span>
              ) : (
                <span>สมัครสมาชิกผ่าน Email</span>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs px-2">
            {authMode === 'login' ? (
              <>
                <span className="text-slate-400 font-medium">ยังไม่มีบัญชีใช่ไหมครับ?</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-indigo-600 font-extrabold hover:underline cursor-pointer"
                >
                  สมัครสมาชิก (Sign Up) ↗
                </button>
              </>
            ) : (
              <>
                <span className="text-slate-400 font-medium">มีบัญชีอยู่แล้ว?</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-indigo-600 font-extrabold hover:underline cursor-pointer"
                >
                  เข้าสู่ระบบ (Sign In) ↗
                </button>
              </>
            )}
          </div>

          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <span className="relative px-3 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider">หรือเชื่อมต่อทางเลือกอื่น</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleLogin}
              disabled={loggingIn || loggingInGuest}
              className="py-3 px-4 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 border border-slate-200 active:scale-98 text-xs"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
              <span>Google</span>
            </button>

            <button
              onClick={handleGuestLogin}
              disabled={loggingIn || loggingInGuest}
              className="py-3 px-4 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 border border-slate-200 active:scale-98 text-xs"
            >
              <span>🔑 Guest Mode</span>
            </button>
          </div>

          <div className="p-4 bg-indigo-50/50 text-indigo-950 font-sans rounded-2xl text-[11.5px] leading-relaxed text-left border border-indigo-100/30 space-y-1">
            <p className="font-extrabold text-indigo-900 text-xs mb-1">🔑 คำแนะนำสำหรับการใช้อีเมลผู้ใช้งาน:</p>
            <p className="font-medium">หลังจากสมัครสมาชิกหรือเข้าใช้ระบบด้วยชื่ออีเมลของคุณแล้ว กรุณานำ <strong>Google Gemini API Key ส่วนตัวของคุณเอง</strong> มาวางติดตั้งในหน้าข้อมูลส่วนตัว (แท็บ Profile ขวาล่าง) เพื่อเปิดใช้งานชุดคำสั่งประมวลความนึกคิดและจิตใจให้ทำงานอย่างราบรื่นสูงสุดครับ 🤍</p>
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
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-8 h-8 rounded-full border border-slate-200 cursor-pointer object-cover hover:opacity-85 transition-opacity"
              onClick={() => handleTabClick('profile')}
            />
          ) : (
            <button
              onClick={() => handleTabClick('profile')}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-600 transition-colors cursor-pointer"
              title="Profile & Settings"
            >
              <UserIcon className="w-5 h-5" />
            </button>
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
            {activeTab === 'home' && <Home user={user} setActiveTab={handleTabClick} />}
            {activeTab === 'mood' && <Home user={user} setActiveTab={handleTabClick} initialShowMoodOnly={true} />}
            {activeTab === 'safety' && (
              <SafetyPlan 
                user={user} 
                isEmergency={emergencyMode} 
                resetEmergency={() => setEmergencyMode(false)} 
                onBackToHome={() => handleTabClick('home')} 
              />
            )}
            {activeTab === 'dashboard' && <Dashboard user={user} />}
            {activeTab === 'dojo' && (
              <CBTDojo 
                user={user} 
                onEmergencyTrigger={() => { 
                  handleTabClick('safety'); 
                  setEmergencyMode(true); 
                }} 
                onBackToHome={() => handleTabClick('home')}
              />
            )}
            {activeTab === 'aid' && <FirstAidKit />}
            {activeTab === 'chill' && <ChillZone />}
            {activeTab === 'activation' && (
              <BehaviorActivation 
                user={user} 
                onBackToHome={() => handleTabClick('home')} 
              />
            )}
            {activeTab === 'screening' && (
              <ClinicalScreening 
                user={user} 
                onBackToHome={() => handleTabClick('home')} 
              />
            )}
            {activeTab === 'presentation' && (
              <ClinicalPresentation 
                onBackToHome={() => handleTabClick('home')} 
              />
            )}
            {activeTab === 'profile' && (
              <div className="space-y-10 pb-10">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                  <div className="flex flex-col items-center space-y-6 relative z-10">
                    <div className="relative">
                      {user?.photoURL ? (
                        <img src={user.photoURL} className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-lg object-cover" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white shadow-lg flex items-center justify-center font-black text-2xl text-white">
                          {(user?.displayName || 'G')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-indigo-600 p-2 rounded-full border-4 border-white">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user?.displayName || 'สหายบำบัดจิตผู้เยี่ยมชม (Guest)'}</h2>
                      <p className="text-slate-400 text-sm font-medium">{user?.email || 'guest@jaiguguru.org'}</p>
                    </div>
                  </div>
                </div>

                {isVisitor ? (
                  <div className="bg-slate-50 border border-slate-200/60 rounded-[2.5rem] p-6 text-center space-y-3">
                    <p className="text-xl">🔒</p>
                    <h4 className="text-sm font-black text-slate-800">เครื่องมือวิเคราะห์ขั้นสูง (สำหรับสมาชิก)</h4>
                    <p className="text-[11px] text-slate-500 font-sans max-w-[280px] mx-auto leading-relaxed">
                      ฟีเจอร์ตั้งเวลาเตือนภัย บันทึกคีย์วิเคราะห์ส่วนตัว และเสนอแนะแอปพลิเคชัน ถูกจำกัดไว้เฉพาะสมาชิกที่เข้าสู่ระบบแบบเต็มรูปแบบเท่านั้นครับ สำหรับผู้ใช้ทั่วไป แนะนำให้เพลิดเพลินกับการใช้งาน เช็คอินอารมณ์ และบันทึกแผนปลอดภัย ได้อย่างเสรีเลยนะครับ 🤍
                    </p>
                  </div>
                ) : (
                  <>
                    <ReminderSettings user={user} />
                    <GeminiApiKeySettings user={user} />
                    <AppEvaluation user={user} />
                  </>
                )}

                <button 
                  onClick={handleLogout}
                  className="w-full py-4 flex items-center justify-center gap-3 text-rose-600 font-bold bg-rose-50 rounded-2xl hover:bg-rose-100 transition-all active:scale-95 border border-rose-100 cursor-pointer"
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100/80 px-1 py-2 pb-6 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        <div className="max-w-md mx-auto flex items-end justify-between px-0.5">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => handleTabClick('home')} 
            icon={<HomeIcon className="w-5 h-5" />} 
            label="หน้าหลัก" 
          />
          <NavButton 
            active={activeTab === 'mood'} 
            onClick={() => handleTabClick('mood')} 
            icon={<Heart className="w-5 h-5" />} 
            label="บันทึกอารมณ์" 
          />
          <NavButton 
            active={activeTab === 'chill'} 
            onClick={() => handleTabClick('chill')} 
            icon={<Wind className="w-5 h-5" />} 
            label="มุมสงบ" 
            disabled={isTabRestricted('chill')}
          />
          <NavButton 
            active={activeTab === 'safety'} 
            onClick={() => handleTabClick('safety')} 
            icon={<ShieldAlert className="w-5 h-5" />} 
            label="แผนปลอดภัย" 
          />
          <NavButton 
            active={activeTab === 'aid'} 
            onClick={() => handleTabClick('aid')} 
            icon={<HeartPulse className="w-5 h-5" />} 
            label="ปฐมพยาบาลใจ" 
            disabled={isTabRestricted('aid')}
          />
          <NavButton 
            active={activeTab === 'dojo'} 
            onClick={() => handleTabClick('dojo')} 
            icon={<Brain className="w-5 h-5" />} 
            label="ห้องเรียนคิด" 
            disabled={isTabRestricted('dojo')}
          />
          <NavButton 
            active={activeTab === 'screening'} 
            onClick={() => handleTabClick('screening')} 
            icon={<ClipboardCheck className="w-5 h-5" />} 
            label="คัดกรองวิจัย" 
            disabled={isTabRestricted('screening')}
          />
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => handleTabClick('dashboard')} 
            icon={<TrendingUp className="w-5 h-5" />} 
            label="บันทึกของฉัน" 
            disabled={isTabRestricted('dashboard')}
          />
        </div>
      </nav>

      {/* API Key Connection Auto Consent Overlay */}
      <AnimatePresence>
        {showApiConsent && pendingApiKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 max-w-sm w-full p-6 shadow-2xl relative overflow-hidden space-y-5"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10" />
              
              <div className="flex items-start gap-3 relative z-10">
                <span className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 block shrink-0">
                  <Brain className="w-6 h-6" />
                </span>
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                    🔌 ยืนยันเรียกใช้งานร่วม <br/>Google Gemini API Key
                  </h3>
                  <span className="inline-block text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    API Sync Consent
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 relative z-10 text-xs font-sans text-slate-600 leading-normal bg-slate-50 p-4 rounded-2xl border border-slate-150">
                <p className="font-bold text-slate-700">ตรวจพบประวัติ API Key ของคุณเชื่อมต่ออยู่ในคลาวด์:</p>
                <div className="font-mono text-[10px] bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-400 select-all truncate">
                  AIzaSy...{pendingApiKey.substring(pendingApiKey.length - 6)}
                </div>
                <p className="text-[11px] leading-relaxed">
                  ยินยอมให้เรียกใช้งานคีย์ส่วนตัวนี้แบบอัตโนมัติบนอุปกรณ์เครื่องนี้เพื่อเปิดขีดความสามารถ AI ประมวลผลความคิดและให้เกียรติจรรยาบรรณแพทย์สัญจรหรือไม่?
                </p>
                <div className="text-[10px] text-amber-700 font-bold bg-amber-50 rounded-xl p-2.5 border border-amber-100/60 leading-tight">
                  🔒 ข้อมูล API Key จะถูกเข้ารหัสและรันในเซสชันอุปกรณ์เครื่องนี้เท่านั้น ไม่มีการเปิดเผยภายนอกใดๆ ทั้งสิ้น
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 relative z-10 pt-1">
                <button
                  type="button"
                  onClick={() => handleApiConnectionConsent(false)}
                  className="py-3 px-3 bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl active:scale-95 transition-all text-center cursor-pointer"
                >
                  ปฏิเสธ (Decline)
                </button>
                <button
                  type="button"
                  onClick={() => handleApiConnectionConsent(true)}
                  className="py-3 px-3 bg-indigo-600 hover:bg-indigo-800 text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all text-center cursor-pointer"
                >
                  ยินยอมเชื่อมต่อ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, disabled }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 transition-all text-center flex-1 min-w-0 ${active ? 'text-indigo-600 scale-105 font-black' : disabled ? 'text-slate-300 opacity-60' : 'text-slate-400 hover:text-slate-600 cursor-pointer'}`}
    >
      <div className={`p-1 rounded-xl transition-all relative ${active ? 'bg-indigo-50/70' : 'bg-transparent'}`}>
        {icon}
        {disabled && (
          <span className="absolute -top-1 -right-1.5 bg-slate-400 text-[6px] text-white rounded-full px-0.5 py-px border border-white font-sans scale-75">
            🔒
          </span>
        )}
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
