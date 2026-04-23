
import { NextRequest, NextResponse } from 'next/server';
import { extractExamDetails } from '@/ai/flows/extract-exam-details';

/**
 * @fileOverview مسار API لاستدعاء نظام التحليل الذكي.
 * يعمل كجسر بين الواجهة الأمامية و Genkit Flow.
 */

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === '') {
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

    if (!result || (!result.studentRegistrationId && !result.studentName)) {
      return NextResponse.json({ 
        error: 'فشل الذكاء الاصطناعي في استخراج بيانات واضحة من هذه الصورة. يرجى التأكد من أن رقم القيد والاسم ظاهران بوضوح.' 
      }, { status: 422 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('--- [API ROUTE CRASH] ---', error);
    
    // التعامل مع أخطاء جوجل الشائعة
    const errorMessage = error.message || '';
    if (errorMessage.includes('429')) {
      return NextResponse.json({ error: 'تم تجاوز حد الاستخدام المجاني (Rate Limit). يرجى المحاولة بعد دقيقة واحدة.' }, { status: 429 });
    }
    
    if (errorMessage.includes('403') || errorMessage.includes('API key')) {
      return NextResponse.json({ error: 'مفتاح الـ API غير صالح أو محظور. يرجى التأكد من صلاحية المفتاح في ملف .env' }, { status: 403 });
    }
    
    return NextResponse.json({ 
      error: 'حدث خطأ غير متوقع أثناء معالجة الورقة.',
      details: errorMessage 
    }, { status: 500 });
  }
}
