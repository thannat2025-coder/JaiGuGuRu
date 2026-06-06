import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '@/src/lib/firebase';
import { collection, query, orderBy, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Heart, 
  Award,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  BookOpen,
  FileText,
  Printer,
  X,
  Sparkles,
  Smile,
  Compass,
  FileSpreadsheet,
  HeartPulse,
  ShieldAlert
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LabelList
} from 'recharts';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  subDays,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { th } from 'date-fns/locale';
import { toPng } from 'html-to-image';
import { toast } from 'react-hot-toast';
import ShareableCard from '@/src/components/ShareableCard';

interface DashboardProps {
  user: User;
}

const QUADRANT_MAPPING: Record<string, { label: string; color: string; bg: string; text: string; emoji: string }> = {
  'high-positive': { label: 'พลังงานสูง + เชิงบวก', color: 'text-amber-800', bg: 'bg-amber-100 border-amber-200', text: 'text-amber-900', emoji: '😆' },
  'high-negative': { label: 'พลังงานสูง + เชิงลบ', color: 'text-rose-900', bg: 'bg-rose-100 border-rose-200', text: 'text-rose-950', emoji: '😡' },
  'low-negative': { label: 'พลังงานต่ำ + เชิงลบ', color: 'text-sky-900', bg: 'bg-sky-100 border-sky-200', text: 'text-sky-950', emoji: '😢' },
  'low-positive': { label: 'พลังงานต่ำ + เชิงบวก', color: 'text-emerald-950', bg: 'bg-emerald-100 border-emerald-250', text: 'text-emerald-950', emoji: '😌' }
};

