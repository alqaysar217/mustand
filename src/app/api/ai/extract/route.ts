
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview مسار API المطور للتحليل الذكي للاختبارات.
 * يستخدم Gemini 1.5 Flash (المجاني) مع تحسينات للقراءة العربية.
 */

export async function POST(req: NextRequest) {
  try {
    const { examImageDataUri } = await req.json();
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      console.error('--- [AI ERROR] API Key is missing or invalid ---');
      return NextResponse.json({ 
        error: 'مفتاح الـ API غير موجود. يرجى الحصول على مفتاح مجاني من Google AI Studio ووضعه في ملف .env' 
      }, { status: 500 });
    }

    // تهيئة محرك جوجل
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // تحضير البيانات
    const base64Data = examImageDataUri.split(',')[1];
    const mimeType = examImageDataUri.split(':')[1].split(';')[0];

    const prompt = `أنت خبير في أرشفة الوثائق الأكاديمية العربية. 
    قم بتحليل صورة ورقة الامتحان المرفقة واستخرج البيانات التالية بدقة:
    1. رقم القيد الجامعي (Registration ID): ابحث عن أي أرقام تعريفية للطالب.
    2. اسم الطالب (Student Name): استخرج الاسم الرباعي المكتوب.
    3. اسم المادة (Subject Name): استخرج اسم المادة الدراسية.

    يجب أن تكون المخرجات بصيغة JSON فقط كالتالي:
    {
      "studentRegistrationId": "رقم القيد المستخرج",
      "studentName": "اسم الطالب الكامل",
      "subjectName": "اسم المادة"
    }
    ملاحظة: إذا لم تجد أي بيان، اترك الحقل فارغاً. ركز جداً على الأرقام العربية واللاتينية المكتوبة يدوياً.`;

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
    const text = response.text();
    
    // تنظيف وتفسير النتيجة
    const cleanJson = text.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('--- [AI CRASH] ---', error);
    
    // نظام الاستجابة للأخطاء الشائعة
    if (error.message?.includes('429')) {
      return NextResponse.json({ error: 'تم تجاوز حد الاستخدام المجاني المؤقت. يرجى الانتظار دقيقة والمحاولة ثانية.' }, { status: 429 });
    }
    
    return NextResponse.json({ 
      error: 'فشل النظام في قراءة الورقة ذكياً.',
      details: error.message 
    }, { status: 500 });
  }
}
