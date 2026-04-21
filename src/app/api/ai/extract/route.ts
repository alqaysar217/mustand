
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview مسار API للتحليل الذكي للاختبارات باستخدام مكتبة Google AI الرسمية.
 * تم التحديث لضمان أقصى قدر من الاستقرار وتجنب أخطاء الروابط اليدوية (404).
 */

export async function POST(req: NextRequest) {
  try {
    const { examImageDataUri } = await req.json();
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      console.error('--- [AI ERROR] API Key missing in environment ---');
      return NextResponse.json({ error: 'مفتاح الـ API غير معرف في النظام.' }, { status: 500 });
    }

    // تهيئة SDK جوجل الرسمي
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // استخراج بيانات Base64 ونوع الملف
    const [header, base64Data] = examImageDataUri.split(',');
    const mimeType = header.split(':')[1].split(';')[0];

    const prompt = `تحليل ورقة الامتحان المستخرجة.
    استخرج بدقة البيانات التالية باللغة العربية:
    1. رقم القيد (أرقام فقط).
    2. اسم الطالب (الاسم الرباعي).
    3. اسم المادة الدراسية.
    
    يجب أن تكون المخرجات بصيغة JSON صالحة فقط بهذا الهيكل:
    {
      "studentRegistrationId": "...",
      "studentName": "...",
      "subjectName": "..."
    }
    لا تضف أي نصوص توضيحية أو مارك داون.`;

    console.log('--- [AI REQUEST START] ---');
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        },
      },
    ]);

    const response = await result.response;
    const aiResponseText = response.text();
    
    console.log('--- [AI RAW RESPONSE] ---', aiResponseText.substring(0, 100));

    // تنظيف استجابة JSON من أي Markdown محتمل
    const cleanJson = aiResponseText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    console.log('--- [AI SUCCESSFUL PARSE] ---');
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error('--- [AI ROUTE CRASH] ---', error);
    return NextResponse.json({ 
      error: 'فشل النظام في معالجة طلب التحليل الذكي.',
      details: error.message 
    }, { status: 500 });
  }
}
