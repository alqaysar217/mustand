
import { NextRequest, NextResponse } from 'next/server';
import { extractExamDetails } from '@/ai/flows/extract-exam-details';

/**
 * @fileOverview مسار API مطور لاستدعاء نظام التحليل الذكي.
 */

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'مفتاح API الخاص بـ Google AI Studio مفقود. يرجى إضافته في ملف .env' 
      }, { status: 401 });
    }

    const body = await req.json();
    if (!body.examImageDataUri) {
      return NextResponse.json({ error: 'لم يتم إرسال أي صورة للتحليل.' }, { status: 400 });
    }

    // استدعاء الـ Flow
    const result = await extractExamDetails({ examImageDataUri: body.examImageDataUri });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('API Extract Error:', error);
    return NextResponse.json({ 
      error: error.message || 'حدث خطأ في محرك التحليل الذكي.'
    }, { status: 500 });
  }
}
