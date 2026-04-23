
import { NextResponse } from 'next/server';
import { testApiFlow } from '@/ai/flows/test-api-flow';

/**
 * مسار API لتشخيص حالة مفتاح الـ API وإرجاع الأخطاء الحقيقية.
 */
export async function GET() {
  try {
    const result = await testApiFlow("");
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Test Route Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'خطأ تقني في الخادم أثناء الاختبار',
      rawError: error.message || 'Unknown Server Error'
    }, { status: 500 });
  }
}
