import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = (): GoogleGenAI => {
  const email = typeof window !== "undefined" ? window.localStorage.getItem("current_user_email") : null;
  const uid = typeof window !== "undefined" ? window.localStorage.getItem("current_user_uid") : null;

  let key = "";
  if (uid) {
    key = window.localStorage.getItem(`custom_gemini_api_key_${uid}`) || "";
  }

  // 1. Prioritize user's own custom key
  if (key && key.trim().startsWith("AIzaSy")) {
    return new GoogleGenAI({ apiKey: key.trim() });
  }

  // 2. Fall back to process.env.GEMINI_API_KEY if present and valid
  const devKey = process.env.GEMINI_API_KEY as string;
  if (devKey && devKey.trim().length > 0 && devKey.trim() !== "undefined") {
    return new GoogleGenAI({ apiKey: devKey.trim() });
  }

  throw new Error("REQUIRED_USER_KEY");
};

export const detectRisk = async (text: string) => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze the following text for signs of suicide risk, self-harm, or extreme hopelessness in a Thai teenage context. 
      Return a JSON object with:
      - riskLevel: "low", "medium", "high"
      - triggers: array of detected keywords or themes
      - suggestsIntervention: boolean
      
      Text: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING },
            triggers: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestsIntervention: { type: Type.BOOLEAN }
          },
          required: ["riskLevel", "triggers", "suggestsIntervention"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e: any) {
    if (e?.message === "REQUIRED_USER_KEY") {
      throw e;
    }
    console.error("Failed to parse risk detection response", e);
    return { riskLevel: "low", triggers: [], suggestsIntervention: false };
  }
};

export interface BiasedAnalysisResult {
  distortions: { type: string; descriptionTh: string }[];
  summaryTh: string;
  comfortTh: string;
  crayonQuadrant: 'high-positive' | 'high-negative' | 'low-negative' | 'low-positive';
}

export const analyzeDistortions = async (situation: string, thought: string): Promise<BiasedAnalysisResult> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `วิเคราะห์สาระสำคัญและความคิดลบอัตโนมัติ (CBT Cognitive Distortions) จากผู้ใช้ที่กำลังเผชิญเหตุการณ์นี้:
      
      สถานการณ์ที่เจอ: "${situation}"
      ความคิดในหัวที่มี: "${thought}"
      
      ช่วยวิเคราะห์อคติทางความคิดที่พบบ่อย (อ้างอิงหลักการจิตวิทยา CBT):
      1. วิเคราะห์หาอคติหรือความผิดพลาดทางความคิด (distortions) เช่น คิดขาวดำ, กรองลบ, ด่วนสรุป, คาดเดาอนาคตแย่ๆ, กล่าวโทษขยายใหญ่โต (จำกัดไม่เกิน 3 ข้อ)
      2. สรุปเป็นภาษาไทยสั้นๆ (summaryTh) อบอุ่น ชัดเจน ลื่นไหลเข้ากับสถานการณ์และความคิดที่เป็นทุกข์ เพื่อให้ผู้ใช้ได้ตระหนักรู้อย่างลึกซึ้งเกี่ยวกับการบิดเบือนความคิดครั้งนี้
      3. สร้างประโยคคำแนะนำสั้นๆ เพื่อการจัดการความคิด (comfortTh) ที่อ่านแล้วอบอุ่นใจ รู้สึกมีแรงพลังใจ สยบอารมณ์ดิ่งเศร้าง่ายขึ้น (แนะนำให้น่าฟัง คล้ายบทกวีหรือคำสร้างพลังใจอันอ่อนโยน)
      4. แนะนำสีเทียนวิเศษ/ภาพวาด (crayonQuadrant) ตามกลุ่มอารมณ์หลักจากสิ่งนี้:
         - 'high-negative': รู้สึกเครียด โกรธ วิตกกังวลสูง หัวร้อนรุมเร้า
         - 'low-negative': รู้สึกอ้างว้าง ละเหี่ยใจ เหนื่อยล้า เศร้าเหงา ดิ่งไร้เรี่ยวแรง
         - 'low-positive': รู้สึกพอเข้าใจและพร้อมสงบใจลง
         - 'high-positive': มีจุดเริ่มต้นแห่งความหวัง/ดีใจเบาๆ`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            distortions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  descriptionTh: { type: Type.STRING }
                },
                required: ["type", "descriptionTh"]
              }
            },
            summaryTh: { type: Type.STRING },
            comfortTh: { type: Type.STRING },
            crayonQuadrant: { type: Type.STRING }
          },
          required: ["distortions", "summaryTh", "comfortTh", "crayonQuadrant"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      distortions: result.distortions || [],
      summaryTh: result.summaryTh || '',
      comfortTh: result.comfortTh || '',
      crayonQuadrant: result.crayonQuadrant || 'low-negative'
    };
  } catch (e: any) {
    if (e?.message === "REQUIRED_USER_KEY") {
      throw e;
    }
    console.error("Failed to parse distortion analysis", e);
    return {
      distortions: [],
      summaryTh: "ความคิดนี้กำลังพาให้คุณมองข้ามมุมดีๆ ไปสักหน่อย",
      comfortTh: "ไม่ว่าคืนนี้จะมืดมิดเพียงใด วันใหม่ก็พร้อมจะฉายแสงเสมอ",
      crayonQuadrant: 'low-negative'
    };
  }
};

export const getPsychoeducation = async (query: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        systemInstruction: "You are a supportive, Thai-speaking mental health assistant for teenagers. Use clinical knowledge from CBT and DBT. Be empathetic, non-judgmental, and safe. If the user mentions self-harm, prioritize safety and suggest the Safety Plan. Keep answers concise and age-appropriate (Thai teenager context)."
      }
    });
    return response.text || "ขออภัยด้วยค่ะ ไม่ได้รับคำตอบในเวลานี้";
  } catch (e: any) {
    if (e?.message === "REQUIRED_USER_KEY") {
      return "🔒 ขออภัยด้วยค่ะ เนื่องจากขณะนี้คุณล็อกอินเข้าร่วมแอปในฐานะผู้ใช้ภายนอก เพื่อประโยขน์และขอบเขตข้อตกลงการป้องกันการดึงโควตาจำกัดของเซิร์ฟเวอร์ กรุณาเพิ่ม 'Google Gemini API Key' ส่วนตัวของคุณในหน้าข้อมูลส่วนตัว (แท็บ Profile ด้านล่างขวา) ก่อนนะคะ ระบบจะเริ่มแนะนำฝึกคิดได้อย่างฉลาดลึกซึ้งทันทีเลยค่ะ! 🤍 (สามารถรับ API Key ได้ฟรี ไม่มีค่าใช้จ่ายที่ Google AI Studio)";
    }
    console.error("Failed to run psychoeducation assistant", e);
    return "ขออภัยด้วยค่ะ ระบบประมวลผลขัดข้องชั่วคราว ลองเริ่มใหม่อีกครั้งนะคะ";
  }
};
