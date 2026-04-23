
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

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === '') {
      console.error('--- [AI ERROR] API Key is missing or invalid ---');
      return NextResponse.json({ 
        error: 'مفتاح الـ API لـ Google AI Studio غير موجود في ملف الـ .env. يرجى إضافته لكي يعمل التحليل الذكي.' 
      }, { status: 401 });
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
    قم بتحليل صورة ورقة الامتحان المرفقة واستخرج البيانات التالية بدقة شديدة:
    1. رقم القيد الجامعي (Registration ID): ابحث عن أي أرقام تعريفية أو أكاديمية للطالب.
    2. اسم الطالب (Student Name): استخرج الاسم الرباعي المكتوب بخط اليد أو المطبوع.
    3. اسم المادة (Subject Name): استخرج اسم المادة الدراسية المكتوبة في ترويسة الورقة.

    يجب أن تكون المخرجات بصيغة JSON فقط كالتالي:
    {
      "studentRegistrationId": "رقم القيد المستخرج",
      "studentName": "اسم الطالب الكامل",
      "subjectName": "اسم المادة"
    }
    ملاحظة: إذا لم تجد أي بيان، اترك الحقل فارغاً. ركز جداً على الأرقام المكتوبة يدوياً.`;

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
    
    // تنظيف وتفسير النتيجة لضمان الحصول على JSON صالح
    let parsedData;
    try {
      const cleanJson = text.replace(/```json|```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('--- [AI PARSE ERROR] ---', text);
      return NextResponse.json({ error: 'فشل النظام في معالجة مخرجات الذكاء الاصطناعي.' }, { status: 500 });
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('--- [AI CRASH] ---', error);
    
    // نظام الاستجابة للأخطاء الشائعة من جوجل
    if (error.message?.includes('429')) {
      return NextResponse.json({ error: 'لقد تجاوزت حد الاستخدام المجاني المؤقت من جوجل. يرجى الانتظار دقيقة والمحاولة ثانية.' }, { status: 429 });
    }
    
    if (error.message?.includes('403')) {
      return NextResponse.json({ error: 'تم رفض الوصول. قد يكون مفتاح الـ API غير صالح أو غير مفعل.' }, { status: 403 });
    }
    
    return NextResponse.json({ 
      error: 'فشل النظام في قراءة الورقة ذكياً. تأكد من جودة الصورة واتصال الإنترنت.',
      details: error.message 
    }, { status: 500 });
  }
}
