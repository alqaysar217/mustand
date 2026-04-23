
import { NextRequest, NextResponse } from 'next/server';
import { extractExamDetails } from '@/ai/flows/extract-exam-details';

/**
 * @fileOverview مسار API مطور لاستدعاء نظام التحليل الذكي مع تقارير أخطاء مفصلة.
 */

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'مفتاح الـ API لـ Google AI Studio مفقود. يرجى إضافته لكي يعمل التحليل الذكي.' 
      }, { status: 401 });
    }

    const body = await req.json();
    if (!body.examImageDataUri) {
      return NextResponse.json({ error: 'لم يتم إرسال صورة للتحليل.' }, { status: 400 });
    }

    // استدعاء الـ Flow مع معالجة الأخطاء الداخلية
    const result = await extractExamDetails({ examImageDataUri: body.examImageDataUri });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('--- [API ROUTE ERROR] ---', error);
    
    // التعامل مع أخطاء جوجل الشائعة بشكل ودي للمستخدم
    const errorMessage = error.message || '';
    if (errorMessage.includes('429')) {
      return NextResponse.json({ error: 'تم تجاوز حد الاستخدام المجاني المؤقت. يرجى الانتظار دقيقة والمحاولة مجدداً.' }, { status: 429 });
    }
    
    return NextResponse.json({ 
      error: 'حدث خطأ أثناء معالجة الورقة عبر الذكاء الاصطناعي. تأكد من جودة الصورة.',
      details: errorMessage 
    }, { status: 500 });
  }
}
