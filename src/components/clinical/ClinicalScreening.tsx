import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Heart, User, CheckCircle2, ChevronRight, HelpCircle, Lock, Clipboard, ArrowRight, Activity, Award, Sparkles, Send, AlertTriangle, Play, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ClinicalScreeningProps {
  user: any;
  onBackToHome?: () => void;
  onCompleteInitial?: () => void;
}

const CHECKPOINTS = [
  { index: 0, label: 'ครั้งที่ 1: Baseline (ก่อนเริ่มต้นใช้งานแอปฯ)', schedule: 'ทันทีเมื่อเริ่มใช้งาน' },
  { index: 1, label: 'ครั้งที่ 2: สัปดาห์ที่ 1', schedule: 'เมื่อใช้งานครบ 1 สัปดาห์' },
  { index: 2, label: 'ครั้งที่ 3: สัปดาห์ที่ 2', schedule: 'เมื่อใช้งานครบ 2 สัปดาห์' },
  { index: 3, label: 'ครั้งที่ 4: สัปดาห์ที่ 4', schedule: 'เมื่อใช้งานครบ 4 สัปดาห์' },
  { index: 4, label: 'ครั้งที่ 5: สัปดาห์ที่ 6', schedule: 'เมื่อใช้งานครบ 6 สัปดาห์' },
  { index: 5, label: 'ครั้งที่ 6: สัปดาห์ที่ 10', schedule: 'เมื่อใช้งานครบ 10 สัปดาห์' },
  { index: 6, label: 'ครั้งที่ 7: สัปดาห์ที่ 14', schedule: 'เมื่อใช้งานครบ 14 สัปดาห์' },
  { index: 7, label: 'ครั้งที่ 8: สัปดาห์ที่ 24 (ประเมินสรุปผล)', schedule: 'เมื่อใช้งานครบ 24 สัปดาห์' }
];

const THAI_PROVINCES = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", 
  "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", 
  "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", "ปราจีนบุรี", 
  "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", "แพร่", "พะเยา", 
  "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยะลา", "ยโสธร", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", 
  "ลำปาง", "ลำพูน", "เลย", "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", 
  "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", 
  "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี", "อุบลราชธานี"
].sort();

// DASS-21 Thai questions
const DASS21_QUESTIONS = [
  { id: 1, text: "ฉันรู้สึกใจคอไม่ค่อยดี หรือเบื่อ/หงุดหงิดง่ายกว่าปกติ", category: "S" },
  { id: 2, text: "ฉันรู้สึกปากแห้ง คอแห้ง", category: "A" },
  { id: 3, text: "ฉันไม่รู้สึกเลยว่ามีความหวังหรือมีสิ่งดีๆ ในวันข้างหน้ารอบตัวฉัน", category: "D" },
  { id: 4, text: "ฉันหายใจหืดหอบหรือหายใจหงุดหงิดลำบาก (เช่น หายใจพ่นเป็นพักๆ หายใจไม่อิ่ม)", category: "A" },
  { id: 5, text: "ฉันรู้สึกว่ามันยากเย็นจนไม่มีแรงบันดาลใจที่จะริเริ่มทำสิ่งใดๆ", category: "D" },
  { id: 6, text: "ฉันมักมีปฏิกิริยาโต้ตอบต่อสถานการณ์ต่างๆ รุนแรงเกินปกติ", category: "S" },
  { id: 7, text: "ฉันรู้สึกมือสั่น ตัวสั่น หรือเมื่อยล้าเกร็งกล้ามเนื้อ", category: "A" },
  { id: 8, text: "ฉันรู้สึกว่าฉันเกร็ง ตึงเครียด และกระวนกระวายใจอยู่ตลอดเวลา", category: "S" },
  { id: 9, text: "ฉันกังวลใจกับกลัวเกินเหตุกับเหตุการณ์ที่อาจทำให้ฉันดูอับอายขายหน้า", category: "A" },
  { id: 10, text: "ฉันรู้สึกว่าตนไม่มีความสุขหรือมองไม่เห็นว่าจะมีสิ่งคุ้มค่าใดๆ เกิดขึ้นในอนาคต", category: "D" },
  { id: 11, text: "ฉันพบว่าตัวเองมอดไหม้ หงุดหงิด และว้าวุ่นใจได้ง่ายขึ้น", category: "S" },
  { id: 12, text: "ฉันรู้สึกกระสับกระส่าย ขาดความสงบเย็น และตื่นตระหนกตกใจได้ง่าย", category: "S" },
  { id: 13, text: "ฉันรู้สึกท้อแท้ หม่นหมอง อับจนหนทาง หรือขาดความร่าเริงแช่มชื่น", category: "D" },
  { id: 14, text: "ฉันทนรับเรื่องราวขัดใจหรือสิ่งขวางเป้าหมายได้น้อย (หงุดหงิดโมโหง่าย)", category: "S" },
  { id: 15, text: "ฉันรู้สึกเหมือนใจกำลังจะขาดหรือจะเหนื่อยหอบในสถานการณ์ธรรมดา", category: "A" },
  { id: 16, text: "ฉันเหี่ยวเฉา ขยับใจไม่ได้ ขาดความหมายในชีวิตแวดล้อม", category: "D" },
  { id: 17, text: "ฉันรู้สึกว่าฉันไม่มีคุณค่าหรือไม่สมควรคิดว่าทำอะไรสำเร็จเลยสักอย่าง", category: "D" },
  { id: 18, text: "ฉันรู้สึกหวั่นไหวง่าย เครียด ร้อนใจ ไม่กล้าเผชิญหน้า", category: "S" },
  { id: 19, text: "ฉันมีสภาวะใจเต้นรัว สั่นรัว หรือมีเหงื่อซึมโดยไม่มีกิจกรรมหนักทางกาย", category: "A" },
  { id: 20, text: "ฉันเกิดกลัวอย่างไร้แรงผลักดัน ชวนให้ใจดิ่งลึกกังวลเรื่อยเปื่อย", category: "A" },
  { id: 21, text: "ฉันรู้สึกว่าการมีชีวิตอยู่ไม่มีแก่นแกนร่มเงาที่ประคองรอยยิ้มได้เลยสักนิด", category: "D" }
];

