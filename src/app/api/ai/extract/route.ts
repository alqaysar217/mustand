
import { NextRequest, NextResponse } from 'next/server';
import { extractExamDetails } from '@/ai/flows/extract-exam-details';

/**
 * @fileOverview مسار API لاستدعاء نظام التحليل الذكي.
 */

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'مفتاح الـ API لـ Google AI Studio مفقود. يرجى إضافته في ملف .env لكي يعمل التحليل الذكي.' 
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
    console.error('--- [API ROUTE CRASH] ---', error);
    
    // التعامل مع أخطاء جوجل الشائعة
    const errorMessage = error.message || '';
    if (errorMessage.includes('429')) {
      return NextResponse.json({ error: 'تم تجاوز حد الاستخدام المجاني. يرجى المحاولة بعد دقيقة واحدة.' }, { status: 429 });
    }
    
    return NextResponse.json({ 
      error: 'حدث خطأ أثناء معالجة الورقة عبر الذكاء الاصطناعي.',
      details: errorMessage 
    }, { status: 500 });
  }
}
