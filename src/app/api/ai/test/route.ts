
import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';

/**
 * مسار مطور لتشخيص حالة مفتاح الـ API وإرجاع تفاصيل دقيقة عن المشروع المرتبط.
 */
export async function GET() {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: 'أجب بكلمة واحدة: متصل',
    });

    if (response.text) {
      return NextResponse.json({ 
        success: true, 
        message: 'تم الاتصال بنجاح! المفتاح شغال والمحرك مستعد للعمل.' 
      });
    }
    throw new Error('لم يتم تلقي رد من المحرك.');
  } catch (error: any) {
    console.error('API Test Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'فشل الاتصال بمحرك Gemini.',
      rawError: error.message || 'خطأ غير معروف في الـ API'
    }, { status: 500 });
  }
}