// PHQ-A questions
const PHQA_QUESTIONS = [
  { id: 1, text: "มีความสนใจหรือความเพลิดเพลินใจในการทำกิจกรรมสิ่งต่างๆ น้อยลง" },
  { id: 2, text: "รู้สึกไม่สบายใจ ดิ่ง เศร้า ซึม หรือหมดหวังอย่างดิ่งลึก" },
  { id: 3, text: "หลับยาก หลับๆ ตื่นๆ บ่อย หรือนอนหลับพักผ่อนมากเกินไป" },
  { id: 4, text: "รู้สึกเหนื่อยเพลีย ไม่มีเรี่ยวแรง ร่างกายอิดโรยหมดพลังงาน" },
  { id: 5, text: "เบื่ออาหาร เบื่อเคี้ยว หรือกินอาหารมากเกินไปทดแทนอารมณ์" },
  { id: 6, text: "รู้สึกไม่ดีกับตัวเอง คิดว่าตัวเองล้มเหลว หรือทำให้ตัวคุณและครอบครัวผิดหวัง" },
  { id: 7, text: "ขาดสมาธิในการทำกิจกรรมต่างๆ เช่น การทำงานส่งครู/บ่มจิตใจ หรืออ่านหนังสือ" },
  { id: 8, text: "พูดช้าหรือทำอะไรเชื่องช้าลงจนคนรอบข้างสังเกตได้ชัด หรือฟุ้งซ่านกระเง้ากระงอดไม่หยุด" },
  { id: 9, text: "คิดอยากทำร้ายตนเองหรือคิดว่าหากคุณจากโลกนี้ไปเสียจะดีกว่า" }
];