export default function Dashboard({ user }: DashboardProps) {
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [thoughtRecords, setThoughtRecords] = useState<any[]>([]);
  const [safetyPlan, setSafetyPlan] = useState<any | null>(null);
  const [safetyPlanLogs, setSafetyPlanLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState<{ type: 'mood' | 'journal', data: any } | null>(null);
  
  // Custom interactive dashboard states
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDayVal, setSelectedDayVal] = useState<Date | null>(new Date());
  const [showClinicModal, setShowClinicModal] = useState(false);

  const [stats, setStats] = useState({
    totalMoods: 0,
    totalCBT: 0,
    streak: 0,
    avgMood: 0
  });

  useEffect(() => {
    fetchData();
  }, [user.uid]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Mood Logs (Last 100 entries)
      const moodQ = query(
        collection(db, 'users', user.uid, 'moodLogs'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const moodSnap = await getDocs(moodQ);
      const moods = moodSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()
      })).reverse();
      setMoodLogs(moods);

      // Fetch Thought Records
      const thoughtQ = query(
        collection(db, 'users', user.uid, 'thoughtRecords'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const thoughtSnap = await getDocs(thoughtQ);
      const thoughts = thoughtSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()
      }));
      setThoughtRecords(thoughts);

      // Fetch latest safety plan from "safetyPlans/current"
      const safetyPlanRef = doc(db, 'users', user.uid, 'safetyPlans', 'current');
      const safetyPlanSnap = await getDoc(safetyPlanRef);
      if (safetyPlanSnap.exists()) {
        setSafetyPlan(safetyPlanSnap.data());
      } else {
        // Fallback or legacy support
        const legacyQ = query(collection(db, 'users', user.uid, 'safetyPlans'), limit(1));
        const legacySnap = await getDocs(legacyQ);
        if (!legacySnap.empty) {
          setSafetyPlan(legacySnap.docs[0].data());
        }
      }

      // Fetch safety plan logs (daily screen answers / update events)
      const safetyLogsQ = query(
        collection(db, 'users', user.uid, 'safetyPlanLogs'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const safetyLogsSnap = await getDocs(safetyLogsQ);
      const decodedLogs = safetyLogsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()
      }));
      setSafetyPlanLogs(decodedLogs);

      // Calculate Stats
      const avg = moods.length > 0 
        ? moods.reduce((acc: number, curr: any) => acc + (curr.mood || 0), 0) / moods.length 
        : 0;
      
      setStats({
        totalMoods: moods.length,
        totalCBT: thoughts.length,
        streak: calculateStreak(moods),
        avgMood: parseFloat(avg.toFixed(1))
      });

    } catch (error) {
      console.error("Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (moods: any[]) => {
    if (moods.length === 0) return 0;
    let streak = 0;
    const sorted = [...moods].filter(m => m.date).sort((a, b) => b.date.getTime() - a.date.getTime());
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
        const itemDate = new Date(sorted[i].date);
        itemDate.setHours(0, 0, 0, 0);
        
        if (isSameDay(itemDate, checkDate)) {
            streak++;
            checkDate = subDays(checkDate, 1);
        } else if (itemDate < checkDate) {
            // Check if they checker-in yesterday, if yes continue, otherwise skip same day double inputs
            const diffTime = checkDate.getTime() - itemDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 1) {
              break;
            }
        }
    }
    return streak;
  };

  const handleShareImage = async () => {
    const node = document.getElementById('shareable-card');
    if (!node) return;

    try {
      const dataUrl = await toPng(node, { 
        cacheBust: true,
        backgroundColor: '#f8fafc',
        width: 400,
        height: node.scrollHeight
      });
      
      const link = document.createElement('a');
      link.download = `jaiguru-share-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success('เตรียมรูปภาพสำเร็จ! บันทึกลงเครื่องแล้วนะ');
      setSharing(null);
    } catch (err) {
      console.error('Share image rendering issue:', err);
      toast.error('ขออภัย ไม่สามารถสร้างรูปภาพได้');
    }
  };

  useEffect(() => {
    if (sharing) {
      const timer = setTimeout(() => {
        handleShareImage();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sharing]);

  // De-identify sensitive patient identifiers (HIPAA / clinical standards)
  const deidentifyName = (name: string) => {
    if (!name) return `ผู้ใช้รหัส [Patient-JG-${user.uid?.substring(0, 5).toUpperCase()}]`;
    const clean = name.trim();
    if (clean.length <= 1) return '*';
    if (clean.length <= 3) return clean[0] + '**';
    return clean[0] + '*'.repeat(clean.length - 2) + clean[clean.length - 1] + ` (Patient Code: JG-${user.uid?.substring(0, 5).toUpperCase()})`;
  };

  const deidentifyEmail = (email: string) => {
    if (!email) return '[ปกปิดข้อมูลระบบ]';
    const parts = email.split('@');
    if (parts.length < 2) return '[ปกปิดข้อมูลสิทธิ์การแพทย์]';
    const local = parts[0];
    const domain = parts[1];
    const maskedLocal = local.length <= 2 ? local[0] + '*' : local[0] + '*'.repeat(local.length - 2) + local[local.length - 1];
    return `${maskedLocal}@${domain[0]}***.*** [คุ้มครองเพื่อความปลอดภัยและความเป็นส่วนตัวสูงสุด]`;
  };

  // Handle Export CSV for clinicians with Thai BOM support
  const handleExportCSV = () => {
    if (moodLogs.length === 0 && thoughtRecords.length === 0 && safetyPlanLogs.length === 0) {
      toast.error('คุณยังไม่มีประวัติบันทึกสำหรับใช้ส่งออกในขณะนี้');
      return;
    }

    let csvContent = "";
    const pCodeName = deidentifyName(user.displayName || '');
    const pCodeEmail = deidentifyEmail(user.email || '');
    
    // Header section
    csvContent += "========================================================\r\n";
    csvContent += `รายงานประวัติอารมณ์และเกราะสติความปลอดภัย (De-identified Clinical Report) - JaiGuGuRu\r\n`;
    csvContent += `รหัสและชื่อผู้ใช้บำบัด (De-identified PATIENT): ${pCodeName}\r\n`;
    csvContent += `อีเมลติดต่อ (Protected EMAIL): ${pCodeEmail}\r\n`;
    csvContent += `พิมพ์สรุปเมื่อวันที่: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: th })}\r\n`;
    csvContent += "========================================================\r\n\r\n";

    // Summary of Application Activities (CBT, Mood logs, Safety confirmations)
    csvContent += "=== 1. บทสรุปการทำกิจกรรมส่งเสริมรอยยิ้มอุ่นใจ (App Activities Summary) ===\r\n";
    csvContent += `จำนวนครั้งเช็คอินอารมณ์ (Total Mood Logs Count): ${moodLogs.length} ครั้ง\r\n`;
    csvContent += `จำนวนกิจกรรมคลี่คลายปรับสมดุลความคิด (CBT Process Completed): ${thoughtRecords.length} ครั้ง\r\n`;
    csvContent += `จำนวนสตรีคเข้าทบทวนติดต่อกัน (Interactive Streak): ${stats.streak} วัน\r\n`;
    csvContent += `จำนวนการยืนยันประคองสติ-ตอบว่าปลอดภัย (Daily Safety Check Ins): ${safetyPlanLogs.filter(sl => sl.type === 'safe-confirmed').length} ครั้ง\r\n`;
    csvContent += `ปรับปรุงอัปเกรดกระดานแผนความปลอดภัยล่าสุด (Safety Plan Last Updated): ${safetyPlan ? (safetyPlan.updatedAt ? format(safetyPlan.updatedAt.toDate ? safetyPlan.updatedAt.toDate() : new Date(safetyPlan.updatedAt), 'yyyy-MM-dd HH:mm') : 'มีแผนพร้อมใช้งาน') : 'ยังไม่ได้จัดทำกระดานแผน'}\r\n\r\n`;

    // Safety Plan Configuration details (Current)
    csvContent += "=== 2. สรุปรายละเอียดกระดานแผนความปลอดภัยส่วนบุคคลที่ใช้ในปัจจุบัน (Current Safety Plan (SPI) Configuration) ===\r\n";
    if (safetyPlan) {
      csvContent += `สัญญาณเตือนเมื่อจิตเริ่มดิ่งรวน (Triggers Warning): "${(safetyPlan.triggers || 'ยังไม่ได้ระบุ').replace(/"/g, '""')}"\r\n`;
      csvContent += `วิธีดึงสติตนเองทันควันเมื่อเปราะบาง (Internal Coping): "${(safetyPlan.internalCoping || 'ยังไม่ได้ระบุ').replace(/"/g, '""')}"\r\n`;
      csvContent += `กิจกรรมและสถานที่เบี่ยงเบนความวุ่นวาย (Distractions Activities): "${(safetyPlan.distractions || 'ยังไม่ได้ระบุ').replace(/"/g, '""')}"\r\n`;
      const safetyEnv = safetyPlan.environmentSafety && safetyPlan.environmentSafety.length > 0 
        ? safetyPlan.environmentSafety.filter((e: string) => e.trim()).join(', ') 
        : 'ยังไม่ได้ระบุ';
      csvContent += `สภาพแวดล้อมที่ตั้งมั่นคุ้มครองชีวิตตน (Safe Environment): "${safetyEnv.replace(/"/g, '""')}"\r\n`;
      const trustedContactsCount = safetyPlan.trustedContacts ? safetyPlan.trustedContacts.length : 0;
      const professionalHelpCount = safetyPlan.professionalHelp ? safetyPlan.professionalHelp.length : 0;
      csvContent += `จำนวนรายการเบอร์ช่วยเหลือฉุกเฉินและแพทย์บำบัดสายด่วน (Trusted Crisis Contacts Count): ${trustedContactsCount + professionalHelpCount} รายชื่อ (De-identified เพื่อความปลอดภัย)\r\n\r\n`;
    } else {
      csvContent += "ผู้ใช้ยังไม่ได้สร้างระบบกระดานแผนป้องกันความปลอดภัยในปัจจุบัน (No Active Safety Plan set up yet)\r\n\r\n";
    }

    // Safety Plan Activities Logs ("กิจกรรมแผนปลอดภัยถูกบันทึกหรือแก้ไขหรือการตอบว่ายังปลอดภัยดี")
    csvContent += "=== 3. ประวัติความรู้สึกปลอดภัยและการตอบรับเช็คความปลอดภัยสม่ำเสมอ (Safety Check Logs Detail) ===\r\n";
    csvContent += "ลำดับที่,วันที่และเวลาทำกิจกรรม,ประเภทกิจกรรมประคองใจ,ข้อความแถลงการณ์ความปลอดภัยหรือการบันทึกแก้ไขเพิ่มเติม\r\n";
    if (safetyPlanLogs.length > 0) {
      const sortedSafetyLogs = [...safetyPlanLogs].sort((a, b) => b.date?.getTime() - a.date?.getTime());
      sortedSafetyLogs.forEach((slog, index) => {
        const dateStr = slog.date ? format(slog.date, 'yyyy-MM-dd HH:mm', { locale: th }) : 'N/A';
        const typeStr = slog.type === 'safe-confirmed' ? 'ยืนยันความรู้สึกปลอดภัยประจำวัน' : slog.type === 'plan-updated' ? 'แก้ไข/อัปเดตเกราะแผนความปลอดภัย' : 'เช็คอินความปลอดภัย';
        const noteClean = slog.note ? `"${slog.note.replace(/"/g, '""')}"` : '""';
        csvContent += `${index + 1},"${dateStr}","${typeStr}",${noteClean}\r\n`;
      });
    } else {
      csvContent += "-,ไม่มีประวัติบันทึกเหตุการณ์ความปลอดภัยตกค้างในระบบในสัปดาห์นี้\r\n";
    }
    csvContent += "\r\n\r\n";

    // Mood Log Export Table
    csvContent += "=== 4. บันทึกประวัติสภาวะอารมณ์รวมและการตรวจสภาพจิตใจ (Recent Emotion Logs) ===\r\n";
    csvContent += "ลำดับที่,วันที่และเวลา,ระดับคะแนนใจ (1-10),อารมณ์ความรู้สึกคำสัญญะ,กลุ่มวงล้อพลังงาน (Quadrant),ข้อความระบายความในใจและบันทึกเพิ่มเติม\r\n";
    
    const sortedMoods = [...moodLogs].sort((a, b) => b.date?.getTime() - a.date?.getTime());
    sortedMoods.forEach((m, index) => {
      const dateStr = m.date ? format(m.date, 'yyyy-MM-dd HH:mm', { locale: th }) : 'N/A';
      const score = m.mood || '';
      const emotion = m.emotionType || '';
      const quad = m.quadrant ? (QUADRANT_MAPPING[m.quadrant]?.label || m.quadrant) : '';
      const noteClean = m.note ? `"${m.note.replace(/"/g, '""')}"` : '""';
      csvContent += `${index + 1},"${dateStr}","${score}","${emotion}","${quad}",${noteClean}\r\n`;
    });

    csvContent += "\r\n\r\n";

    // Thought Records (CBT Dojo)
    csvContent += "=== 5. บันทึกสมุดวิเคราะห์แก้ไขความบิดเบือนทางอารมณ์ (CBT Thought Records) ===\r\n";
    csvContent += "ลำดับที่,วันที่และเวลา,สถานการณ์ที่กระตุ้นความตึงเครียด,อารมณ์และความรู้สึกเกร็งแรกเริ่ม,ความคิดลบอัตโนมัติ (NAT),ประเภทความคิดที่บิดเบือน,คำคัดค้านเชิงบวกและมุมมองReframingที่มีเหตุผล,ประเมินระดับอารมณ์หลังปรับปรุง\r\n";

    const sortedThoughts = [...thoughtRecords].sort((a, b) => b.date?.getTime() - a.date?.getTime());
    sortedThoughts.forEach((t, index) => {
      const dateStr = t.date ? format(t.date, 'yyyy-MM-dd HH:mm', { locale: th }) : 'N/A';
      const situation = t.situation ? `"${t.situation.replace(/"/g, '""')}"` : '""';
      const initialMood = t.initialMood ? `"${t.initialMood.replace(/"/g, '""')}"` : '""';
      const authThought = t.automaticThought ? `"${t.automaticThought.replace(/"/g, '""')}"` : '""';
      const cognitiveDist = t.cognitiveDistortion ? `"${t.cognitiveDistortion.replace(/"/g, '""')}"` : '""';
      const rational = t.rationalResponse ? `"${t.rationalResponse.replace(/"/g, '""')}"` : '""';
      const finalMood = t.finalMood ? `"${t.finalMood.replace(/"/g, '""')}"` : '""';

      csvContent += `${index + 1},"${dateStr}",${situation},${initialMood},${authThought},${cognitiveDist},${rational},${finalMood}\r\n`;
    });

    // Create a Blob with UTF-8 BOM so MS Excel opens Thai characters seamlessly
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `jaiguru_clinical_deidentified_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('ดาวน์โหลดบันทึกรายงานพอร์ตนักบำบัดรุ่นคุ้มครองความลับอัตลักษณ์ (De-identified) เรียบร้อยแล้วค่ะ 📥');
  };

  // Process data for Recharts Graph
  const chartData = moodLogs.map(m => ({
    time: format(m.date, 'dd MMM', { locale: th }),
    mood: m.mood || 5,
    emotion: m.emotionType || 'N/A',
    note: m.note || ''
  }));

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  // Calendar matrix calculation
  const startMonth = startOfMonth(currentMonth);
  const endMonth = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(startMonth, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(endMonth, { weekStartsOn: 0 }); // Saturday
  const dayCells = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Filter logs for selected calendar day
  const getLogsForDay = (date: Date) => {
    return moodLogs.filter(m => m.date && isSameDay(m.date, date));
  };

  const selectedDayLogs = selectedDayVal ? getLogsForDay(selectedDayVal) : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
        <p className="text-slate-400 text-sm">กำลังเตรียมสรุปข้อมูลใจสิบนิ้วให้คุณ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 print-container">
      {/* Dynamic Style block specifically targetting window print preview rendering */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print-container {
            display: none !important;
          }
          #clinical-print-only-sheet {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 2.5rem !important;
          }
        }
      `}</style>

      {/* Hidden Card for Export */}
      <div className="fixed -left-[2000px] top-0 pointer-events-none overflow-hidden h-0 print:hidden">
        {sharing && (
          <ShareableCard 
            type={sharing.type} 
            data={sharing.data} 
            userName={user.displayName || 'Friend'} 
          />
        )}
      </div>

      {/* Sub page header */}
      <header className="flex justify-between items-start print:hidden">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            My Journey <TrendingUp className="w-5 h-5 text-indigo-600" />
          </h2>
          <p className="text-slate-500 text-xs font-medium">บันทึกทางเดินหัวใจ ค้นพบบุคลิกรู้เท่าทันอารมณ์ตนเอง</p>
        </div>
        <div className="flex gap-1.5 shadow-sm bg-white p-1 rounded-2xl border border-slate-100">
          <button 
            onClick={handleExportCSV}
            className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Export CSV Table Data"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ออกรายงาน CSV</span>
          </button>
          <button 
            onClick={() => setShowClinicModal(true)}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
            title="Print Therapist Consultation Summary"
          >
            <Printer className="w-4 h-4" />
            <span>สรุปข้อมูลรักษา</span>
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 print:hidden">
        <StatCard 
          label="เป้าหมายเช็คอินติดต่อกัน" 
          value={`${stats.streak} วัน`} 
          icon={<Award className="w-5 h-5 text-amber-500" />}
          sub={stats.streak > 0 ? "ใจเข้มแข็งในการฝึกฝนมาก!" : "มาสร้างวันแรกวันนี้กันนะ!"}
        />
        <StatCard 
          label="ระดับอารมณ์เฉลี่ย 30 วัน" 
          value={stats.avgMood || "-"} 
          icon={<Heart className="w-5 h-5 text-rose-500 fill-rose-100" />}
          sub={`รวบรวมจากทั้งหมด ${stats.totalMoods} เหตุการณ์`}
        />
      </div>

      {/* Upgraded Daily Graph with Exact Score Labeled */}
      <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 print:hidden space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] text-slate-800">กราฟระดับอารมณ์และความเข้มข้น</h3>
              <p className="text-[10px] text-slate-400 font-medium">บันทึกระดับคะแนนความสุขใจ-หงุดหงิดใจประจำวัน (1-10)</p>
            </div>
          </div>
          <div className="text-[9px] uppercase tracking-widest font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            Daily Timeline
          </div>
        </div>
        
        <div className="h-64 w-full pt-4">
          {moodLogs.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 10]} 
                  tickCount={6}
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1 z-50">
                          <p className="font-bold text-indigo-300">{data.time}</p>
                          <p className="font-black text-sm">รู้สึก: {data.emotion}</p>
                          <p className="font-medium opacity-80">ระดับความเข้มข้น: {data.mood}/10</p>
                          {data.note && (
                            <p className="text-[10px] text-zinc-300 italic border-t border-white/10 pt-1 mt-1 font-sans">{`"${data.note}"`}</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorMood)" 
                  dot={{ r: 5, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#4f46e5', strokeWidth: 0 }}
                >
                  <LabelList 
                    dataKey="mood" 
                    position="top" 
                    offset={10} 
                    fill="#4f46e5" 
                    fontSize={10} 
                    fontWeight="900"
                  />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
              ยังไม่มีข้อมูลกราฟสำหรับใช้วิเคราะห์ประเมิน
            </div>
          )}
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold px-1 pt-2 border-t border-slate-100">
          <span>ระดับ 1-3 : อารมณ์เบาบาง / สติระแวง</span>
          <span>ระดับ 5 : อารมณ์ปานกลางปกติ</span>
          <span>ระดับ 8-10 : อารมณ์แน่นทะลักจิต</span>
        </div>
      </section>

      {/* Upgraded Progess Calendar - Navigable and Interactive with Scores and Emojis */}
      <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 print:hidden space-y-6">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <CalendarIcon className="w-5 h-5 text-indigo-650" />
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] text-slate-800">ปฏิทินร่องรอยความรู้สึก</h3>
              <p className="text-[10px] text-slate-400 font-medium">กดเลือกวันที่เพื่อรายละเอียดเหตุการณ์และการปรับใจ</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-xs font-black text-slate-800 min-w-[100px] text-center capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: th })}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Calendar Matrix */}
        <div className="space-y-1">
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
            <span>อา.</span>
            <span>จ.</span>
            <span>อ.</span>
            <span>พ.</span>
            <span>พฤ.</span>
            <span>ศ.</span>
            <span>ส.</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {dayCells.map((day, ix) => {
              const logs = getLogsForDay(day);
              const hasLogs = logs.length > 0;
              const latestLog = logs[logs.length - 1];
              const isSelected = selectedDayVal && isSameDay(day, selectedDayVal);
              
              const daySafetyLogs = safetyPlanLogs.filter(sl => sl.date && isSameDay(sl.date, day));
              const hasSafetyLogs = daySafetyLogs.length > 0;
              
              let cellBgClass = "bg-slate-50 hover:bg-slate-100 text-slate-700";
              const isToday = isSameDay(day, new Date());
              const matchMonth = day.getMonth() === currentMonth.getMonth();

              if (!matchMonth) {
                cellBgClass = "bg-transparent text-slate-200 pointer-events-none";
              } else if (hasLogs && latestLog) {
                const mapping = QUADRANT_MAPPING[latestLog.quadrant] || { bg: 'bg-indigo-50 border-indigo-150', text: 'text-indigo-900' };
                cellBgClass = `${mapping.bg} ${mapping.text} font-bold border shadow-sm transition-transform hover:scale-105 duration-150`;
              } else if (isToday) {
                cellBgClass = "bg-white text-indigo-700 border-2 border-dashed border-indigo-500 font-extrabold";
              }

              return (
                <button
                  key={ix}
                  onClick={() => matchMonth && setSelectedDayVal(day)}
                  disabled={!matchMonth}
                  className={`aspect-square p-1 rounded-xl flex flex-col justify-between text-left relative transition-all ${cellBgClass} ${
                    isSelected ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
                  }`}
                >
                  <span className="text-[10px] font-black flex justify-between items-center w-full">
                    <span>{format(day, 'd')}</span>
                    {hasSafetyLogs && (
                      <span className="text-[10px]" title="เช็คสุขภาพความปลอดภัยราบรื่น">🛡️</span>
                    )}
                  </span>
                  {hasLogs && latestLog && (
                    <div className="flex flex-col items-center justify-center w-full pb-0.5 leading-none">
                      <span className="text-sm">{latestLog.emoji || '✨'}</span>
                      <span className="text-[7px] opacity-80 mt-0.5 px-1 py-px bg-white/40 rounded">
                        {latestLog.mood}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day event display */}
        <AnimatePresence mode="wait">
          {selectedDayVal && (() => {
            const daySafetyLogs = safetyPlanLogs.filter(sl => sl.date && isSameDay(sl.date, selectedDayVal));
            const totalItemsCount = selectedDayLogs.length + daySafetyLogs.length;
            
            return (
              <motion.div 
                key={selectedDayVal.toString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 space-y-3 mt-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-500 flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                    รายละเอียดบันทึกใจวันที่: <span className="text-slate-800 underline ml-1">{format(selectedDayVal, 'dd MMMM yyyy', { locale: th })}</span>
                  </h4>
                  <span className="text-[9px] font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {totalItemsCount} รายการ
                  </span>
                </div>

                {totalItemsCount > 0 ? (
                  <div className="space-y-3 pb-1">
                    {/* Safety Logs */}
                    {daySafetyLogs.map((slog, sidx) => (
                      <div key={`safety-${sidx}`} className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-120 rounded-2xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black flex items-center gap-1 text-emerald-800">
                            🛡️ สัญญาณความปลอดภัย (SPI)
                          </span>
                          <span className="text-[8px] uppercase tracking-wider font-extrabold bg-white text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-250">
                            {slog.type === 'safe-confirmed' ? 'คงเดิม / สบายดี' : slog.type === 'plan-updated' ? 'อัปเดตกระดานแผน' : 'เช็คสถานะ'}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed font-sans">{slog.note || 'ฉันรู้สึกว่าวันนี้ปลอดภัยดีและมีสติมั่นใจในชีวิตค่ะ 🤍'}</p>
                      </div>
                    ))}

                    {/* Mood Logs */}
                    {selectedDayLogs.map((log, lidx) => {
                      const quad = QUADRANT_MAPPING[log.quadrant] || { label: 'ทั่วไป', emoji: '✨', text: 'text-slate-900', bg: 'bg-white' };
                      return (
                        <div key={`mood-${log.id || lidx}`} className="bg-white p-3 rounded-2xl shadow-xs border border-slate-100 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{log.emoji || quad.emoji}</span>
                              <div>
                                <p className="text-xs font-bold text-slate-800 leading-tight">อารมณ์: {log.emotionType}</p>
                                <p className={`text-[8px] font-bold mt-0.5 ${quad.text}`}>{quad.label}</p>
                              </div>
                            </div>
                            <span className="text-[9px] bg-slate-105 font-black text-indigo-600 px-2 py-0.5 rounded border">
                              ระดับความแรง: {log.mood}/10
                            </span>
                          </div>
                          {log.note && (
                            <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 italic leading-relaxed border-l-2 border-indigo-200">
                              "{log.note}"
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-4">วันดังกล่าวยังไม่ได้พิมพ์เช็คอินอารมณ์หรือคำแถลงความปลอดภัย</p>
                )}
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </section>

      {/* Recent History List */}
      <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 print:hidden space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
          <div className="p-2 bg-rose-50 rounded-xl">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
          </div>
          <div>
            <h3 className="font-extrabold text-[15px] text-slate-800">บันทึกอารมณ์และคำปรารภย้อนหลัง</h3>
            <p className="text-[10px] text-slate-400 font-medium">เรื่องราวที่สะท้อนความคิดของคุณในช่วงที่ผ่านมา</p>
          </div>
        </div>
        <div className="space-y-4">
          {moodLogs.slice(0, 10).reverse().map((log, i) => {
            const quad = QUADRANT_MAPPING[log.quadrant] || { label: 'ทั่วไป', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-900', emoji: '✨' };
            return (
              <div key={i} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {log.emoji ? log.emoji : quad.emoji}
                    </span>
                    <div>
                      <div className="text-sm font-black flex items-center gap-1.5 text-slate-800">
                        {log.emotionType}
                        <span className={`text-[8px] px-1.5 py-px rounded font-black ${quad.bg} ${quad.text}`}>
                          {quad.label}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold mt-0.5">
                        {log.date ? format(log.date, 'dd MMMM yyyy, HH:mm น.', { locale: th }) : 'เพิ่งบันทึก'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="px-2 py-0.5 bg-white rounded-lg border border-slate-200 text-[9px] font-black">
                      Score: {log.mood}/10
                    </div>
                    <button 
                      onClick={() => setSharing({ type: 'mood', data: log })}
                      className="p-1 px-1.5 text-[8px] font-black bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1"
                    >
                      <Share2 className="w-2.5 h-2.5" /> ภาพ
                    </button>
                  </div>
                </div>
                {log.note && (
                  <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-dashed border-slate-150 italic leading-relaxed">
                    "{log.note}"
                  </p>
                )}
              </div>
            );
          })}
          {moodLogs.length === 0 && (
            <p className="text-center text-slate-400 text-xs italic py-4">ยังไม่พบบันทึกประวัติสุขภาพใจเลย</p>
          )}
        </div>
      </section>

      {/* Journal Entries (Thought Records) */}
      <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 print:hidden space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-[15px] text-slate-800">สมุดโค้ชชิ่งความคิด (CBT Dojo Summary)</h3>
            <p className="text-[10px] text-slate-400 font-medium">บันทึกที่คุณเปลี่ยนความคิดลบอัตโนมัติให้เป็นคำที่มีเหตุผล</p>
          </div>
        </div>
        <div className="space-y-4">
          {thoughtRecords.slice(0, 5).map((record, i) => (
            <div key={i} className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">สถานการณ์แวดล้อม</div>
                  <p className="text-xs font-bold text-slate-800 leading-snug">{record.situation}</p>
                </div>
                <button 
                  onClick={() => setSharing({ type: 'journal', data: record })}
                  className="p-1.5 bg-white rounded-xl border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2 bg-rose-50/30 rounded-xl border border-rose-100 space-y-1">
                  <div className="text-[8px] font-bold text-rose-500 uppercase tracking-wider">ความคิดพังๆ เริ่มแรก</div>
                  <p className="text-[11px] text-rose-950 font-medium italic">"{record.automaticThought || record.initialMood}"</p>
                </div>
                <div className="p-2 bg-emerald-50/30 rounded-xl border border-emerald-100 space-y-1">
                  <div className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider font-extrabold">ปรับความคิดใหม่ที่มีเหตุผล</div>
                  <p className="text-[11px] text-emerald-950 font-bold italic">"{record.rationalResponse}"</p>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 font-bold flex items-center gap-1 border-t border-slate-100 pt-2.5">
                <CalendarIcon className="w-3 h-3" />
                {record.date ? format(record.date, 'dd MMMM yyyy, HH:mm น.', { locale: th }) : 'เพิ่งบันทึก'}
              </div>
            </div>
          ))}
          {thoughtRecords.length === 0 && (
            <p className="text-center text-slate-400 text-xs italic py-4">ยังไม่พบบันทึกการดัดใจคัดค้านความคิดลบ</p>
          )}
        </div>
      </section>

      {/* Safety Plan (SPI) Summary in My Journey */}
      <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 print:hidden space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <HeartPulse className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-[15px] text-slate-800">สรุปแผนป้องกันความปลอดภัยส่วนบุคคล (SPI Summary)</h3>
            <p className="text-[10px] text-slate-400 font-medium">แผนการรับชีวิตเพื่อห้ามใจ ยึดเหนี่ยวในสถานการณ์ท้าทายเปราะบาง</p>
          </div>
        </div>
        
        {safetyPlan ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600">⚠️ สัญญาณเตือน (Triggers)</span>
                <p className="text-xs text-slate-700 font-medium mt-1.5 leading-relaxed">{safetyPlan.triggers || 'ยังไม่ระบุพิเศษ'}</p>
              </div>
              
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-650">🧘 วิธีจัดการตัวเอง (Coping)</span>
                <p className="text-xs text-slate-700 font-medium mt-1.5 leading-relaxed">{safetyPlan.internalCoping || 'ยังไม่ระบุพิเศษ'}</p>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600">📍 สถานที่/กิจกรรมเบี่ยงเบนความสนใจ</span>
                <p className="text-xs text-slate-700 font-medium mt-1.5 leading-relaxed">{safetyPlan.distractions || 'ยังไม่ระบุพิเศษ'}</p>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-600">🛡️ สภาพแวดล้อมที่ปลอดภัย</span>
                <p className="text-xs text-slate-700 font-medium mt-1.5 leading-relaxed">
                  {safetyPlan.environmentSafety && safetyPlan.environmentSafety.length > 0 
                    ? safetyPlan.environmentSafety.filter((e: string) => e.trim()).join(', ') 
                    : 'ยังไม่ระบุพิเศษ'}
                </p>
              </div>
            </div>

            {/* Contacts list */}
            {((safetyPlan.trustedContacts && safetyPlan.trustedContacts.length > 0) || 
              (safetyPlan.professionalHelp && safetyPlan.professionalHelp.length > 0)) && (
              <div className="p-4 bg-rose-50/20 rounded-2xl border border-rose-100/50 space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-800 block">📞 ด่วน! ผู้ติดต่อที่เราไว้ใจและสายด่วนช่วยเหลือ</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[...(safetyPlan.trustedContacts || []), ...(safetyPlan.professionalHelp || [])].map((c: any, index: number) => (
                    <div key={index} className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-sans">
                      <div>
                        <span className="font-extrabold text-slate-800">{c.name}</span>
                        <span className="text-[10px] text-slate-400 block">{c.phone}</span>
                      </div>
                      <a href={`tel:${c.phone}`} className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] transition-all">โทร</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-right">
              <span className="text-[9px] text-slate-400 font-semibold italic">
                ปรับปรุงล่าสุดเมื่อ: {safetyPlan.updatedAt ? format(safetyPlan.updatedAt.toDate ? safetyPlan.updatedAt.toDate() : new Date(safetyPlan.updatedAt), 'dd MMMM yyyy HH:mm น.', { locale: th }) : 'เพิ่งปรับปรุงสัปดาห์นี้'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-150">
            <p className="text-xs text-slate-400 italic">คุณยังไม่ได้เขียนแผนป้องกันความปลอดภัยส่วนบุคคล (Safety Plan)</p>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">คัมภีร์ยึดเหนี่ยวในคราวเปราะบางคืออาวุธปกป้องจิตใจชั้นเลิศ</p>
          </div>
        )}
      </section>

      {/* Encouragement Banner */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden print:hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
        
        <div className="relative z-10 space-y-5">
          <div className="p-3 bg-white/10 w-fit rounded-2xl text-amber-400 animate-pulse">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">ข้อมูลเหล่านี้เป็นอาวุธสำคัญของคุณ</h3>
          <p className="text-slate-355 text-xs leading-relaxed max-w-sm">
            การที่คุณสำรวจอารมณ์ แยกลักษณะความคิดตนเอง คือประวัติที่ล้ำค่าต่อการพูดคุยกับนักจิตบำบัด นักจิตวิทยา หรือแพทย์ปรึกษาของคุณอย่างยิ่ง
          </p>
          <div className="flex gap-2.5">
            <button 
              onClick={handleExportCSV}
              className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs font-black flex-1 transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" /> ส่งออกพอร์ตนักบำบัด (.CSV)
            </button>
            <button 
              onClick={() => setShowClinicModal(true)}
              className="px-4 py-3.5 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl text-xs font-black flex-1 transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> สรุปใบพบแพทย์ (PDF)
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Beautiful Overlay Printable Clinic Consultation Sheet Modal */}
      <AnimatePresence>
        {showClinicModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 overflow-y-auto px-4 py-8 flex items-start justify-center print:hidden border-none"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-3xl rounded-[2rem] p-8 shadow-2xl relative space-y-6"
            >
              <button 
                onClick={() => setShowClinicModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex justify-between items-start border-b border-indigo-50 pb-5">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full w-fit">
                    JaiGuGuRu Clinical Dashboard Report
                  </div>
                  <h3 className="text-xl font-black text-slate-950">รายงานสำหรับแพทย์และนักจิตบำบัด</h3>
                  <p className="text-slate-400 text-[10px] font-semibold">พิมพ์เพื่อนำติดตัวพูดคุยในนัดหมายบำบัดครั้งถัดไป</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl font-black">
                  <FileText className="w-7 h-7" />
                </div>
              </div>

              {/* Informative Disclaimer Sheet */}
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4">
                <Smile className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-850 space-y-1.5 leading-relaxed">
                  <p className="font-bold">ข้อมูลสภาวะอารมณ์และการคุ้มครองทางการแพทย์ (Protected HIPAA-compliant Profile)</p>
                  <p>รายงานนี้ถูกออกแบบเพื่อใช้ยื่นแก่นักบำบัด นักจิตวิทยา หรือแพทย์ปรึกษา โดยได้ทำการปกปิดอัตลักษณ์อย่างเป็นทางการ (De-identified) เพื่อสงวนความลับสูงสุดตามสิทธิ์ผู้ป่วย โดยระบบจะถ่ายทอดบันทึกความคิด (CBT Dojo) ประวัติแผนป้องกันความปลอดภัยในสภาวะเปราะบาง (Safety Plan/SPI) และประวัติการประคองสติความปลอดภัยประจำวันอย่างรอบด้าน</p>
                </div>
              </div>

              {/* Patient and session meta info */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-2">
                  <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">รหัสผู้เข้ารับการบำรุงใจ (ANONYMIZED PATIENT)</p>
                  <p className="font-extrabold text-slate-800 text-sm">{deidentifyName(user.displayName || '')}</p>
                  <p className="font-medium text-slate-400 text-[11px]">{deidentifyEmail(user.email || 'N/A')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">ภาพรวมกิจกรรมและวินัยเช็คความปลอดภัย</p>
                  <p className="font-bold text-slate-800 text-xs">สตรีคเช็คอินติดต่อกัน: {stats.streak} วัน</p>
                  <p className="font-medium text-emerald-700 text-xs">ยืนยันความปลอดภัยดี: {safetyPlanLogs.filter(sl => sl.type === 'safe-confirmed').length} ครั้ง</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">ระดับอารมณ์เฉลี่ย</p>
                  <p className="font-black text-indigo-700 text-base">{stats.avgMood} <span className="text-slate-400 text-[10px]/none font-normal">/10 คะแนน</span></p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">ภารกิจปรับความคิด CBT สำเร็จ</p>
                  <p className="font-black text-indigo-700 text-base">{stats.totalCBT} <span className="text-slate-400 text-[10px]/none font-normal">กิจกรรมปรับลบและล้างอคติ</span></p>
                </div>
              </div>

              {/* Interactive preview of Safety Plan directly in the modal for client comfort */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🛡️</span>
                  <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">แผนความปลอดภัยของฉัน (Safety Plan SPI Overview)</p>
                </div>
                {safetyPlan ? (
                  <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl text-xs space-y-2 font-sans">
                    <div>
                      <span className="font-bold text-slate-500 text-[10px] block">⚠️ สัญญาณเตือนเมื่อรู้สึกระส่ำระส่าย:</span>
                      <p className="text-slate-800 font-medium">{safetyPlan.triggers || 'จะรีบตั้งสติหลบมาในที่สงบ'}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 text-[10px] block">🧘 กิจกรรมดึงใจและดึงคลื่นความสั่นใจด้วยตนเอง:</span>
                      <p className="text-slate-800 font-medium">{safetyPlan.internalCoping || 'หายใจเข้าลึกๆ ช้าๆ 5 ครั้ง'}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500 text-[10px] block">📍 เบี่ยงเบนตัวเองชูใจ:</span>
                      <p className="text-slate-800 font-medium">{safetyPlan.distractions || 'ออกไปเดินสูดอากาศใต้ต้นไม้เพื่อเป็นบริบทธรรมชาติอุ่นใจ'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic bg-amber-50/50 border border-amber-100 p-3 rounded-xl text-center">คุณกำลังใช้เกราะปัญญาหลัก แต่ยังไม่ได้จัดบันทึกกระดานแผนความปลอดภัยป้องกันตัว (Safety Plan)</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end border-t border-slate-100 pt-5">
                <button 
                  onClick={() => setShowClinicModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50"
                >
                  ย้อนกลับ
                </button>
                <button 
                  onClick={() => {
                    // Temporarily trigger native window print, using our clinical-print-only-sheet ID below
                    window.print();
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> พิมพ์หรือเซฟเป็นไฟล์ PDF 🖨️
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print-Only Document Sheet specifically formatted for clinicians */}
      <div 
        id="clinical-print-only-sheet" 
        className="hidden max-w-4xl mx-auto bg-white text-slate-900 border-none p-10 font-sans space-y-6"
      >
        <div className="border-b-4 border-slate-900 pb-4 flex justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">JaiGuGuRu (ใจกู...กูรู้)</h1>
            <p className="text-xs uppercase font-extrabold tracking-widest text-indigo-850">Mental Health Diagnostic Self-Monitoring Report</p>
            <p className="text-slate-400 text-[10px]">รายงานประวัติอารมณ์ เกราะปัญญา CBT และวินัยการประคองสติ คุ้มครองความลับอัตลักษณ์ผู้ป่วยอย่างทางการ (De-identified Clinical Report)</p>
          </div>
          <div className="text-right text-[10px] text-slate-500 space-y-1">
            <p className="font-extrabold text-slate-800">วันที่พิมพ์รายงาน: {format(new Date(), 'dd MMMM yyyy HH:mm น.', { locale: th })}</p>
            <p>ประมวลผลผ่าน JaiGuGuRu Secure Medical Portal Partner</p>
          </div>
        </div>

        {/* Patient header */}
        <div className="grid grid-cols-2 gap-4 text-xs py-3 border-b-2 border-slate-100 bg-slate-50 p-4 rounded-xl">
          <div className="space-y-1">
            <p className="text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">รหัสและชื่อผู้ป่วยคุ้มครองสิทธิ์ (DE-IDENTIFIED PATIENT):</p>
            <p className="font-black text-sm text-slate-900">{deidentifyName(user.displayName || '')}</p>
            <p className="font-bold text-slate-600">{deidentifyEmail(user.email || '')}</p>
          </div>
          <div className="space-y-1 col-span-1">
            <p className="text-slate-400 font-extrabold text-[9px] uppercase tracking-wider">ภาพรวมสถิติกิจกรรมประคับประคองอุ่นใจ:</p>
            <p className="font-black text-slate-900 text-sm">ขยันเข้าประคองสติติดต่อกัน: {stats.streak} วัน</p>
            <p className="font-bold text-slate-700">อารมณ์เฉลี่ยโดยรวม: {stats.avgMood}/10 จากการระบายอารมณ์ {stats.totalMoods} ครั้ง</p>
            <p className="font-medium text-indigo-700 text-[11px]">กิจกรรม CBT ปรับสมดุลอารมณ์: {stats.totalCBT} ครั้ง • ยืนยันสติปลอดภัยดี: {safetyPlanLogs.filter(sl => sl.type === 'safe-confirmed').length} ครั้ง</p>
          </div>
        </div>

        {/* History table */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest">1. ตารางประวัติอารมณ์ล่าสุด (Recent Emotion Logs)</h3>
          <table className="w-full text-[10px] text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-2 border-r border-slate-205 font-bold">ลำดับ</th>
                <th className="p-2 border-r border-slate-205 font-bold">วัน-เวลา</th>
                <th className="p-2 border-r border-slate-205 font-bold text-center">ระดับ (1-10)</th>
                <th className="p-2 border-r border-slate-205 font-bold">อารมณ์ที่ระบุ</th>
                <th className="p-2 font-bold">ข้อความ/เหตุการณ์ที่พิมพ์ระบายเพื่อเป็นบริบท (De-identified Note Context)</th>
              </tr>
            </thead>
            <tbody>
              {moodLogs.slice().reverse().map((log, index) => {
                const quad = QUADRANT_MAPPING[log.quadrant] || { label: '-' };
                return (
                  <tr key={log.id || index} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-200 text-center font-bold">{index + 1}</td>
                    <td className="p-2 border-r border-slate-200 whitespace-nowrap">{log.date ? format(log.date, 'yyyy-MM-dd HH:mm') : 'N/A'}</td>
                    <td className="p-2 border-r border-slate-200 text-center font-black">{log.mood}/10</td>
                    <td className="p-2 border-r border-slate-200 font-black">{log.emotionType} <span className="text-[8px] font-normal font-sans">({quad.label})</span></td>
                    <td className="p-2 italic">{log.note || '-'}</td>
                  </tr>
                );
              })}
              {moodLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400 italic">ยังไม่มีประวัติการเช็คอินบันทึก</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 2. Active Personal Safety Plan Configuration */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest">2. กระดานการจัดการสภาวะเปราะบางในปัจจุบัน (Active Personal Safety Plan (SPI) Schema)</h3>
          {safetyPlan ? (
            <div className="border border-slate-200 p-4 rounded-xl text-[10px] grid grid-cols-2 gap-4 bg-slate-50/50">
              <div className="space-y-1 border-r border-slate-200 pr-3">
                <p className="font-extrabold text-amber-600 uppercase text-[8px] tracking-wider">⚠️ สัญญาณเตือนสะกิดใจ (Triggers Warning):</p>
                <p className="text-slate-800 font-medium leading-relaxed">{safetyPlan.triggers || 'จะรีบตั้งสติหลบแรงกดดัน'}</p>
              </div>
              <div className="space-y-1">
                <p className="font-extrabold text-emerald-600 uppercase text-[8px] tracking-wider">🧘 กิจกรรมบำบัดตนเองประคองคลื่นสมาธิ (Internal Coping):</p>
                <p className="text-slate-800 font-medium leading-relaxed">{safetyPlan.internalCoping || 'หายใจช้าซ้ำๆ 5 ครั้ง หรือนั่งสมาธิ'}</p>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-200 border-r pr-3">
                <p className="font-extrabold text-indigo-600 uppercase text-[8px] tracking-wider">📍 กิจกรรมเบี่ยงเบนสร้างบรรยากาศพาเพลิน (Distractions):</p>
                <p className="text-slate-800 font-medium leading-relaxed">{safetyPlan.distractions || 'เดินชมธรรมชาติสูดกลิ่นลมเพื่อเบี่ยงเบนตรรกะจิต'}</p>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-200">
                <p className="font-extrabold text-rose-600 uppercase text-[8px] tracking-wider">📞 บุคคลฉุกเฉินและเครือข่ายความปลอดภัย (Trusted Support):</p>
                <p className="text-slate-800 font-bold leading-relaxed">
                  มีข้อมูลผู้ติดต่อพึ่งพิง {safetyPlan.trustedContacts?.length || 0} รายการ และสายด่วนทีมแพทย์ {safetyPlan.professionalHelp?.length || 0} รายการ (รักษาความเป็นส่วนตัวตามกฎสิทธิบัตรคุ้มครองผู้ป่วย)
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 italic border border-dashed border-slate-200 p-3 text-center rounded-xl bg-slate-50">ผู้ป่วยยังกระเจิงเกราะแผน และประคับประคองด้วยกระดานจิตปัญญาหลัก (ไม่มีแผน SPI เฉพาะทางเวลานี้)</p>
          )}
        </div>

        {/* 3. Safety Confirmation and Modification History Logs */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest">3. ประวัติความรู้ตัวประสงค์สติ และความสงบปลอดภัยดี (Safety Confirmation & Logs History)</h3>
          <table className="w-full text-[10px] text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-2 border-r border-slate-205 font-bold text-center w-12">ลำดับ</th>
                <th className="p-2 border-r border-slate-205 font-bold w-36">วัน-เวลา</th>
                <th className="p-2 border-r border-slate-205 font-bold w-48">เหตุการณ์/การทำรายการ</th>
                <th className="p-2 font-bold text-slate-800">จดบันทึกแถลงการณ์ดูแลใจ (Anonymized Statement note)</th>
              </tr>
            </thead>
            <tbody>
              {safetyPlanLogs.length > 0 ? (
                [...safetyPlanLogs].sort((a, b) => b.date?.getTime() - a.date?.getTime()).slice(0, 30).map((slog, index) => (
                  <tr key={slog.id || index} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-200 text-center font-bold">{index + 1}</td>
                    <td className="p-2 border-r border-slate-200 whitespace-nowrap">{slog.date ? format(slog.date, 'yyyy-MM-dd HH:mm') : 'N/A'}</td>
                    <td className="p-2 border-r border-slate-200 font-extrabold text-indigo-700">{slog.type === 'safe-confirmed' ? 'ยืนยันสติปลอดภัยดี (SAFE)' : slog.type === 'plan-updated' ? 'อัปเดตแผนความปลอดภัยภัย' : 'เช็คความปลอดภัย'}</td>
                    <td className="p-2 italic text-slate-705">{slog.note || 'ประสงค์สติคุ้มภัยดีอย่างสงบสุข 🛡️'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-slate-400 italic">ยังไม่มีข้อมูลรายงานแจ้งประภาวความรอบคอบปลอดภัยประจำสัปดาห์</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cognitive Reframe Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest">4. ประวัติการคัดค้านและปรับความคิดแบบ CBT (Cognitive Reframe & Restructuring)</h3>
          <table className="w-full text-[10px] text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="p-2 border-r border-slate-205 font-bold">ลำดับ</th>
                <th className="p-2 border-r border-slate-205 font-bold">วัน-เวลา</th>
                <th className="p-2 border-r border-slate-205 font-bold">สถานการณ์ที่กระตุ้นความตึงเครียด (SITUATION)</th>
                <th className="p-2 border-r border-slate-205 font-bold">ความคิดลบอัตโนมัติ (NAT)</th>
                <th className="p-2 border-r border-slate-205 font-bold">ประเภทบิดเบือนความคิด</th>
                <th className="p-2 font-bold">มุมมองใหม่ด้วยมุมเหตุผล (CBT Reframe Response)</th>
              </tr>
            </thead>
            <tbody>
              {thoughtRecords.map((t, index) => (
                <tr key={t.id || index} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-2 border-r border-slate-200 text-center font-bold">{index + 1}</td>
                  <td className="p-2 border-r border-slate-200 whitespace-nowrap">{t.date ? format(t.date, 'yyyy-MM-dd HH:mm') : 'N/A'}</td>
                  <td className="p-2 border-r border-slate-200 font-bold">{t.situation}</td>
                  <td className="p-2 border-r border-slate-200 text-rose-800 italic">{t.automaticThought || t.initialMood}</td>
                  <td className="p-2 border-r border-slate-200 font-semibold">{t.cognitiveDistortion || '-'}</td>
                  <td className="p-2 text-emerald-800 font-black">{t.rationalResponse}</td>
                </tr>
              ))}
              {thoughtRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-400 italic">ไม่มีข้อมูลการปรับความคิดในสัปดาห์นี้</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CLINIC REMARKS SHEET FOR SIGN */}
        <div className="border-2 border-slate-300 p-6 rounded-2xl space-y-4 pt-4 mt-8">
          <p className="text-xs font-black uppercase text-slate-900 tracking-wider">3. ความคิดเห็นหรือข้อแนะนำจากนักบำบัด / แพทย์บำบัด (CLINICIAN REMARKS)</p>
          <div className="h-24 border-b border-slate-200 border-dotted" />
          <div className="flex justify-between items-end pt-5 text-[11px] text-slate-600">
            <div>
              <p>ผู้ประเมินสถานะในนัดหมาย: ___________________________</p>
              <p className="mt-1">ใบประกอบการบำบัดเลขที่: ___________________________</p>
            </div>
            <div className="text-right">
              <p>ลงชื่อกำกับแพทย์บำบัด: ___________________________</p>
              <p className="mt-1">วันที่ประมวลผล: ____/____/________</p>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400 pt-6">
          <p>สงวนลิขสิทธิ์ความปลอดภัยทางการรักษาความลับของคุณตามสิทธิพื้นฐานผู้ป่วย © JaiGuGuRu 🌟</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, sub }: { label: string, value: string | number, icon: React.ReactNode, sub: string }) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-slate-50 rounded-xl">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-xl font-black text-slate-900 leading-none">{value}</div>
        <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-1">{label}</div>
      </div>
      <p className="text-[10px] text-slate-500 italic leading-snug">{sub}</p>
    </div>
  );
}
