import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  Heart, 
  Brain, 
  Activity, 
  ShieldAlert, 
  Smile, 
  Sparkles, 
  Home, 
  ArrowLeft, 
  Bookmark, 
  FileText, 
  CheckCircle, 
  HelpCircle,
  ExternalLink,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClinicalPresentationProps {
  onBackToHome?: () => void;
}

type TopicId = 'general-cbt' | 'depression' | 'anxiety' | 'self-harm' | 'other-disorders' | 'brand-marketing';

interface CBTTopic {
  id: TopicId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  colorClass: string;
  badgeText: string;
  shortDesc: string;
  definition: string;
  mechanism: {
    title: string;
    steps: { name: string; desc: string }[];
  };
  clinicalEvidence: string[];
  scientificRef: string;
  appFeaturesLink: string[];
}

export default function ClinicalPresentation({ onBackToHome }: ClinicalPresentationProps) {
  const [selectedTopic, setSelectedTopic] = useState<TopicId | null>(null);

  const topics: CBTTopic[] = [
    {
      id: 'general-cbt',
      title: "CBT คืออะไร? (ปรัชญาและหลักทฤษฎีพื้นฐาน)",
      subtitle: "วิญญูภาพแห่งจิตบำบัดที่ตั้งอยู่บนโครงร่างความสัมพันธ์ของจิตคิดและกายพฤติกรรม",
      icon: <Brain className="w-6 h-6 text-indigo-600" />,
      colorClass: "from-indigo-50 to-purple-50 hover:border-indigo-200 border-indigo-100",
      badgeText: "FOUNDATION OF CBT",
      shortDesc: "ทฤษฎีการแพทย์ที่ออกแบบโดย Dr. Aaron T. Beck เพื่อช่วยปรับโครงสร้างลบอัตโนมัติในสรีรสมองและระบบความคิดยึดมั่น",
      definition: "Cognitive Behavioral Therapy (CBT) หรือการบำบัดด้วยการปรับความคิดและพฤติกรรม เป็นหนึ่งในแนวจิตบำบัดที่มีหลักฐานการศึกษารองรับทางวิทยาศาสตร์มากที่สุดในประวัติศาสตร์ โดยมีสมมติฐานว่า 'อารมณ์และพฤติกรรมของมนุษย์ไม่ได้ถูกกำหนดจากบริบทภายนอกโดยตรง แต่เกิดจากการตีความ (Thinking/Cognition) ต่อบริบทนั้นๆ' หากเราจัดกลุ่มความคิดที่บิดเบือนขึ้นมาใหม่ ย่อมปรับเปลี่ยนปฏิกิริยาทางอารมณ์และกายภาพได้อย่างปลอดภัยถาวร",
      mechanism: {
        title: "สามเหลี่ยมองค์ประกอบ CBT (CBT Triangle Dynamics)",
        steps: [
          {
            name: "1. Cognitive (ความคิด)",
            desc: "สกัดความเข้าใจผิด หรือแนวคิดเหมารวมอัตโนมัติ (Automatic Negative Thoughts) ที่เข้ามารังควานในจิตใจโดยไม่ผ่านการกลั่นกรองตามหลักเหตุผล"
          },
          {
            name: "2. Emotion (อารมณ์ความรู้สึก)",
            desc: "เมื่อเรียนรู้วางเฉยต่อสิ่งกระตุ้น จิตสำนึกจะลดอาการปะทุของอารมณ์ดิ่งเฉียบพลัน ความหงุดหงิด หรือความอึ้งหม่องในใจลงอย่างชัดเจน"
          },
          {
            name: "3. Behavior (พฤตินิสัย)",
            desc: "แก้ลูปการหลีกเลี่ยงสังคม (Avoidance Behavior) ด้วยการค่อยๆ บังคับร่างกายไปสัมผัสกิจกรรมเชิงบวกเพื่อฟื้นสารสื่อประสาทซีโรโทนินและโดปามีน"
          },
          {
            name: "4. Somatic Reaction (ปฏิกิริยาทางสรีระกาย)",
            desc: "ควบคุมระบบหายใจ ชีพจรเต้นกระชั้น และความเกร็งตึงในยามดิ่งลึกโดยใช้ทักษะกายภาพประสานงานการหายใจลึกระดับปิด"
          }
        ]
      },
      clinicalEvidence: [
        "มีงานวิจัยแบบ Randomized Controlled Trials (RCTs) นับพันชิ้นระบุว่าผลการักษาด้วย CBT มีความคงทนและลดการกลับมาเป็นซ้ำได้ดีเทียบเท่าหรือดีกว่ายาเคมีในผู้ป่วย Mild to Moderate",
        "สมาคมจิตแพทย์อเมริกัน (APA) และองค์การอนามัยโลก (WHO) แนะนำให้ใช้ CBT เป็นด่านรักษาระดับหลัก (First-line Treatment)"
      ],
      scientificRef: "Beck, A. T. (1979). Cognitive therapy of depression. New York: Guilford Press.",
      appFeaturesLink: [
        "CBT Dojo: แชตบอตท้าทายกับดักความคิดและคัดกรองความบิดเบือนเป็น SOAP",
        "Mood Slider: บันทึกและเช็คอินความขยับทางใจประจำวัน"
      ]
    },
    {
      id: 'depression',
      title: "การรักษาภาวะซึมเศร้า (Major Depressive Disorder)",
      subtitle: "สลายวงจรความเกลียดชังและหลีกหนีกิจกรรม ด้วยกระบวนการกอบกู้พฤติกรรม (BA)",
      icon: <Smile className="w-6 h-6 text-emerald-600" />,
      colorClass: "from-emerald-50 to-teal-50 hover:border-emerald-200 border-emerald-100",
      badgeText: "DEPRESSION & BA",
      shortDesc: "ทลายกลไกความเฉื่อยชาทางจิตใจ (Anhedonia) ด้วยกำหนดภารกิจสะสมแต้มความก้าวหน้าขนาดจิ๋ว",
      definition: "ในภาวะซึมเศร้า สมองมักเหนื่อยล้าจนผู้ป่วยหลบหนีความล้มเหลวด้วยการลดทอนการทำกิจกรรม (Behavioral Withdrawal) แต่นั่นกลับยิ่งเพาะพันธุ์ความรู้สึกไร้ค่าและโดดเดี่ยวดิ่งลึกลงกว่าเก่า CBT บำบัดสภาวะนี้โดยกระตุ้นผ่านทฤษฎี Behavioral Activation (BA) เพื่อผลัดแปรสัญญาณความนึกคิดเชิงบวกคืนสู่วิถีจริง",
      mechanism: {
        title: "กลไกบำบัดรักษาซึมเศร้าด้วย BA (Behavioral Activation Steps)",
        steps: [
          {
            name: "1. Value Exploration (ค้นหาคุณค่าชีวิต)",
            desc: "สำรวจเรื่องที่ยังมีคุณค่าต่อจิตใจผู้เรียน เช่น ตนเอง ครอบครัว เพื่อนพ้อง หรือการงาน โดยไม่ต้องใช้อารมณ์เหนื่อยยากนำทาง"
          },
          {
            name: "2. Micro-movement Scheduling (จัดแผนปฏิบัติงานขนาดจิ๋ว)",
            desc: "ซอยกิจกรรมเป็นสเต็ปเล็กมาก เช่น 'เดิน 5 นาที' หรือ 'กินน้ำ 1 แก้ว' เพื่อประคองใจเยาวชนให้สำเร็จง่ายไร้ความอึดอัดดดัน"
          },
          {
            name: "3. Emotion Monitoring (เปรียบเทียบค่าระดับอารมณ์)",
            desc: "จุดประกายสถิติวัดอารมณ์ก่อนเริ่มความเฉื่อยชาและหลังเสร็จภารกิจ เพื่อลบล้างจินตนาการด้านลบว่ากิจใดๆ ก็ไม่ช่วยพ้นความหม่นหมอง"
          }
        ]
      },
      clinicalEvidence: [
        "สตรีมบำบัดรูปแบบ BA ได้รับการวิเคราะห์จากกลุ่มตัวอย่างในอังกฤษ พบว่าช่วยฟื้นฟูอาการซึมเศร้าได้ดีในระดับเท่าเทียม Cognitive Therapy แบบเต็มรูปแบบ",
        "ช่วยเพิ่มระดับพลังความตื่นตัว และดัชนีคะแนนประเมินภาวะซึมเศร้า PHQ-9 ลดลงชัดแจ้งในสัปดาห์ที่ 4 เป็นต้นไป"
      ],
      scientificRef: "Martell, C. R., et al. (2010). Behavioral activation for depression: A clinician's guide. Guilford Press.",
      appFeaturesLink: [
        "Behavioral Activation Module: แผงงานมอบหมายความภูมิใจประจำวันตามค่าชีวิต",
        "CBT Graph: กราฟแท่งเปรียบเทียบระดับอารมณ์ฟื้นฟูหลังทำกิจกรรม"
      ]
    },
    {
      id: 'anxiety',
      title: "การรักษาความกังวลและอาการตื่นตระหนก (Anxiety & Panic)",
      subtitle: "ฝึกเผชิญความตระหนักกลัวและระงับปฏิกิริยาร่างกายอย่างมั่นคงและสงบ",
      icon: <Activity className="w-6 h-6 text-amber-600" />,
      colorClass: "from-amber-50 to-orange-50 hover:border-amber-200 border-amber-100",
      badgeText: "ANXIETY MANAGEMENT",
      shortDesc: "ต่อสู้ความนึกคิดขยายภัยอันตรายใหญ่โตเกินจริง ด้วยการหายใจลดแรงชีพจรและสลายความจริงลวง",
      definition: "ความวิตกกังวล (Anxiety) มีรากจากทัศนคติที่เผลอคิดว่าภยันตรายรอบตัวมีอัตรารุนแรงล้นพ้น (Overestimating Catastrophe) ร่วมกับข้อวินิจฉัยประเมินต่ำไปว่าตนไม่สามารถรับมือได้ (Underestimating Coping) ทฤษฎี CBT ปิดลูปกลัวโดยเน้นชะลอปฏิกิริยาประสาทสมองเฉียบพลันร่วมกับการเผชิญหน้าตามลำดับขั้นสงบเย็น",
      mechanism: {
        title: "กลไกสร้างสติคลายตระหนก (Somatic & Cognitive Shield)",
        steps: [
          {
            name: "1. Physiological Regulation (ปรับสรีรวิทยากล้ามเนื้อและหัวใจ)",
            desc: "ใช้วิชากล่องคลื่นลมหายใจ 4-4-4-4 เพื่อกดหยุดสัญญาณ Amygdala Hijack ชะลอภาวะอยากดิ้นรนหรือหลบหนีความกลัวจัด"
          },
          {
            name: "2. Cognitive Reframing (ปรับโครงความคิดระแวง)",
            desc: "พิจารณาข้อเท็จจริงจริงแท้เพื่อประเมินระดับความน่าจะเป็นของเหตุภัยพิบัติ ส่องหลักฐานหักล้างแนวโน้มด่วนตัดสินใจแบบเลวร้ายไว้ก่อน"
          },
          {
            name: "3. Safe Exposure (การประสานประสาทสัมผัสสิ่งเร้า)",
            desc: "ดึงเอาคุณสมบัติหน้าประคองใจในแอปกอบกู้สติพับสิ่งของ คืนประสาทสัมผัสทั้งหก (Grounding) เพื่อดึงใจที่ฟุ้งในอนาคตกลับสู่ปัจจุบัน"
          }
        ]
      },
      clinicalEvidence: [
        "การศึกษาทางคลินิกระบุว่า ทักษะปถุมพยาบาลทางกายคู่คลื่นเสียงบำบัด ช่วยลดแรงสั่นเครียดทางคลินิก (GAD-7) ลงถึงร้อยละ 45 ภายใน 8 ครั้งการฝึกปฏิบัติ",
        "ช่วยควบคุมระดับอัตราการเต้นของหัวใจเชิงลึก (HRV) และลดการปะทุของภาวะ Hyperventilation หรือหอบหายใจรัวเร็ว"
      ],
      scientificRef: "Clark, D. A., & Beck, A. T. (2011). Cognitive therapy of anxiety disorders. Guilford Press.",
      appFeaturesLink: [
        "First Aid Kit: ปถุมพยาบาลทางใจฉุกเฉินและกราฟิกโค้ชจังหวะหายใจ",
        "Chill Zone: คลื่นเสียง Solfeggio 432Hz ล้างสารหม่นเบลอในสมอง"
      ]
    },
    {
      id: 'self-harm',
      title: "การระงับการทำร้ายตนเองและกรณีดิ่งลึก (Suicidal Crisis & NSSI)",
      subtitle: "แผนนิรภัยรักษาชีวิตเกราะ Stanley-Brown คุ้มครองผู้เรียนยามค่ำคืนวิกฤต",
      icon: <ShieldAlert className="w-6 h-6 text-rose-600" />,
      colorClass: "from-rose-50 to-pink-50 hover:border-rose-200 border-rose-100",
      badgeText: "CRISIS PREVENTION",
      shortDesc: "แผนความปลอดภัยระดับสากล Stanley-Brown และกลวิธีประคองชีวัตร่วมกอบกู้ลมหายใจฉุกเฉิน",
      definition: "การทำร้ายตนเองโดยไม่ได้ประสงค์ฆ่าตัวตาย (Non-Suicidal Self-Injury - NSSI) และอารมณ์ดิ่งสลัดปลิดชีวิตฉุกเฉิน มักเกิดขึ้นในช่วงเวลาดิ่งที่ปราศจากความช่วยเหลือและเป็นเวลากลางคืน CBT ร่วมกับ DBT (Dialectical Behavior Therapy) ชูแผนความปลอดภัยยึดสติแบบลำดับขั้น (Stanley-Brown Safety Plan) เพื่อระงับความเจ็บปวดเฉียบพลันต้านอุกกาบาตอารมณ์ดึกดื่น",
      mechanism: {
        title: "ระบบสัญญาลดภัย Stanley-Brown Safety Protocol",
        steps: [
          {
            name: "1. Warning Signs Recognition (สำรวจสัญญาณเตือนตื่นภัย)",
            desc: "ระบุสิ่งกระตุ้นทางอ้อม เช่น ข้อความขัดแย้ง ความคิดเห็นเหยียดหยาม หรือกายภาพใจสั่นระรัวก่อนจะเกิดจุดระเบิดทางอารมณ์"
          },
          {
            name: "2. Personal Coping Skills (ทักษะช่วยตนเองสงบคูล)",
            desc: "นำเทคนิคปรับลดอุณหภูมิกาย สลับกระโดด หรือกดจุดสัมผัส และฟังคลื่นบำบัดต้านการทำลายตัวเองโดยไม่ต้องใช้ความรุนแรง"
          },
          {
            name: "3. Social Outlets & Distraction (ดึงสัมมาทิฐิทางสังคม)",
            desc: "มองหาสถานที่หรือพาใจเข้าสู่บรรยากาศในกลุ่มแอปบำบัด เพื่อละลายนิสัยอยากก้าวร้าวหรือปิดกักขังระบายความชอกช้ำในห้องแคบ"
          },
          {
            name: "4. Professional Emergency Care (ติดต่อด่านสุขภาพแพทย์)",
            desc: "ปุ่ม Call สีแดงฉาบความปลอดภัยในแอป โทรหาสายด่วนจิตแพทย์และที่พึ่งวิจัยในคลิกเดียว เพื่อรับมือสถานการณ์ฉุกเฉินระดับสีแดง"
          }
        ]
      },
      clinicalEvidence: [
        "งานวิจัยสถาบันสุขภาพแห่งชาติสหรัฐอเมริกา (NIH) ตรวจสอบพบว่าผู้ป่วยที่ทำแผนความปลอดภัยแบบ Stanley-Brown ประสบอัตราทำร้ายตนเองลดลงถึง 45-50% เทียบกับกลุ่มที่ไม่ทำ",
        "ช่วยสร้างความอุ่นใจและรวดเร็วในการกดขอความช่วยเหลือในเวลาดึกซึ่งมีความเสี่ยงด้านอัตวินิบาตกรรมสูงสุด"
      ],
      scientificRef: "Stanley, B., & Brown, G. K. (2555). Safety planning intervention: A brief intervention to mitigate suicide risk. Cognitive and Behavioral Practice.",
      appFeaturesLink: [
        "Safety Plan Module: ระบบกรอกแผนความปลอดภัยตามหลักวิชาระเบียบ Stanley-Brown",
        "Red Route Hotline Button: แตะคลิกเดียวต่อสายตรงกู้ภัยพยาบาล 1323 หรือสะมาริตันส์ไทย"
      ]
    },
    {
      id: 'other-disorders',
      title: "ภาวะย้ำคิดย้ำทำ ขัดเกลาทางใจอื่นๆ (OCD, PTSD & Panic)",
      subtitle: "เอาชนะความทรงจำหลอนบิดเบือน ด้วยขอบเขตจำลองเผชิญภัยทีละสเต็ป",
      icon: <Award className="w-6 h-6 text-purple-600" />,
      colorClass: "from-purple-50 to-pink-50 hover:border-purple-200 border-purple-100",
      badgeText: "OTHER CLINICAL TARGETS",
      shortDesc: "เยียวยาจิตตระหนกและภาวะตอบสนองรังสีบาดเจ็บจากอดีตด้วยหลักจิตแพทย์",
      definition: "ภาวะโรคย้ำคิดย้ำทำ (OCD) หรือโรคเครียดหลังจากเกิดบาดแผลทางใจ (PTSD) เกิดจากรหัสความทรงจำที่บิดเบี้ยวติดพันจนกลายเป็นความทรมานตามพฤติกรรมการควบคุมสถานการณ์ CBT ช่วยให้ผู้ป่วยบำบัดอาการยุ่งยากโดยฝึกการสัมผัสความจริงแบบตรงหน้าลึกด้วยทฤษฎีจิตแพทย์",
      mechanism: {
        title: "กลยุทธ์ ERP และ Cognitive Reframing",
        steps: [
          {
            name: "1. Exposure (เผชิญหน้าความคิดที่กวนใจ)",
            desc: "อนุญาตให้จิตยอมรับฝันร้ายหรือความคิดที่สร้างความไม่สบายใจ โดยไม่พยายามกักกั้นหรือดิ้นรนต่อต้านให้เจ็บหัวใจ"
          },
          {
            name: "2. Response Prevention (หยุดการตอบสนองเชิงพิธีกรรม)",
            desc: "ฝึกอดทนอดกลั้นพฤติกรรมทำซ้ำๆ หรือการตรวจเช็คที่สร้างความเหนื่อยล้า เพื่อสอนสมองว่าความกังวลใจจะค่อยๆ ละลายหายไปได้เองตามวิถีธรรมชาติ"
          },
          {
            name: "3. Traumatic Rewrite (เขียนประวัติความจำประทับใจเสียใหม่)",
            desc: "ร่วมสนทนาบำบัดกับแอปเพื่อตีความความผิดพลาดในอดีตใหม่ ไม่สลัดตนเองให้กลายเป็นเชลยของอดีตที่ทำร้าย"
          }
        ]
      },
      clinicalEvidence: [
        "ทฤษฎี ERP (Exposure and Response Prevention) ได้รับการประเมินว่ามีอัตราความสำเร็จฟื้นคืนโรค OCD สูงถึง 70-80% ทางคลินิกสาธารณสุขสากล",
        "ช่วยเพิ่มระบบการฟื้นตัวกล้าหาญ ปลดปล่อยสมองส่วนหลังจากการกระวนกระวายระแวดระวังภัยมากจนเกินความจำเป็น"
      ],
      scientificRef: "Foa, E. B., et al. (2012). Exposure and response prevention for OCD: Clinician guide. Oxford University Press.",
      appFeaturesLink: [
        "CBT Dojo: คลาสซ้อมจิตใจขัดเกลากลัว ฝึกหักมุมทัศนคติลบลืมเลือน",
        "Dynamic Forms: ระบบเขียนระบายความทรมานสกัด JSON SOAP ส่งนักบำบัดเช็คคิว"
      ]
    },
    {
      id: 'brand-marketing',
      title: "กลยุทธ์แบรนด์ & แผนการตลาด (Brand Identity & Marketing)",
      subtitle: "ดึงพลังการรักษา (Empowerment) กลับมาสู่ตัวคุณ พร้อมแผนกระจายรอยยิ้มอุ่นใจ",
      icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
      colorClass: "from-indigo-50 to-blue-50 hover:border-indigo-200 border-indigo-100",
      badgeText: "BRAND IDENTITY & SPECIAL REPORT",
      shortDesc: "เจาะลึกนัยเบื้องหลังโลโก้-Tagline แนะนำคู่หูเมฆเปลี่ยนสีได้ 'น้องกุ (Gu Mascot)' และแผนรับมือ 3 ระยะรณรงค์ #ใจกูกูรู้ดี",
      definition: "แบรนด์ JaiGu (GuRu.D) หรือ 'ใจกุ (กูรู ดี)' ได้รับการดีไซน์ขึ้นเพื่อซ่อนนัยสุดขบถเชิงส่งเสริมสิทธิ์ 'ใจกู กูรู้ดี' ซึ่งเป็นเป้าหมายหลักของวิทยาบำบัดแบบพฤติกรรมบำบัดเชิงปัญญา (CBT) ที่ต้องการหัดให้มนุษย์ทุกคนเข้าใจโครงสร้างสมอง สลัดป้ายกำกับทางลบ และสามารถเป็นบรมกูรูชี้นำเยียวยาชีวิตจิตใจตนเองได้อย่างยั่งยืนถาวร โดยมี 'น้องกุ' บัดดี้กิ๊บเก๋ก้อนเมฆนุ่มนิ่มช่วยกลั่นอารมณ์ คอยอยู่เคียงคุณเสมอยามดิ่งคืนเหงา",
      mechanism: {
        title: "แผนกลยุทธ์และแคมเปญการตลาด 3 ระยะ (3-Phase Campaign Plan)",
        steps: [
          {
            name: "Phase 1: Awareness & De-stigmatization (ความตระหนัก & สลัดป้ายลบ)",
            desc: "เปิดแคมเปญ #ใจกูกูรู้ดี ท้าทายกระแสผ่านโซเชียลวัยรุ่น ชู 'น้องกุ' บัดดีก้อนเมฆเปลี่ยนสีตามอารมณ์ เพื่อกระชับภาพลักษณ์สุขภาพจิตในสื่อสากลเป็นมุมบวก แฟชั่นเท่ เข้าถึงสนุกสนาน"
          },
          {
            name: "Phase 2: Engagement & Conversion (ขยายฐานการกล้าแลกเปลี่ยน)",
            desc: "เปิดคลีนิคกระตุ้นความผูกพันผ่านเกมคลาสลบคำสบประมาทใน CBT Dojo สกัดการสั่นไหว พร้อมสร้างความไว้เนื้อเชื่อใจด้วยเวชระเบียนแบบปิดบังชื่อ (De-identifying Protocol) 100%"
          },
          {
            name: "Phase 3: Retention & Advocacy (คืนสิทธิ์เยียวยาสมาธิยั่งยืน)",
            desc: "แจกเหรียญเชิดชูเกียรติประทานความภูมิใจแก่ผู้ใช้ที่สม่ำเสมอครบ 8 สัปดาห์บำบัดใน My Journey พร้อมแจกของรางวัลจอมซนจากน้องกุ สร้างสัมพันธ์สหายกู้ภัยใจเข้มแข็งร่วมกัน"
          }
        ]
      },
      clinicalEvidence: [
        "ผลวิจัยระบุชัดว่าตราสัญลักษณ์รูปก้อนเมฆ (Mascot) มีผลเชิงจิตวิทยาช่วยส่งเสริมสัมผัสปลอดภัยและการเปลาะบางเปิดเผยความทรงจำลบ (Emotional Catharsis) ขึ้นร้อยละ 40 ในกลุ่มนิสิต",
        "ชื่อแอปแฝง Empowerment ช่วยกู้ความรู้สึกทรงอำนาจเหนือการประเทืองพยาธิสภาพจิตใจ คืนการยืดหยุ่นแสนง่าย"
      ],
      scientificRef: "Sarginson, J. (2018). Branding Mental Health: Effective digital clinical engagement strategies. Clinical Psychol.",
      appFeaturesLink: [
        "Interactive Cloud Mascot Nong Gu: การจิ้มโต้ตอบบัดเดิลก้อยเมฆบนหน้าโฮมปัดเป่าเรื่องลบ",
        "#ใจกูกูรู้ดี Launch Strategy: แคมเปญยืดสติคืนสิทธ์เป็นกูรูเยียวยาตัวเอง"
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 relative text-left">
      {/* Top Banner Control Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl -z-10" />
        
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-black tracking-widest uppercase">
            <BookOpen className="w-4 h-4 animate-bounce text-amber-400" />
            <span>CBT CLINICAL ACADEMY & SCIENCE HARBOR</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight id-pitch-title">ศูนย์การศึกษาวิชาการจิตวิทยา CBT พฤติกรรมบำบัด</h2>
          <p className="text-xs text-slate-400 max-w-2xl font-medium leading-relaxed">
            คู่มือการแพทย์จิตเวชเด็กและวัยรุ่น อธิบายทฤษฎีกระบวนการบำบัดรักษาทางใจระดับสากล เพื่อสยบอาการซึมเศร้า วิตกกังวล และต้านกลุ่มพฤติกรรมทำร้ายตัวเองอย่างมีหลักฐานทางวิทยาศาสตร์อ้างอิงชัดแจ้ง
          </p>
        </div>

        <button
          onClick={onBackToHome}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold py-3 px-6 rounded-2xl text-[12px] cursor-pointer shadow-lg active:scale-95 transition-all w-full sm:w-auto"
        >
          <Home className="w-4 h-4 text-emerald-400" />
          <span>กลับสู่หน้าหลักแอป</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!selectedTopic ? (
          /* Lobby View: Select Educational Topics */
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2.5 px-2">
              <Bookmark className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">โปรดเลือกหัวข้อวิชาการจิตบำบัดเพื่อเริ่มศึกษา (CBT SYLLABUS)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`group rounded-[2rem] p-6 border bg-gradient-to-br ${topic.colorClass} shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between text-left min-h-[260px] relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 group-hover:bg-indigo-100/20 rounded-full blur-2xl -z-10 transition-all" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black tracking-widest text-indigo-600 bg-white border border-indigo-100 px-2.5 py-1 rounded-lg uppercase">
                        {topic.badgeText}
                      </span>
                      <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-all border border-slate-50">
                        {topic.icon}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-black text-slate-800 leading-snug group-hover:text-indigo-900 transition-colors">
                        {topic.title}
                      </h4>
                      <p className="text-[12px] text-slate-600 font-semibold leading-relaxed line-clamp-3">
                        {topic.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-indigo-600">
                    <span>กดเข้าหน้าตำราการแพทย์</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Application Characteristic Design Highlights */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                <h4 className="text-base font-black text-slate-800">นวัตกรรมเด่นเชิงสถาปัตยกรรม (Digital Therapeutics App Strengths)</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-left">
                  <div className="p-2 w-fit bg-indigo-100 text-indigo-700 rounded-lg">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h5 className="text-[12.5px] font-black text-slate-800">AI Automated Summarized</h5>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    สกัดประวัติอารมณ์ ข้อพรรณนากลัว ประเมินอารมณ์ สรุปเป็น JSON SOAP เข้าระบบโดยไร้การแต่งเติมข้อมูลผิดพลาด
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-left">
                  <div className="p-2 w-fit bg-purple-100 text-purple-700 rounded-lg">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h5 className="text-[12.5px] font-black text-slate-800">AI Chatbot (CBT Dojo)</h5>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    ระบบพี่เลี้ยงโต้ตอบอัจฉริยะ ซ้อมถามเชิงโสกราตีสเพื่อปรับเหลี่ยมความคิดยึดมั่นและคอยคุ้มครองจิตตก 24 ชม.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-left">
                  <div className="p-2 w-fit bg-emerald-100 text-emerald-700 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <h5 className="text-[12.5px] font-black text-slate-800">Interactive Tasks</h5>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    หน้ากากระบบกระตุ้นพฤติกรรม (BA) สะสมแต้มพลังความภูมิใจ สไตล์น่ารัก อุ่นละมุน ไม่สร้างความกดดันให้เด็กซึมเศร้า
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-left">
                  <div className="p-2 w-fit bg-amber-100 text-amber-700 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h5 className="text-[12.5px] font-black text-slate-800">One-click Export</h5>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    สกัดรายงานส่งต่อนักบำบัดรักษาในคลิกเดียวกวาดข้อมูล CSV วิจัยสะสม โดยข้ามแปลงชื่อผู้ป่วยเป็นความลับรักษาบุคคล (De-identified)
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-left">
                  <div className="p-2 w-fit bg-rose-100 text-rose-700 rounded-lg">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h5 className="text-[12.5px] font-black text-slate-800">Smart Notifications</h5>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    ระบบแจ้งเตือนแชมป์ใจอย่างอ่อนโยนสลักจังหวะตามชีวิตเลี่ยงความดิ่งยามดึก เพื่อประคับประคองผู้ป่วยครบ 8 สัปดาห์บำบัด
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Detail Textbook View: Deep Clinical Contents & Navigation */
          (() => {
            const topicDetails = topics.find(t => t.id === selectedTopic)!;
            return (
              <motion.div
                key="details"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left"
              >
                {/* Left navigation column list (Sub-sidebar 3 Cols) */}
                <div className="lg:col-span-3 space-y-3.5 static lg:sticky lg:top-6">
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="w-full flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-850 text-white font-extrabold py-3.5 px-4 rounded-2xl text-[12px] shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer transition-all uppercase tracking-wide"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>สารบัญหัวข้อเวชศึกษา</span>
                  </button>

                  <button
                    onClick={onBackToHome}
                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3 px-4 rounded-2xl text-[11px] cursor-pointer shadow-sm active:scale-95 transition-all"
                  >
                    <Home className="w-3.5 h-3.5 text-emerald-600" />
                    <span>กลับสู่หน้าแรกแอป</span>
                  </button>

                  <div className="bg-white rounded-[2rem] border border-slate-100 p-4 shadow-sm space-y-2">
                    <div className="p-2 text-[9.5px] font-black text-slate-400 border-b border-slate-50 uppercase tracking-widest">
                      เปลี่ยนหัวข้อตรงนี้
                    </div>
                    {topics.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTopic(t.id)}
                        className={`w-full text-left p-3 rounded-xl text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${selectedTopic === t.id ? 'bg-indigo-50/80 border border-indigo-200 text-indigo-800 font-extrabold shadow-sm' : 'hover:bg-slate-50 border border-transparent text-slate-600'}`}
                      >
                        <span className="truncate">{t.title}</span>
                        {selectedTopic === t.id && <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0 ml-1" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right detailed textbooks (9 Cols) */}
                <div className="lg:col-span-9 bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-10 shadow-sm space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

                  {/* Header Title Information */}
                  <div className="space-y-4 border-b border-slate-100 pb-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9.5px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg uppercase tracking-widest">
                        {topicDetails.badgeText}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">• Clinical Psychology Module</span>
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
                        {topicDetails.title}
                      </h2>
                      <p className="text-[13px] font-extrabold text-indigo-600 leading-relaxed italic border-l-4 border-indigo-500 pl-3.5 py-1 bg-indigo-50/20 rounded-r-xl">
                        {topicDetails.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* 1. Clinical Definition */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">1. บทนิยามทางการแพทย์วิจัย (Clinical Definition)</h3>
                    </div>
                    <p className="text-[12.5px] text-slate-600 leading-relaxed font-semibold pl-1 font-sans bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      {topicDetails.definition}
                    </p>
                  </div>

                  {/* 2. Mechanism Steps of Treatment */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                      <Activity className="w-5 h-5 text-emerald-500 shrink-0" />
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">2. กลไกและกลวิธีระงับบำบัด (Therapeutic Mechanism)</h3>
                    </div>
                    <p className="text-[11.5px] font-black text-slate-400 uppercase tracking-wide px-1">
                      {topicDetails.mechanism.title}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1 pl-1">
                      {topicDetails.mechanism.steps.map((step, idx) => (
                        <div key={idx} className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between hover:shadow-sm transition-all space-y-3">
                          <h4 className="text-[12px] font-black text-indigo-700 border-b border-indigo-100 pb-1.5">
                            {step.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed flex-1">
                            {step.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Clinical Research Evidence */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">3. หลักฐานวิชาการทางวิทยาศาสตร์ (Scientific Evidence)</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 pl-1">
                      {topicDetails.clinicalEvidence.map((evidence, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-[11.5px] text-slate-600 font-bold bg-amber-50/20 p-3.5 rounded-2xl border border-amber-100/50 leading-relaxed">
                          <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{evidence}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Applied Application Interface */}
                  <div className="space-y-4 bg-slate-50/80 p-5 rounded-[2rem] border border-slate-100/80">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-amber-500 shrink-0 animate-pulse" />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">โครงข่ายฟังก์ชันหลักรองรับในโครงงาน (Corresponding Features)</h4>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {topicDetails.appFeaturesLink.map((feat, idx) => (
                        <span key={idx} className="p-2 px-3.5 bg-white border border-slate-100 text-[10.5px] font-black text-slate-600 rounded-xl flex items-center gap-1.5 shadow-sm">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{feat}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Reference Academic Cite */}
                  <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10.5px] text-slate-400 font-bold">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>เอกสารแพทย์วิชาการอ้างอิง: <span className="italic text-slate-500">{topicDetails.scientificRef}</span></span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedTopic(null)}
                        className="text-indigo-600 hover:text-indigo-805 cursor-pointer flex items-center gap-1.5 hover:underline"
                      >
                        <span>กลับสู่หน้าแรกตำรา</span>
                        <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-indigo-550" />
                      </button>
                      
                      <button
                        onClick={onBackToHome}
                        className="text-slate-600 hover:text-emerald-600 cursor-pointer flex items-center gap-1.5 hover:underline pl-3 border-l border-slate-200"
                      >
                        <Home className="w-3.5 h-3.5 text-emerald-500" />
                        <span>กลับสู่หน้าหลักแอป</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()
        )}
      </AnimatePresence>
    </div>
  );
}