export default function ClinicalScreening({ user, onBackToHome, onCompleteInitial }: ClinicalScreeningProps) {
  // Navigation stages: 'welcome' | 'demographics' | 'dass21' | 'phqa' | 'bnssiat' | 'completed' | 'history'
  const [currentStage, setCurrentStage] = useState<'welcome' | 'demographics' | 'dass21' | 'phqa' | 'bnssiat' | 'completed' | 'history'>('welcome');
  
  // Stored states
  const [demographics, setDemographics] = useState<any | null>(null);
  const [screeningLogs, setScreeningLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState<number>(0);
  const [consentCheck, setConsentCheck] = useState<boolean>(false);

  // Demographic Form State
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  const [studentYear, setStudentYear] = useState('');
  const [province, setProvince] = useState('');
  const [medicalIllness, setMedicalIllness] = useState('');
  const [psychiatricMedication, setPsychiatricMedication] = useState('no'); // 'no' | 'yes'
  const [psychiatricMedicationDetails, setPsychiatricMedicationDetails] = useState('');

  // Questionnaire States
  const [dassAnswers, setDassAnswers] = useState<Record<number, number>>({});
  const [phqAnswers, setPhqAnswers] = useState<Record<number, number>>({});
  
  // BNSSI-AT States
  const [hasNsi, setHasNsi] = useState<boolean | null>(null);
  const [nsiMethods, setNsiMethods] = useState<string[]>([]);
  const [otherMethodText, setOtherMethodText] = useState('');
  const [nsiFrequency, setNsiFrequency] = useState('');
  const [nsiReasons, setNsiReasons] = useState<string[]>([]);
  const [otherReasonText, setOtherReasonText] = useState('');
  const [nsiSeverity, setNsiSeverity] = useState<number>(0);

  useEffect(() => {
    fetchClinicalData();
  }, [user.uid]);

  const fetchClinicalData = async () => {
    setLoading(true);
    try {
      if (user.uid.startsWith('local_')) {
        // Load demographical data
        const localDemo = localStorage.getItem(`clinical_demo_${user.uid}`);
        if (localDemo) {
          const parsed = JSON.parse(localDemo);
          setDemographics(parsed);
          setGender(parsed.gender || '');
          setAge(parsed.age?.toString() || '');
          setOccupation(parsed.occupation || '');
          setStudentYear(parsed.studentYear || '');
          setProvince(parsed.province || '');
          setMedicalIllness(parsed.medicalIllness || '');
          setPsychiatricMedication(parsed.psychiatricMedication?.startsWith('yes') ? 'yes' : 'no');
          setPsychiatricMedicationDetails(parsed.psychiatricMedication || '');
          setConsentCheck(parsed.consented || false);
        }

        // Load screenings
        const localScreenings = JSON.parse(localStorage.getItem(`clinical_screenings_${user.uid}`) || '[]');
        setScreeningLogs(localScreenings);
        
        // Find next checkpoint index
        const totalCompleted = localScreenings.length;
        setActiveCheckpointIndex(Math.min(totalCompleted, 7));

        if (!localDemo) {
          setCurrentStage('welcome');
        } else if (totalCompleted === 0) {
          setCurrentStage('dass21');
        } else {
          setCurrentStage('history');
        }
        setLoading(false);
        return;
      }

      // Read from Firestore for authenticated user
      const demoRef = doc(db, 'users', user.uid, 'researchDemographics', 'current');
      const demoPath = `users/${user.uid}/researchDemographics/current`;
      let demoSnap;
      try {
        demoSnap = await getDoc(demoRef);
        if (demoSnap.exists()) {
          const parsed = demoSnap.data();
          setDemographics(parsed);
          setGender(parsed.gender || '');
          setAge(parsed.age?.toString() || '');
          setOccupation(parsed.occupation || '');
          setStudentYear(parsed.studentYear || '');
          setProvince(parsed.province || '');
          setMedicalIllness(parsed.medicalIllness || '');
          setPsychiatricMedication(parsed.psychiatricMedication && parsed.psychiatricMedication !== 'ไม่มี' ? 'yes' : 'no');
          setPsychiatricMedicationDetails(parsed.psychiatricMedication || '');
          setConsentCheck(parsed.consented || false);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, demoPath);
      }

      const screeningPath = `users/${user.uid}/screeningHistory`;
      try {
        const screenQ = query(collection(db, 'users', user.uid, 'screeningHistory'), orderBy('checkpointIndex', 'asc'));
        const screenSnap = await getDocs(screenQ);
        const screenings = screenSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().createdAt?.toDate() || new Date()
        }));
        setScreeningLogs(screenings);

        const totalCompleted = screenings.length;
        setActiveCheckpointIndex(Math.min(totalCompleted, 7));

        if (!demoSnap || !demoSnap.exists()) {
          setCurrentStage('welcome');
        } else if (totalCompleted === 0) {
          setCurrentStage('dass21');
        } else {
          setCurrentStage('history');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, screeningPath);
      }

    } catch (error) {
      console.error("Clinical Screening retrieval error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentAccept = () => {
    if (!consentCheck) {
      toast.error('กรุณากดกล่องยินยอมเข้าร่วมโครงการวิจัยก่อนดำเนินการค่ะ');
      return;
    }
    setCurrentStage('demographics');
  };

  const submitDemographics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender || !age || !occupation || !province) {
      toast.error('กรุณากรอกข้อมูลดั้งเดิมที่มีความสอดคล้องกันให้ครบถ้วนด้วยนะคะ');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      toast.error('อายุไม่อยู่ในระดับข้อมูลที่เป็นจริง กรุณาเปลี่ยนด้วยค่ะ');
      return;
    }

    if (occupation === 'นักเรียน/นิสิตนักศึกษา' && !studentYear) {
      toast.error('กรุณาระบุชั้นเรียนหรือรายละเอียดนิสิตศึกษาด้วยค่ะ');
      return;
    }

    const demoPayload = {
      userId: user.uid,
      consented: true,
      consentDate: new Date().toISOString(),
      gender,
      age: ageNum,
      occupation,
      studentYear: occupation === 'นักเรียน/นิสิตนักศึกษา' ? studentYear : '',
      province,
      medicalIllness: medicalIllness || 'ไม่มี',
      psychiatricMedication: psychiatricMedication === 'yes' ? (psychiatricMedicationDetails || 'มีทานยาอยู่') : 'ไม่มี',
      createdAt: new Date().toISOString()
    };

    setLoading(true);
    try {
      if (user.uid.startsWith('local_')) {
        localStorage.setItem(`clinical_demo_${user.uid}`, JSON.stringify(demoPayload));
        setDemographics(demoPayload);
        toast.success('บันทึกข้อมูลทั่วไปเรียบร้อยแล้วค่ะ! เริ่มทำการประเมินรอยยิ้มอุ่นใจ Baseline กันนะคะ');
        setCurrentStage('dass21');
      } else {
        await setDoc(doc(db, 'users', user.uid, 'researchDemographics', 'current'), demoPayload);
        setDemographics(demoPayload);
        toast.success('บันทึกข้อมูลประวัติสมดุลใจเรียบร้อยแล้วค่ะ');
        setCurrentStage('dass21');
      }
    } catch (error) {
      console.error("Demographic submit failed:", error);
      toast.error('ระบบติดขัดเล็กน้อย กรุณาลองใหม่อีกครั้งค่ะ');
    } finally {
      setLoading(false);
    }
  };

  const submitScreenings = async () => {
    // 1. Calculate DASS-21
    let rawD = 0;
    let rawA = 0;
    let rawS = 0;

    DASS21_QUESTIONS.forEach(q => {
      const val = dassAnswers[q.id] || 0;
      if (q.category === 'D') rawD += val;
      if (q.category === 'A') rawA += val;
      if (q.category === 'S') rawS += val;
    });

    const scaledD = rawD * 2;
    const scaledA = rawA * 2;
    const scaledS = rawS * 2;

    // 2. Calculate PHQ-A
    let phqSum = 0;
    PHQA_QUESTIONS.forEach(q => {
      phqSum += phqAnswers[q.id] || 0;
    });

    // 3. Gather BNSSI-AT Details
    const methodsList = [...nsiMethods];
    if (nsiMethods.includes('อื่นๆ') && otherMethodText) {
      methodsList.push(`อื่นๆ: ${otherMethodText}`);
    }

    const reasonsList = [...nsiReasons];
    if (nsiReasons.includes('อื่นๆ') && otherReasonText) {
      reasonsList.push(`อื่นๆ: ${otherReasonText}`);
    }

    const checkpoint = CHECKPOINTS[activeCheckpointIndex];

    const recordPayload = {
      userId: user.uid,
      checkpointIndex: activeCheckpointIndex,
      checkpointLabel: checkpoint.label,
      dassDepression: scaledD,
      dassAnxiety: scaledA,
      dassStress: scaledS,
      phqScore: phqSum,
      hasNsi: hasNsi === true,
      nsiMethods: hasNsi ? methodsList : [],
      nsiFrequency: hasNsi ? nsiFrequency : 'ไม่ทำวิถีนี้ในช่วงนี้',
      nsiReasons: hasNsi ? reasonsList : [],
      nsiSeverity: nsiSeverity,
      rawAnswers: {
        dassAnswers,
        phqAnswers,
        nsi: {
          hasNsi,
          methods: nsiMethods,
          otherMethodText,
          frequency: nsiFrequency,
          reasons: nsiReasons,
          otherReasonText,
          severity: nsiSeverity
        }
      },
      createdAt: new Date().toISOString()
    };

    setLoading(true);
    try {
      if (user.uid.startsWith('local_')) {
        const localList = JSON.parse(localStorage.getItem(`clinical_screenings_${user.uid}`) || '[]');
        
        // Remove existing checkpoint with same index to allow override or clean recordings
        const updated = localList.filter((x: any) => x.checkpointIndex !== activeCheckpointIndex);
        updated.push(recordPayload);
        
        localStorage.setItem(`clinical_screenings_${user.uid}`, JSON.stringify(updated));
        setScreeningLogs(updated);
        setActiveCheckpointIndex(Math.min(updated.length, 7));
      } else {
        const docId = `checkpoint_${activeCheckpointIndex}`;
        await setDoc(doc(db, 'users', user.uid, 'screeningHistory', docId), recordPayload);
        
        // Refetch latest List
        const screenQ = query(collection(db, 'users', user.uid, 'screeningHistory'), orderBy('checkpointIndex', 'asc'));
        const screenSnap = await getDocs(screenQ);
        const screenings = screenSnap.docs.map(doc => ({
          ...doc.data(),
          date: doc.data().createdAt?.toDate() || new Date()
        }));
        setScreeningLogs(screenings);
        setActiveCheckpointIndex(Math.min(screenings.length, 7));
      }

      toast.success(`ส่งข้อมูลแบบประเมินสุขภาพจิต ${checkpoint.label} สำเร็จเสร็จสมบูรณ์เรียบร้อยแล้วค่ะค่ะ 💖`);
      setCurrentStage('completed');
      if (activeCheckpointIndex === 0 && onCompleteInitial) {
        onCompleteInitial();
      }
    } catch (e) {
      console.error("Error saving clinical screening data:", e);
      toast.error('ไม่พร้อมสำหรับการบันทึกข้อสอบ กรุณาแจ้งผู้พัฒนาค่ะ');
    } finally {
      setLoading(false);
    }
  };

  // Helper selectors
  const getDassSeverity = (score: number, domain: 'D' | 'A' | 'S') => {
    if (domain === 'D') {
      if (score <= 9) return { text: 'ปกติ (Normal)', color: 'text-emerald-600 bg-emerald-50' };
      if (score <= 13) return { text: 'ระดับปานกลางระดับเล็กน้อย (Mild)', color: 'text-amber-600 bg-amber-50' };
      if (score <= 20) return { text: 'ระดับปานกลาง (Moderate)', color: 'text-orange-600 bg-orange-50' };
      if (score <= 27) return { text: 'รุนแรง (Severe)', color: 'text-rose-600 bg-rose-50' };
      return { text: 'รุนแรงมากอย่างยิ่ง (Extremely Severe)', color: 'text-rose-800 bg-rose-100 font-extrabold' };
    }
    if (domain === 'A') {
      if (score <= 7) return { text: 'ปกติ (Normal)', color: 'text-emerald-600 bg-emerald-50' };
      if (score <= 9) return { text: 'ระดับปานกลางระดับเล็กน้อย (Mild)', color: 'text-amber-600 bg-amber-50' };
      if (score <= 14) return { text: 'ระดับปานกลาง (Moderate)', color: 'text-orange-600 bg-orange-50' };
      if (score <= 19) return { text: 'รุนแรง (Severe)', color: 'text-rose-600 bg-rose-50' };
      return { text: 'รุนแรงมากอย่างยิ่ง (Extremely Severe)', color: 'text-rose-800 bg-rose-100 font-extrabold' };
    }
    // Stress
    if (score <= 14) return { text: 'ปกติ (Normal)', color: 'text-emerald-600 bg-emerald-50' };
    if (score <= 18) return { text: 'ระดับปานกลางระดับเล็กน้อย (Mild)', color: 'text-amber-600 bg-amber-50' };
    if (score <= 25) return { text: 'ระดับปานกลาง (Moderate)', color: 'text-orange-600 bg-orange-50' };
    if (score <= 33) return { text: 'รุนแรง (Severe)', color: 'text-rose-600 bg-rose-50' };
    return { text: 'รุนแรงมากอย่างยิ่ง (Extremely Severe)', color: 'text-rose-800 bg-rose-100 font-extrabold' };
  };

  const getPhqSeverity = (score: number) => {
    if (score <= 4) return { text: 'ปกติ / มีสภาวะเบาบาง (Minimal)', color: 'text-emerald-600 bg-emerald-50' };
    if (score <= 9) return { text: 'อารมณ์เศร้าเล็กน้อย (Mild)', color: 'text-amber-600 bg-amber-50' };
    if (score <= 14) return { text: 'อารมณ์เศร้าปานกลาง (Moderate)', color: 'text-orange-500 bg-orange-50' };
    if (score <= 19) return { text: 'อารมณ์เศร้าค่อนข้างรุนแรง (Moderately Severe)', color: 'text-rose-600 bg-rose-50' };
    return { text: 'อารมณ์เศร้ารุนแรงเฉียบพลัน (Severe Depression)', color: 'text-rose-800 bg-rose-150 font-black' };
  };

  // Pilot Unlock Feature for Sandbox Evaluation
  const handleFastTrackCheckpoint = (idx: number) => {
    setActiveCheckpointIndex(idx);
    setDassAnswers({});
    setPhqAnswers({});
    setHasNsi(null);
    setNsiMethods([]);
    setNsiFrequency('');
    setNsiReasons([]);
    toast.success(`เปลี่ยนโหมดทำประเมินข้ามช่วงสำหรับ ${CHECKPOINTS[idx].label} แล้วค่ะ!`);
    setCurrentStage('dass21');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
        <p className="text-slate-400 text-sm">กำลังเชื่อมต่อข้อมูลแบบคัดกรองคลิกนิก...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      
      {/* Simulation Box for Clinicians */}
      <div className="bg-amber-50/70 border border-amber-200/60 p-5 rounded-[2.5rem] space-y-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h4 className="text-sm font-black text-amber-900">แผงจำลองสำหรับการทดสอบและวิจัย (Research Simulation Panel)</h4>
        </div>
        <p className="text-slate-600 text-[11px] leading-relaxed font-sans">
          ตามกระบวนการทางคลินิกแอปฯ นี้ได้รับการออกแบบให้ผู้ใช้บันทึกผลเป็นระยะ (สป. 1-24) จนครบ 8 ลำดับ เพื่อไม่ให้ท่านต้องรอเวลาล่วงเลย 24 สัปดาห์ในการทดสอบแอป เราจัดปุ่มลัดให้จำลองรอบการประเมินได้อิสระ:
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {CHECKPOINTS.map((cp) => {
            const hasRecord = screeningLogs.some(s => s.checkpointIndex === cp.index);
            return (
              <button
                key={cp.index}
                onClick={() => handleFastTrackCheckpoint(cp.index)}
                className={`py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeCheckpointIndex === cp.index 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : hasRecord 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {hasRecord ? '✔️ ' : ''}{cp.index + 1}. {cp.index === 0 ? 'Baseline' : `W${cp.index}`}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STAGE WELCOME: Research Consent */}
        {currentStage === 'welcome' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10" />
            
            <div className="flex items-center gap-4 border-b border-indigo-50 pb-5">
              <div className="p-3.5 bg-indigo-600 text-white rounded-3xl">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">คลิกนิกการวิจัยระดับชาติ</span>
                <h3 className="text-xl font-black text-slate-850">หนังสือแสดงความยินยอมเข้าร่วมโครงการ (Consent Form)</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans text-slate-650 leading-relaxed max-h-96 overflow-y-auto pr-2 bg-slate-50/40 p-5 rounded-2xl border border-slate-100">
              <p className="font-extrabold text-slate-900 text-sm">การศึกษาวิจัยเพื่อประเมินประสิทธิภาพทางคลินิก (Clinical Efficacy Evaluation)</p>
              <p>
                แอปพลิเคชัน <strong>JaiGu (GuRu.D) ใจกุ (กูรู ดี)</strong> นอกเหนือจากการทำหน้าที่เป็นเครื่องมือพกพาส่วนบุคคลบำบัดฟื้นฟูด้วย Cognitive Behavioral Therapy (CBT) แล้ว แอปฯ นี้ยังร่วมสนับสนุนโครงการวิจัยประเมินผลสัมฤทธิ์สุขภาพจิตในกลุ่มนิสิต นักเรียน นักศึกษา และทั่วไป
              </p>
              <p className="font-extrabold text-rose-700">🔒 มาตรฐานการคุ้มครองความเป็นส่วนตัวขั้นสูงสุด (Strict De-identification Standard):</p>
              <ul className="list-disc list-inside space-y-1.5 pl-1.5">
                <li><strong>ไม่มีการระบุตัวตนจริงใดๆ:</strong> ข้อมูลส่วนบุคคลที่คุณป้อนทั้งหมด (เพศ, อายุ, อาชีพ, จังหวัด, ประวัติ) จะถูก <strong>De-identify (ลบหรือทำลายสัญลักษณ์ระบุตัวตน)</strong> อย่างสิ้นเชิง</li>
                <li><strong>ไม่มีการเปิดเผยต่อสาธารณะ:</strong> ข้อมูลจะไม่ถูกใช้หรือเผยแพร่ในลักษณะที่เป็นรายบุคคล แต่จะเก็บในฐานข้อมูลเพื่อรวบรวมเป็นสถิติรวม (Aggregate Statistics) และแนวโน้มทางวิทยาศาสตร์เพื่อปรับปรุงแอปฯ เท่านั้น</li>
                <li><strong>เสรีภาพทางใจ:</strong> คุณมีสิทธิตามกฎหมาย PDPA ในการเพิกถอนสิทธิ ร้องขอสตรีคลบข้อมูลการประเมินได้ตลอดเวลาผ่านแท็บประวัติของระบบ ไม่มีผลเสียใดๆ ต่อสิทธิการรักษาพยาบาลหรือการใช้งานฟังก์ชันอื่นๆ</li>
              </ul>
              <p className="font-medium">
                หากคุณยินดีร่วมเป็นส่วนหนึ่งของการซ่อมเยียวยาใจเพื่อนมนุษย์และช่วยเหลือในการพัฒนาโปรแกรมจิตวิทยาบำบัด กรุณากรอกกล่องยินยอมด้านล่างเพื่อเข้าลงทะเบียนกรอกประวัติตนเองแบบปิดบังชื่อและทำแบบคัดกรองเบื้องต้นค่ะ
              </p>
            </div>

            <div className="space-y-4 pt-3 border-t border-slate-50">
              <label className="flex items-center gap-3.5 cursor-pointer group text-left">
                <input 
                  type="checkbox"
                  checked={consentCheck}
                  onChange={(e) => setConsentCheck(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700 leading-normal group-hover:text-indigo-900 transition-colors">
                  ฉันยินยอมเข้าร่วมการเก็บข้อมูลทางสถิติวิจัยแบบไม่ระบุตัวตน (De-identified Research Consent)
                </span>
              </label>

              <button
                type="button"
                onClick={handleConsentAccept}
                disabled={!consentCheck}
                className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  consentCheck 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-150 hover:scale-[1.01] active:opacity-90' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>ยื่นหนังสือแสดงเจตจำนงรักษาสิทธิ์เเละถัดไป</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 1: Demographics Form */}
        {currentStage === 'demographics' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6"
          >
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-850">ขั้นตอนที่ 1: ข้อมูลประกอบการทำวิจัยพื้นฐาน (Anonymized Register)</h3>
                <p className="text-[10.5px] text-slate-400 font-sans font-medium">บันทึกข้อมูลแบบไม่มีประดับตัวตน เพื่อประเมินบริบทใจอย่างรอบด้าน</p>
              </div>
            </div>

            <form onSubmit={submitDemographics} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">เพศสภาพ (Gender Identity)</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">เลือกเพศสภาพ</option>
                    <option value="ชาย">ชาย (Male)</option>
                    <option value="หญิง">หญิง (Female)</option>
                    <option value="หลากหลายทางเพศ">หลากหลายทางเพศ (LGBTQ+)</option>
                    <option value="ไม่ระบุ">ไม่ขอระบุตัวตน (Prefer not to say)</option>
                  </select>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">อายุปีบริบูรณ์ (Age)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min="1"
                    max="120"
                    placeholder="ตัวเลข เช่น 19"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Occupation */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">กลุ่มอาชีพปัจจุบัน (Occupation)</label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">เลือกกลุ่มอาชีพ</option>
                    <option value="นักเรียน/นิสิตนักศึกษา">นักเรียน/นิสิตนักศึกษา (Student)</option>
                    <option value="ข้าราชการ/รัฐวิสาหกิจ">ข้าราชการ/พนักงานรัฐวิสาหกิจ</option>
                    <option value="พนักงานบริษัทเอกชน">พนักงานบริษัท/ห้างร้านเอกชน</option>
                    <option value="ธุรกิจส่วนตัว/เจ้าของกิจการ/ค้าขาย">ประกอบธุรกิจส่วนตัว/ค้าขาย</option>
                    <option value="ประกอบวิชาชีพอิสระ/Freelance">ประกอบวิชาชีพอิสระ/ฟรีแลนซ์</option>
                    <option value="ว่างงาน/แม่บ้าน/เกษียณ">ว่างงาน/ดูแลในบ้าน/เกษียณ</option>
                    <option value="งานอื่นๆ">อื่นๆ</option>
                  </select>
                </div>

                {/* If Student Detail */}
                {occupation === 'นักเรียน/นิสิตนักศึกษา' && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <label className="text-xs font-black text-rose-600">ระดับชั้นเรียนและสถานศึกษาของคุณ (School Details)</label>
                    <input
                      type="text"
                      value={studentYear}
                      onChange={(e) => setStudentYear(e.target.value)}
                      required
                      placeholder="เช่น ม.5, นิสิตปี 2 คณะอักษรฯ"
                      className="w-full p-3 bg-slate-50 border border-rose-200 rounded-2xl text-xs font-black text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                )}

                {/* Province */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">จังหวัดที่อยู่อาศัยหลักในปัจจุบัน (Province)</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">กรุณาเลือกจังหวัด</option>
                    {THAI_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Physical / Psychiatric Illnesses */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-slate-700">ประวัติโรคประจำตัว และโรคทางจิตเวช (Medical & Psychiatric Illness History)</label>
                <textarea
                  value={medicalIllness}
                  onChange={(e) => setMedicalIllness(e.target.value)}
                  placeholder="ระบุ เช่น โรคซึมเศร้า (MDD), สมาธิสั้น (ADHD), ความดัน โรคภูมิแพ้ หรือ พิมพ์ว่า 'ไม่มี' หากสุขภาพร่างกายปกติดีค่ะ"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 h-20 focus:bg-white focus:outline-none' focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Psychiatric Medications */}
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-slate-700">คุณมีประวัติกินยาจิตเวชอยู่ในกลุ่มปัจจุบันหรือไม่? (Psychotropic Medications)</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="psychiatricMedication" 
                      value="no" 
                      checked={psychiatricMedication === 'no'}
                      onChange={() => setPsychiatricMedication('no')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-black text-slate-700">ไม่มีประวัติทานยาร่วมด้วย</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="psychiatricMedication" 
                      value="yes" 
                      checked={psychiatricMedication === 'yes'}
                      onChange={() => setPsychiatricMedication('yes')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-black text-indigo-700">มีทานยาอยู่ (ระบุข้อมูล)</span>
                  </label>
                </div>

                {psychiatricMedication === 'yes' && (
                  <div className="space-y-2 pt-1 animate-in slide-in-from-top-1 duration-205">
                    <label className="text-[11px] font-bold text-slate-500">ระบุยารักษาจิตเวช ขนาด หรืออาการที่เฝ้าระวังขณะนี้</label>
                    <input
                      type="text"
                      value={psychiatricMedicationDetails}
                      onChange={(e) => setPsychiatricMedicationDetails(e.target.value)}
                      required
                      placeholder="เช่น ขนาดยา Fluoxetine 20mg วันละเม็ด เช้า"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                {onBackToHome && (
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-black text-slate-500 transition-colors"
                  >
                    กลับสู่หน้าหลัก
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-2 py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-150 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ขั้นตอนถัดไป (แบบวัด DASS-21)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STAGE 2: DASS-21 Thai version */}
        {currentStage === 'dass21' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-indigo-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Clipboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-850">ขั้นตอนที่ 2: แบบวัดระดับใจ DASS-21</h3>
                  <p className="text-[10px] text-slate-400 font-sans font-medium">โปรดเลือกระดับความถี่ที่ประพฤติตลอดในช่วง 1 สัปดาห์ที่ผ่านมาจนถึงวันนี้</p>
                </div>
              </div>
              <span className="text-[9px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded-full uppercase">Scale 1/3</span>
            </div>

            {/* Scale guide */}
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-800">เกณฑ์คะแนนชี้แนะ:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-500 mt-1 font-sans">
                  <span><strong>0:</strong> ไม่เคยเกิดขึ้นเลย</span>
                  <span><strong>1:</strong> เกิดบ้างบางครั้ง</span>
                  <span><strong>2:</strong> เกิดขึ้นค่อนข้างบ่อย</span>
                  <span><strong>3:</strong> เกิดขึ้นเกือบตลอดเวลา</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 max-h-[460px] overflow-y-auto pr-2">
              {DASS21_QUESTIONS.map((q, ix) => (
                <div key={q.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/75 space-y-3 transition-colors hover:border-indigo-100">
                  <p className="text-xs font-black text-slate-850 text-left flex gap-1.5">
                    <span className="text-indigo-500">{ix + 1}.</span>
                    <span>{q.text}</span>
                  </p>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDassAnswers(prev => ({ ...prev, [q.id]: val }))}
                        className={`py-2 px-1 rounded-xl text-center text-[10.5px] font-bold transition-all border cursor-pointer ${
                          dassAnswers[q.id] === val 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100 scale-102 font-black' 
                            : 'bg-white hover:bg-slate-50 text-slate-650 border-slate-200'
                        }`}
                      >
                        {val === 0 ? '0 (ไม่พบเลย)' : val === 1 ? '1 (บ้าง)' : val === 2 ? '2 (บ่อย)' : '3 (ตลอดเวลา)'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex gap-3 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setCurrentStage('demographics')}
                className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-black text-slate-500 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={() => {
                  const answeredCount = Object.keys(dassAnswers).length;
                  if (answeredCount < 21) {
                    toast.error(`กรุณาบันทึกครบถ้วนทุกข้อการบำบัดด้วยค่พวิเคราะห์ค่ะ (ตอบแล้ว ${answeredCount}/21 ข้อ)`);
                    return;
                  }
                  setCurrentStage('phqa');
                }}
                className="flex-2 py-3.5 bg-indigo-600 hover:bg-indigo-750 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-150 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ก้าวไปสู่: PHQ-A (ซึมเศร้าวัยรุ่น)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 3: PHQ-A (Depression adolescent scale) */}
        {currentStage === 'phqa' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-rose-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-850">ขั้นตอนที่ 3: แบบวัดสุขภาพผู้เรียนและวัยรุ่น PHQ-A</h3>
                  <p className="text-[10px] text-slate-400 font-sans font-medium">โปรดเลือกระดับความบ่อยของอารมณ์ดิ่งเศร้าอย่างตรงใจตลอด 2 สัปดาห์ที่ผ่านมา</p>
                </div>
              </div>
              <span className="text-[9px] font-black bg-rose-500 text-white px-3 py-1.5 rounded-full uppercase">Scale 2/3</span>
            </div>

            <div className="space-y-5 max-h-[460px] overflow-y-auto pr-2">
              {PHQA_QUESTIONS.map((q, ix) => (
                <div key={q.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/75 space-y-3 transition-colors hover:border-rose-100">
                  <p className="text-xs font-black text-slate-850 text-left flex gap-1.5">
                    <span className="text-rose-500">{ix + 1}.</span>
                    <span>{q.text}</span>
                  </p>
                  
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 1, 2, 3].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPhqAnswers(prev => ({ ...prev, [q.id]: val }))}
                        className={`py-2 px-1 rounded-xl text-center text-[9.5px] font-bold transition-all border cursor-pointer ${
                          phqAnswers[q.id] === val 
                            ? 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-100 scale-102 font-black' 
                            : 'bg-white hover:bg-slate-50 text-slate-650 border-slate-200'
                        }`}
                      >
                        {val === 0 ? 'ไม่มีเลย' : val === 1 ? 'มีบางวัน' : val === 2 ? 'เกินครึ่งหนึ่ง' : 'เกือบทุกวัน'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex gap-3 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setCurrentStage('dass21')}
                className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-black text-slate-500 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={() => {
                  const answeredCount = Object.keys(phqAnswers).length;
                  if (answeredCount < 9) {
                    toast.error(`กรุณาบันทึกครบถ้วนทุกข้อการบำบัดด้วยค่ะ (ตอบแล้ว ${answeredCount}/9 ข้อ)`);
                    return;
                  }
                  setCurrentStage('bnssiat');
                }}
                className="flex-2 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-rose-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ก้าวไปสู่: BNSSI-AT (แบบตรวจการทำร้ายตัวเอง)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE 4: BNSSI-AT Self-Injury scale */}
        {currentStage === 'bnssiat' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-orange-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 text-orange-600 rounded-2xl">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-850">ขั้นตอนที่ 4: ความเสี่ยงพฤติกรรมทำร้ายตัวเอง BNSSI-AT</h3>
                  <p className="text-[10px] text-slate-400 font-sans font-medium">โปรดระบุประวัติหรือระดับแรงจูงใจพฤติกรรมการบำบัดทำร้ายตัวเองโดยปราศจากเจตนาฆ่าตัวตาย</p>
                </div>
              </div>
              <span className="text-[9px] font-black bg-orange-500 text-white px-3 py-1.5 rounded-full uppercase">Scale 3/3</span>
            </div>

            <div className="space-y-6 text-left">
              {/* Question 1: Has NSI */}
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                <p className="text-xs font-black text-slate-800">
                  1. ในช่วงที่ผ่านมาสัปดาห์นี้หรือเร็วๆ นี้ คุณเคยมีพฤติกรรมทำร้ายตนเองเฉียบพลันโดยไร้เจตนาทำลายชีวิต (เช่น การขลิบ กรีดเฉือนผิวหนัง ดึงทึ้งผมอย่างรุนแรง ตีหรือข่วนตัวเอง) หรือไม่?
                </p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setHasNsi(false);
                      setNsiSeverity(0);
                    }}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition-colors text-center border cursor-pointer ${
                      hasNsi === false 
                        ? 'bg-emerald-500 text-white border-emerald-500 font-black' 
                        : 'bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    ไม่เคยพบความรู้สึกทำร้ายเลย
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasNsi(true)}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition-colors text-center border cursor-pointer ${
                      hasNsi === true 
                        ? 'bg-orange-500 text-white border-orange-500 font-black' 
                        : 'bg-white hover:bg-slate-50 text-slate-705'
                    }`}
                  >
                    มีพฤติกรรม / เคยรู้สึกเกิดแรงดึงดูด
                  </button>
                </div>
              </div>

              {/* Conditional Items if Has NSI is true */}
              {hasNsi === true && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {/* Methods checklist */}
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-xs font-black text-slate-800">2. คุณกระทำหรือประพฤติพฤติกรรมนี้ด้วยวิธีการใดบ้าง? (เลือกได้หลายข้อ)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        "กรีดเฉือนหรือเจาะผิวหนัง (Cutting/Piercing)",
                        "ตบตี ทำลายผิวกาย ตนเองอย่างจงใจ (Beating/Hitting self)",
                        "กระแทกศีรษะ กำปั้นกับกำแพงหรือของแข็งรุนแรง",
                        "ดึงทึ้งผม หยิก หรือข่วนตัวเองจนถลอกแผลเป็นสะเก็ด",
                        "ใช้ของร้อนหรือวัตถุเปลวไฟ ดาดความร้อนใส่ตนเอง",
                        "อื่นๆ"
                      ].map(method => {
                        const isSelected = nsiMethods.includes(method);
                        return (
                          <label key={method} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-150 cursor-pointer hover:bg-orange-50/30 transition-colors">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setNsiMethods(prev => [...prev, method]);
                                else setNsiMethods(prev => prev.filter(m => m !== method));
                              }}
                              className="text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-[11px] font-bold text-slate-755">{method}</span>
                          </label>
                        );
                      })}
                    </div>
                    {nsiMethods.includes('อื่นๆ') && (
                      <input
                        type="text"
                        value={otherMethodText}
                        onChange={(e) => setOtherMethodText(e.target.value)}
                        placeholder="โปรดระบุรายละเอียดวิถีทางอื่นๆ..."
                        className="w-full mt-2 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    )}
                  </div>

                  {/* Frequency selection */}
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
                    <p className="text-xs font-black text-slate-800">3. ระดับความบ่อยครั้งที่ทำในช่วง 2 สัปดาห์ถึงปัจจุบัน</p>
                    <select
                      value={nsiFrequency}
                      onChange={(e) => setNsiFrequency(e.target.value)}
                      required
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-850"
                    >
                      <option value="">เลือกความถี่ของพฤติกรรม</option>
                      <option value="ไม่พบเลย">ไม่เกิดพฤติกรรมเลยในช่วงนี้</option>
                      <option value="ทำ 1 ครั้ง">ทำเพียงครั้งเดียว</option>
                      <option value="ทำ 2-4 ครั้ง">ทำ 2 - 4 ครั้ง</option>
                      <option value="ทำมากกว่า 5 ครั้งขึ้นไป">ทำบ่อย (เกิน 5 ครั้งขึ้นไป)</option>
                      <option value="แทบทำทุกวัน">บ่อยอย่างวิกฤต (ทำเกือบทุกวัน)</option>
                    </select>
                  </div>

                  {/* Reasons checklist */}
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-xs font-black text-slate-800">4. เหตุจูงใจเบื้องลึกที่ผลักดันให้คุณกระทำพฤติกรรมคืออะไร? (เลือกได้หลายข้อ)</p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {[
                        "เพื่อระบาย ดิ่ง บดบังความไม่สบายใจทางอารมณ์บีบคั้นรุนแรง (Emotion Release)",
                        "เพื่อลงโทษติตนเองเมื่อรู้สึกด้อยค่า ผิดหวังล้มเหลวจึงชดใช้แผลใจ (Self Punishment)",
                        "เพื่ออยากพบกระแสความรู้สึกตัว เมื่อรู้สึกว่าจิตใจว่างเปล่า ไร้ตัวตนชาหนึบ",
                        "เพื่อสื่อสารวิกฤตอารมณ์ให้แพทย์ ครู หรือครอบครัวตระหนักขอความช่วยเหลือ",
                        "อื่นๆ"
                      ].map(reason => {
                        const isSelected = nsiReasons.includes(reason);
                        return (
                          <label key={reason} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-150 cursor-pointer hover:bg-orange-50/30 transition-colors">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setNsiReasons(prev => [...prev, reason]);
                                else setNsiReasons(prev => prev.filter(r => r !== reason));
                              }}
                              className="text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-[11px] font-bold text-slate-755">{reason}</span>
                          </label>
                        );
                      })}
                    </div>
                    {nsiReasons.includes('อื่นๆ') && (
                      <input
                        type="text"
                        value={otherReasonText}
                        onChange={(e) => setOtherReasonText(e.target.value)}
                        placeholder="ระบุเหตุผลอื่นๆ..."
                        className="w-full mt-2 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Question 5: Severity urge Level */}
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3">
                <p className="text-xs font-black text-slate-800 flex justify-between">
                  <span>5. ความแรงของแรงกระตุ้นหรือใจอยากทำร้ายตอนนี้รุนแรงระดับใด?</span>
                  <span className="text-orange-600 underline font-black">{nsiSeverity}/10</span>
                </p>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={nsiSeverity}
                  onChange={(e) => setNsiSeverity(parseInt(e.target.value))}
                  className="w-full text-orange-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                  <span>0: ไม่มีเเรงขับเลย</span>
                  <span>5: ปานกลาง (ควบคุมตนเองได้)</span>
                  <span>10: แรงกล้า ดึงดูดมาก</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setCurrentStage('phqa')}
                className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-black text-slate-500 transition-colors"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (hasNsi === null) {
                    toast.error('กรุณาเลือกประวัติข้อที่ 1 ก่อนดำเนินการจัดส่งข้อสอบค่ะ');
                    return;
                  }
                  if (hasNsi === true && nsiMethods.length === 0) {
                    toast.error('กรุณาเลือกวิธีการทำร้ายตัวเองในข้อที่ 2 ด้วยค่ะ');
                    return;
                  }
                  if (hasNsi === true && !nsiFrequency) {
                    toast.error('กรุณาระบุความถี่ของพฤติกรรมในข้อที่ 3 ด้วยค่ะ');
                    return;
                  }
                  submitScreenings();
                }}
                className="flex-2 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>เสร็จสิ้นเเละบันทึกประเมิน 🏁</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STAGE: COMPLETED */}
        {currentStage === 'completed' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6 text-center"
          >
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">บันทึกสัมฤทธิ์รอยยิ้มเรียบร้อย</span>
              <h3 className="text-xl font-black text-slate-850">แบบคัดกรองคลิกนิกสำเร็จลุล่วงด้วยดีค่ะ 💖</h3>
              <p className="text-xs text-slate-500 font-sans font-medium leading-relaxed max-w-sm mx-auto">
                ขอบคุณสหายสำหรับการตอบข้อสอบบำบัดรักษาเพื่อประโยชน์ในโครงสร้างวิจัยสุขภาพจิตเป็นอย่างยิ่ง... ข้อมูลคะแนนทั้งหมดถูกเข้ารหัสคุ้มครอง (De-identified) สถิติสะสมจะถูกบันทึกที่หน้าวิจัยของ Dashboard เรียบร้อยแล้วค่ะค่ะ!
              </p>
            </div>

            <div className="pt-4 max-w-sm mx-auto flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setCurrentStage('history')}
                className="w-full py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs rounded-2xl transition-all"
              >
                ตรวจสอบผลคะแนนสุขภาพจิตของฉัน (View My History)
              </button>
              {onBackToHome && (
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl shadow-sm transition-all"
                >
                  กลับสู่หน้าหลักของระบบ 🏠
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* STAGE 6: Clinical Screening Record History */}
        {currentStage === 'history' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-black text-slate-850">ประวัติการทำกิจกรรมประเมินผลรักษา</h3>
                  <p className="text-[10px] text-slate-400 font-sans font-medium">บันทึกระดับความพึงพอใจเเละความดิ่งตามช่วงสัปดาห์</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDassAnswers({});
                  setPhqAnswers({});
                  setHasNsi(null);
                  setCurrentStage('dass21');
                }}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10.5px] rounded-xl flex items-center gap-1.5 shadow-sm shadow-indigo-100 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ประเมินเพิ่มรอบถัดไป</span>
              </button>
            </div>

            {/* Demographics Summary Block */}
            {demographics && (
              <div className="bg-slate-50 border border-slate-150 rounded-[2rem] p-5 text-left space-y-2 text-xs">
                <p className="font-extrabold text-[12.5px] text-slate-800 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-600" />
                  <span>ข้อมูลเวชระเบียนวิจัยของคุณ (De-identified Demographics)</span>
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-slate-650 font-sans font-medium">
                  <p><strong>เพศสภาพ:</strong> {demographics.gender}</p>
                  <p><strong>อายุปี:</strong> {demographics.age} ปี</p>
                  <p><strong>จังหวัด:</strong> {demographics.province}</p>
                  <p className="col-span-2"><strong>อาชีพ:</strong> {demographics.occupation} {demographics.studentYear ? `(${demographics.studentYear})` : ''}</p>
                  <p className="col-span-2"><strong>โรคประจำตัว/จิตเวช:</strong> {demographics.medicalIllness}</p>
                  <p className="col-span-3"><strong>กินยาจิตเวชอยู่:</strong> {demographics.psychiatricMedication}</p>
                </div>
              </div>
            )}

            {/* Screening Logs List */}
            <div className="space-y-4">
              {screeningLogs.length > 0 ? (
                [...screeningLogs].reverse().map((log, ix) => {
                  const dassDSeverity = getDassSeverity(log.dassDepression, 'D');
                  const dassASeverity = getDassSeverity(log.dassAnxiety, 'A');
                  const dassSSeverity = getDassSeverity(log.dassStress, 'S');
                  const phqSeverity = getPhqSeverity(log.phqScore);

                  return (
                    <div key={ix} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 text-left space-y-4">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                        <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border">
                          {log.checkpointLabel}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {log.createdAt ? new Date(log.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </span>
                      </div>

                      {/* Score matrix flex */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        {/* DASS Depression */}
                        <div className="bg-white p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold">DASS Depression (ซึมเศร้า)</p>
                          <p className="text-base font-black text-rose-600 mt-1">{log.dassDepression} คะแนน</p>
                          <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded mt-1.5 inline-block ${dassDSeverity.color}`}>{dassDSeverity.text}</span>
                        </div>

                        {/* DASS Anxiety */}
                        <div className="bg-white p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold">DASS Anxiety (วิตกกังวล)</p>
                          <p className="text-base font-black text-amber-600 mt-1">{log.dassAnxiety} คะแนน</p>
                          <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded mt-1.5 inline-block ${dassASeverity.color}`}>{dassASeverity.text}</span>
                        </div>

                        {/* DASS Stress */}
                        <div className="bg-white p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold">DASS Stress (ความเครียด)</p>
                          <p className="text-base font-black text-orange-600 mt-1">{log.dassStress} คะแนน</p>
                          <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded mt-1.5 inline-block ${dassSSeverity.color}`}>{dassSSeverity.text}</span>
                        </div>

                        {/* PHQ-A Depression */}
                        <div className="bg-white p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-bold">PHQ-A (คัดกรองวัยรุ่น)</p>
                          <p className="text-base font-black text-red-600 mt-1">{log.phqScore} คะแนน</p>
                          <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded mt-1.5 inline-block ${phqSeverity.color}`}>{phqSeverity.text}</span>
                        </div>
                      </div>

                      {/* BNSSI-AT Self Injury Outcome */}
                      <div className="p-3.5 bg-white rounded-xl border border-dashed border-slate-200">
                        <div className="flex items-center gap-1.5 text-[11px] font-black">
                          {log.hasNsi ? (
                            <>
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span className="text-orange-900">ตรวจพบประวัติหรือความเสี่ยงบำบัดอาการเฉียบพลันทำร้ายตนเอง (BNSSI-AT Postive)</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-emerald-900">ไม่มีสภาวะความคิดหรือทำร้ายกายในรอบประเมินนี้ (BNSSI-AT Negative)</span>
                            </>
                          )}
                        </div>

                        {log.hasNsi && (
                          <div className="mt-2.5 text-[10.5px] font-sans font-medium text-slate-600 space-y-1">
                            <p><strong>วิธีการบำบัดทำลายผิวกาย:</strong> {log.nsiMethods?.join(', ') || 'ไม่มี'}</p>
                            <p><strong>ความถี่ในการกระทำ:</strong> {log.nsiFrequency || 'N/A'}</p>
                            <p><strong>เหตุผลทางจิตวิทยา:</strong> {log.nsiReasons?.join(', ') || 'ไม่มี'}</p>
                            <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-slate-50 text-[11px]">
                              <span><strong>ระดับความอยากทำร้ายตนเอง:</strong></span>
                              <span className="font-extrabold text-orange-600">{log.nsiSeverity || 0}/10</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-xs text-slate-400 italic py-6">คุณยังไม่ได้ผ่านแบบคัดกรองสะสมประเมินสุขภาพเวชระเบียนใดๆ</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-50 flex gap-3">
              {onBackToHome && (
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl cursor-pointer shadow-sm transition-all"
                >
                  กลับสู่หน้าหลัก 🏠
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
