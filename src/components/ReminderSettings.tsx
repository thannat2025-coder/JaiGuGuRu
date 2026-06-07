import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Check,
  X,
  Heart,
  Brain,
  Target,
  Settings2
} from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface Reminder {
  id: string;
  title: string;
  type: 'mood' | 'goal' | 'meditation' | 'custom';
  time: string;
  days: string[];
  enabled: boolean;
}

interface ReminderSettingsProps {
  user: User;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS: Record<string, string> = {
  'Mon': 'จ.', 'Tue': 'อ.', 'Wed': 'พ.', 'Thu': 'พฤ.', 'Fri': 'ศ.', 'Sat': 'ส.', 'Sun': 'อา.'
};

export default function ReminderSettings({ user }: ReminderSettingsProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // New Reminder State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<Reminder['type']>('mood');
  const [newTime, setNewTime] = useState('09:00');
  const [newDays, setNewDays] = useState<string[]>(DAYS);

  useEffect(() => {
    if (user.uid.startsWith('local_')) {
      const saved = localStorage.getItem(`reminders_${user.uid}`) || '[]';
      setReminders(JSON.parse(saved));
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'reminders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reminder[];
      setReminders(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      toast.error('กรุณาระบุหัวข้อการแจ้งเตือน');
      return;
    }

    try {
      if (user.uid.startsWith('local_')) {
        const saved = localStorage.getItem(`reminders_${user.uid}`) || '[]';
        const list = JSON.parse(saved);
        const newRem = {
          id: 'rem_' + Date.now(),
          userId: user.uid,
          title: newTitle,
          type: newType,
          time: newTime,
          days: newDays,
          enabled: true,
          createdAt: new Date().toISOString()
        };
        const updated = [newRem, ...list];
        localStorage.setItem(`reminders_${user.uid}`, JSON.stringify(updated));
        setReminders(updated);
        setIsAdding(false);
        resetNewForm();
        toast.success('เพิ่มการแจ้งเตือนสำเร็จ');
        return;
      }

      await addDoc(collection(db, 'users', user.uid, 'reminders'), {
        userId: user.uid,
        title: newTitle,
        type: newType,
        time: newTime,
        days: newDays,
        enabled: true,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      resetNewForm();
      toast.success('เพิ่มการแจ้งเตือนสำเร็จ');
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast.error('ไม่สามารถเพิ่มการแจ้งเตือนได้');
    }
  };

  const resetNewForm = () => {
    setNewTitle('');
    setNewType('mood');
    setNewTime('09:00');
    setNewDays(DAYS);
  };

  const toggleReminder = async (id: string, enabled: boolean) => {
    try {
      if (user.uid.startsWith('local_')) {
        const saved = localStorage.getItem(`reminders_${user.uid}`) || '[]';
        const list = JSON.parse(saved) as Reminder[];
        const updated = list.map(r => r.id === id ? { ...r, enabled: !enabled } : r);
        localStorage.setItem(`reminders_${user.uid}`, JSON.stringify(updated));
        setReminders(updated);
        return;
      }

      await updateDoc(doc(db, 'users', user.uid, 'reminders', id), {
        enabled: !enabled
      });
    } catch (error) {
      console.error("Error toggling reminder:", error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      if (user.uid.startsWith('local_')) {
        const saved = localStorage.getItem(`reminders_${user.uid}`) || '[]';
        const list = JSON.parse(saved) as Reminder[];
        const updated = list.filter(r => r.id !== id);
        localStorage.setItem(`reminders_${user.uid}`, JSON.stringify(updated));
        setReminders(updated);
        toast.success('ลบการแจ้งเตือนแล้ว');
        return;
      }

      await deleteDoc(doc(db, 'users', user.uid, 'reminders', id));
      toast.success('ลบการแจ้งเตือนแล้ว');
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const toggleDay = (day: string) => {
    if (newDays.includes(day)) {
      setNewDays(newDays.filter(d => d !== day));
    } else {
      setNewDays([...newDays, day]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mood': return <Heart className="w-4 h-4" />;
      case 'goal': return <Target className="w-4 h-4" />;
      case 'meditation': return <Brain className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mood': return 'บันทึกอารมณ์';
      case 'goal': return 'เช็คอินเป้าหมาย';
      case 'meditation': return 'ฝึกสมาธิ';
      default: return 'อื่นๆ';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-bold text-slate-900">การแจ้งเตือนส่วนตัว</h2>
          <p className="text-sm text-slate-500">ดูแลใจให้สม่ำเสมอ ด้วยการเตือนตัวเอง</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-white rounded-[2rem] p-6 shadow-xl border border-indigo-50 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-600" />
                สร้างการแจ้งเตือนใหม่
              </h3>
              <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">หัวข้อ</label>
                <input 
                  type="text"
                  placeholder="เช่น บันทึกใจก่อนนอน..."
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all text-sm"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">ประเภท</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none text-sm appearance-none"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as Reminder['type'])}
                  >
                    <option value="mood">บันทึกอารมณ์</option>
                    <option value="goal">เป้าหมาย</option>
                    <option value="meditation">ฝึกสมาธิ</option>
                    <option value="custom">กำหนดเอง</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">เวลา</label>
                  <div className="relative">
                    <input 
                      type="time"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none text-sm"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">วันที่ต้องการเตือน</label>
                <div className="flex justify-between">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`w-9 h-9 rounded-full text-[10px] font-bold transition-all ${newDays.includes(day) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAdd}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                บันทึกการแจ้งเตือน
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">กำลังโหลดความจำ...</p>
          </div>
        ) : reminders.length === 0 && !isAdding ? (
          <div className="py-20 text-center space-y-4 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Bell className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-900 font-bold">ยังไม่มีการแจ้งเตือนเลย</p>
              <p className="text-slate-400 text-xs">ลองกดปุ่ม + ด้านบนเพื่อเริ่มดูแลตัวเองนะ</p>
            </div>
          </div>
        ) : (
          reminders.map((reminder) => (
            <motion.div 
              layout
              key={reminder.id}
              className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${reminder.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                  {getTypeIcon(reminder.type)}
                </div>
                <div>
                  <h4 className={`font-bold transition-all ${reminder.enabled ? 'text-slate-900' : 'text-slate-400'}`}>
                    {reminder.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[10px] bg-slate-50 px-2 py-0.5 rounded-full text-slate-500">
                      <Clock className="w-3 h-3" /> {reminder.time}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                      {reminder.days.length === 7 ? 'ทุกวัน' : reminder.days.map(d => DAY_LABELS[d]).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => deleteReminder(reminder.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleReminder(reminder.id, reminder.enabled)}
                  className={`w-12 h-6 rounded-full relative transition-all ${reminder.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <motion.div 
                    animate={{ x: reminder.enabled ? 24 : 4 }}
                    className="w-4 h-4 bg-white rounded-full absolute top-1"
                  />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
