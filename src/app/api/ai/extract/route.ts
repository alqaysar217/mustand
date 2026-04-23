
import { NextRequest, NextResponse } from 'next/server';
import { extractExamDetails } from '@/ai/flows/extract-exam-details';

/**
 * @fileOverview مسار API مطور لاستدعاء نظام التحليل الذكي مع تقارير أخطاء مفصلة.
 * يدعم استخدام مفتاح API من البيئة مباشرة.
 */

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'مفتاح الـ API لـ Google AI Studio مفقود في ملف .env. يرجى إضافته لكي يعمل التحليل الذكي.' 
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
    
    let errorMessage = error.message || 'حدث خطأ غير متوقع أثناء معالجة الورقة.';
    
    // التعامل مع أخطاء جوجل الشائعة
    if (errorMessage.includes('429')) {
      errorMessage = 'تم تجاوز حد الاستخدام المجاني المؤقت. يرجى الانتظار دقيقة والمحاولة مجدداً.';
    } else if (errorMessage.includes('API key not valid')) {
      errorMessage = 'مفتاح الـ API غير صالح. يرجى التحقق منه في ملف .env';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error.toString()
    }, { status: 500 });
  }
}
